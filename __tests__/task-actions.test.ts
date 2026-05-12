/**
 * @jest-environment node
 *
 * task-actions.test.ts
 *
 * Unit tests for server actions in app/actions/task.actions.ts.
 * Updated to match current production code:
 * - Uses getUser() instead of getSession()
 * - deleteTask does NOT call Google Calendar API (removed)
 * - analyzeTaskWithAI uses checkAiLimit + getAiResponse (lib/ai-config)
 * - Error messages use "Unauthorized" (no trailing dot)
 */

import type { ActionResponse } from "@/types";

jest.mock("next/headers", () => ({
  cookies: jest.fn(async () => ({
    get: jest.fn(),
    getAll: jest.fn(() => []),
    set: jest.fn(),
  })),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// ─── Mock lib/gamification (used by toggleTaskStatus) ────────────────────────
const calculateXpMock = jest.fn().mockReturnValue({ earnedXp: 20, isEarlyBonus: false });
const calculateStreakMock = jest.fn().mockReturnValue({ newStreakCount: 3, newLastActiveDate: "2026-05-05" });

jest.mock("@/lib/gamification", () => ({
  calculateXp: (...args: unknown[]) => calculateXpMock(...args),
  calculateStreak: (...args: unknown[]) => calculateStreakMock(...args),
}));

// ─── Mock lib/ai-config (used by analyzeTaskWithAI & generateTaskBreakdown) ──
const getAiResponseMock = jest.fn();

jest.mock("@/lib/ai-config", () => ({
  getAiResponse: (...args: unknown[]) => getAiResponseMock(...args),
  aiClient: {},
  AI_MODELS: { PRIMARY_GENERATION: "gemini-2.5-flash", FALLBACK_GENERATION: "gemini-pro", EMBEDDING: "gemini-embedding-2" },
}));

// ─── Mock lib/limiter (used by analyzeTaskWithAI & generateTaskBreakdown) ────
const checkAiLimitMock = jest.fn().mockResolvedValue({ allowed: true, remaining: 9 });

jest.mock("@/lib/limiter", () => ({
  checkAiLimit: (...args: unknown[]) => checkAiLimitMock(...args),
}));

// ─── Supabase mock ────────────────────────────────────────────────────────────
type SupabaseMock = {
  auth: {
    getSession: jest.Mock;
    getUser: jest.Mock;
  };
  from: jest.Mock;
};

function makeAwaitable<T>(execMock: jest.Mock, result: T): Promise<T> {
  return {
    then: (resolve: (v: T) => void, reject: (e: unknown) => void) =>
      Promise.resolve()
        .then(() => execMock())
        .then(() => resolve(result), reject),
  } as unknown as Promise<T>;
}

function makeSupabaseMock(): SupabaseMock {
  return {
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
    },
    from: jest.fn(),
  };
}

const createClientMock = jest.fn();

jest.mock("@/utils/supabase/server", () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}));

// ─── Import after mocks ────────────────────────────────────────────────────────
import {
  createTask,
  deleteTask,
  toggleTaskStatus,
  saveSubTasks,
  analyzeTaskWithAI,
} from "@/app/actions/task.actions";

function makeFormData(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) fd.set(k, v);
  return fd;
}

describe("task.actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset AI limit mock to allowed by default
    checkAiLimitMock.mockResolvedValue({ allowed: true, remaining: 9 });
  });

  // ══════════════════════════════════════════════════════════════
  // createTask
  // ══════════════════════════════════════════════════════════════
  describe("createTask", () => {
    it("returns unauthorized when no user (getUser returns null)", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      createClientMock.mockReturnValue(supabase);

      const res = await createTask(
        makeFormData({
          title: "A",
          description: "",
          module_link: "",
          scheduled_time: new Date("2026-05-05T10:00:00.000Z").toISOString(),
          duration_estimate_minutes: "30",
        }),
      );

      expect(res).toEqual({ success: false, error: "Unauthorized" });
    });

    it("inserts task without google event when no provider token", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "u1" } },
      });

      const insertMock = jest.fn().mockResolvedValue({ error: null });
      supabase.from.mockImplementation((table: string) => {
        if (table === "tasks") return { insert: insertMock };
        throw new Error(`Unexpected table ${table}`);
      });
      createClientMock.mockReturnValue(supabase);

      const res = await createTask(
        makeFormData({
          title: "Study",
          description: "desc",
          module_link: "https://example.com",
          scheduled_time: "2026-05-05T10:00:00.000Z",
          duration_estimate_minutes: "60",
        }),
      );

      expect(res).toEqual({ success: true });
      expect(insertMock).toHaveBeenCalledTimes(1);
      const inserted = insertMock.mock.calls[0][0];
      expect(inserted.status).toBe("pending");
      expect(inserted.title).toBe("Study");
    });

    it("returns failure when insert fails", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "u1" } },
      });

      supabase.from.mockImplementation((table: string) => {
        if (table === "tasks")
          return { insert: jest.fn().mockResolvedValue({ error: { message: "db error" } }) };
        throw new Error(`Unexpected table ${table}`);
      });
      createClientMock.mockReturnValue(supabase);

      const res = await createTask(
        makeFormData({
          title: "Study",
          description: "",
          module_link: "",
          scheduled_time: "2026-05-05T10:00:00.000Z",
          duration_estimate_minutes: "60",
        }),
      );

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/db error/i);
    });
  });

  // ══════════════════════════════════════════════════════════════
  // deleteTask (no longer calls Google Calendar API)
  // ══════════════════════════════════════════════════════════════
  describe("deleteTask", () => {
    it("returns unauthorized when no user", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      createClientMock.mockReturnValue(supabase);

      const res = await deleteTask("t1");
      expect(res).toEqual({ success: false, error: "Unauthorized" });
    });

    it("deletes task from database and returns success", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "u1" } },
      });

      const deleteExecMock = jest.fn().mockResolvedValue({ error: null });
      supabase.from.mockImplementation((table: string) => {
        if (table === "tasks") {
          return {
            delete: () => ({
              eq: () => ({
                eq: deleteExecMock,
              }),
            }),
          };
        }
        throw new Error(`Unexpected table ${table}`);
      });
      createClientMock.mockReturnValue(supabase);

      const res = await deleteTask("t1");

      expect(deleteExecMock).toHaveBeenCalledTimes(1);
      expect(res).toEqual({ success: true });
    });

    it("returns error when db delete fails", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "u1" } },
      });

      supabase.from.mockImplementation((table: string) => {
        if (table === "tasks") {
          return {
            delete: () => ({
              eq: () => ({
                eq: jest.fn().mockResolvedValue({ error: { message: "Foreign key violation" } }),
              }),
            }),
          };
        }
        throw new Error(`Unexpected table ${table}`);
      });
      createClientMock.mockReturnValue(supabase);

      const res = await deleteTask("t1");
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/foreign key violation/i);
    });
  });

  // ══════════════════════════════════════════════════════════════
  // toggleTaskStatus
  // ══════════════════════════════════════════════════════════════
  describe("toggleTaskStatus", () => {
    it("returns unauthorized when no user", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      createClientMock.mockReturnValue(supabase);

      const res = await toggleTaskStatus("t1", "pending");
      // Current production code returns "Unauthorized" (no trailing dot)
      expect(res).toEqual({ success: false, error: "Unauthorized" });
    });

    it("toggles status from pending to done and updates xp/streak", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2026-05-05T10:00:00.000Z"));

      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } } });

      const taskSingleMock = jest.fn().mockResolvedValue({
        data: {
          scheduled_time: "2026-05-06T10:00:00.000Z",
          created_at: "2026-05-05T09:00:00.000Z",
          sub_tasks: null,
        },
      });

      const updateTaskExecMock = jest.fn().mockResolvedValue({ error: null });
      const userSingleMock = jest.fn().mockResolvedValue({
        data: { xp: 100, streak_count: 2, last_active_date: "2026-05-04" },
      });
      const updateUserExecMock = jest.fn().mockResolvedValue({ error: null });

      supabase.from.mockImplementation((table: string) => {
        if (table === "tasks") {
          return {
            select: () => ({
              eq: () => ({
                single: taskSingleMock,
              }),
            }),
            update: () => ({
              eq: () => ({
                eq: updateTaskExecMock,
              }),
            }),
          };
        }
        if (table === "users") {
          return {
            select: () => ({
              eq: () => ({
                single: userSingleMock,
              }),
            }),
            update: (payload: any) => {
              updateUserExecMock(payload);
              return { eq: jest.fn().mockResolvedValue({ error: null }) };
            },
          };
        }
        throw new Error(`Unexpected table ${table}`);
      });

      createClientMock.mockReturnValue(supabase);

      const res = await toggleTaskStatus("t1", "pending");

      expect(res).toEqual({ success: true });
      expect(updateTaskExecMock).toHaveBeenCalledTimes(1);
      expect(updateUserExecMock).toHaveBeenCalledTimes(1);

      // XP and streak should be updated
      const updatePayload = updateUserExecMock.mock.calls[0][0];
      expect(updatePayload.xp).toBeGreaterThan(100); // earnedXp > 0
      expect(updatePayload.streak_count).toBeGreaterThanOrEqual(1);

      jest.useRealTimers();
    });

    it("does NOT update xp/streak when toggling from done back to pending", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } } });

      const taskSingleMock = jest.fn().mockResolvedValue({
        data: { scheduled_time: "2026-05-06T10:00:00.000Z", sub_tasks: null },
      });
      const updateTaskExecMock = jest.fn().mockResolvedValue({ error: null });

      supabase.from.mockImplementation((table: string) => {
        if (table === "tasks") {
          return {
            select: () => ({ eq: () => ({ single: taskSingleMock }) }),
            update: () => ({ eq: () => ({ eq: updateTaskExecMock }) }),
          };
        }
        throw new Error(`Unexpected table ${table}`);
      });
      createClientMock.mockReturnValue(supabase);

      const res = await toggleTaskStatus("t1", "done"); // reverting to pending

      expect(res).toEqual({ success: true });
      // users table should NOT be touched
      expect(supabase.from.mock.calls.every((call: unknown[]) => call[0] !== "users")).toBe(true);
    });
  });

  // ══════════════════════════════════════════════════════════════
  // saveSubTasks
  // ══════════════════════════════════════════════════════════════
  describe("saveSubTasks", () => {
    it("returns unauthorized when no user", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      createClientMock.mockReturnValue(supabase);

      const res = await saveSubTasks("t1", []);
      expect(res).toEqual({ success: false, error: "Unauthorized" });
    });

    it("updates tasks.sub_tasks for current user", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } } });

      const updateExecMock = jest.fn().mockResolvedValue({ error: null });
      supabase.from.mockImplementation((table: string) => {
        if (table === "tasks") {
          return {
            update: () => ({
              eq: () => ({
                eq: updateExecMock,
              }),
            }),
          };
        }
        throw new Error(`Unexpected table ${table}`);
      });
      createClientMock.mockReturnValue(supabase);

      const res = await saveSubTasks("t1", [{ id: "s1", title: "a", done: false }]);
      expect(res).toEqual({ success: true });
      expect(updateExecMock).toHaveBeenCalledTimes(1);
    });
  });

  // ══════════════════════════════════════════════════════════════
  // analyzeTaskWithAI (now uses checkAiLimit + getAiResponse)
  // ══════════════════════════════════════════════════════════════
  describe("analyzeTaskWithAI", () => {
    it("returns parsed JSON from AI response", async () => {
      getAiResponseMock.mockResolvedValue('{"summary":"ok","estimatedMinutes":42}');

      const res = (await analyzeTaskWithAI("T", "D", "L")) as ActionResponse;
      expect(res.success).toBe(true);
      expect(res.data).toMatchObject({ summary: "ok", estimatedMinutes: 42 });
      expect(getAiResponseMock).toHaveBeenCalledTimes(1);
    });

    it("returns rate limit error when daily limit is reached", async () => {
      checkAiLimitMock.mockResolvedValue({ allowed: false, remaining: 0 });

      const res = (await analyzeTaskWithAI("T", "D", "L")) as ActionResponse;
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/limit/i);
    });

    it("returns error when AI response is null", async () => {
      getAiResponseMock.mockResolvedValue(null);

      const res = (await analyzeTaskWithAI("T", "D", "L")) as ActionResponse;
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/gagal/i);
    });

    it("returns error when AI response throws", async () => {
      getAiResponseMock.mockRejectedValue(new Error("API key invalid"));

      const res = (await analyzeTaskWithAI("T", "D", "L")) as ActionResponse;
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/api key invalid/i);
    });
  });
});
