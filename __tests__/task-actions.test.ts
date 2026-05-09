/**
 * task-actions.test.ts
 *
 * Unit tests for server actions in app/actions/task.actions.ts.
 * All external dependencies are mocked (Supabase, Next headers/cache, Google APIs, Gemini).
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

const createEventMock = jest.fn();
const deleteEventMock = jest.fn();
const updateEventMock = jest.fn();

jest.mock("@/lib/googleCalendar", () => ({
  createEvent: (...args: unknown[]) => createEventMock(...args),
  deleteEvent: (...args: unknown[]) => deleteEventMock(...args),
  updateEvent: (...args: unknown[]) => updateEventMock(...args),
}));

const generateContentMock = jest.fn();

jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: (...args: unknown[]) => generateContentMock(...args),
    },
  })),
}));

type SupabaseMock = {
  auth: {
    getSession: jest.Mock;
    getUser: jest.Mock;
  };
  from: jest.Mock;
  rpc?: jest.Mock;
};

function makeAwaitable<T>(execMock: jest.Mock, result: T, ...execArgs: unknown[]): Promise<T> {
  // Supabase query builders are thenables; execution happens when awaited.
  return {
    then: (resolve, reject) =>
      Promise.resolve()
        .then(() => execMock(...execArgs))
        .then(() => resolve(result), reject),
  } as unknown as Promise<T>;
}

function makeSupabaseMock(overrides?: Partial<SupabaseMock>): SupabaseMock {
  const supabase: SupabaseMock = {
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
    },
    from: jest.fn(),
  };
  return Object.assign(supabase, overrides);
}

const createClientMock = jest.fn();

jest.mock("@/utils/supabase/server", () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}));

// Import after mocks
import { createTask, deleteTask, toggleTaskStatus, saveSubTasks, analyzeTaskWithAI } from "@/app/actions/task.actions";

function makeFormData(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) fd.set(k, v);
  return fd;
}

describe("task.actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createTask", () => {
    it("returns unauthorized when no session user", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
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

      expect(res).toEqual({ success: false, error: "Unauthorized. Please log in." });
    });

    it("validates required fields", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: "u1" } } },
        error: null,
      });
      createClientMock.mockReturnValue(supabase);

      const res = await createTask(
        makeFormData({
          title: "",
          description: "",
          module_link: "",
          scheduled_time: "",
          duration_estimate_minutes: "x",
        }),
      );

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/required/i);
    });

    it("creates google calendar event when provider token exists, then inserts task with google_event_id", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: "u1" }, provider_token: "g-token" } },
        error: null,
      });

      const insertMock = jest.fn().mockResolvedValue({ error: null });
      supabase.from.mockImplementation((table: string) => {
        if (table === "tasks") return { insert: insertMock };
        throw new Error(`Unexpected table ${table}`);
      });

      createClientMock.mockReturnValue(supabase);
      createEventMock.mockResolvedValue({ id: "evt-123" });

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
      expect(createEventMock).toHaveBeenCalledTimes(1);
      expect(insertMock).toHaveBeenCalledTimes(1);

      const inserted = insertMock.mock.calls[0][0];
      expect(inserted.google_event_id).toBe("evt-123");
      expect(inserted.status).toBe("pending");
    });

    it("still inserts task when google calendar sync fails", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: "u1" }, provider_token: "g-token" } },
        error: null,
      });

      const insertMock = jest.fn().mockResolvedValue({ error: null });
      supabase.from.mockImplementation((table: string) => {
        if (table === "tasks") return { insert: insertMock };
        throw new Error(`Unexpected table ${table}`);
      });

      createClientMock.mockReturnValue(supabase);
      createEventMock.mockRejectedValue(new Error("boom"));

      const res = await createTask(
        makeFormData({
          title: "Study",
          description: "",
          module_link: "",
          scheduled_time: "2026-05-05T10:00:00.000Z",
          duration_estimate_minutes: "60",
        }),
      );

      expect(res).toEqual({ success: true });
      const inserted = insertMock.mock.calls[0][0];
      expect(inserted.google_event_id).toBe(null);
    });

    it("returns failure when insert fails", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: "u1" } } },
        error: null,
      });

      supabase.from.mockImplementation((table: string) => {
        if (table === "tasks") return { insert: jest.fn().mockResolvedValue({ error: { message: "db" } }) };
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
      expect(res.error).toMatch(/failed to create task/i);
    });
  });

  describe("deleteTask", () => {
    it("returns unauthorized when no user", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
      createClientMock.mockReturnValue(supabase);

      const res = await deleteTask("t1");
      expect(res).toEqual({ success: false, error: "Unauthorized." });
    });

    it("attempts to delete google event but still deletes DB task if google fails", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: "u1" }, provider_token: "g-token" } },
      });

      const selectSingleMock = jest.fn().mockResolvedValue({ data: { google_event_id: "evt-1" } });
      const deleteExecMock = jest.fn();

      supabase.from.mockImplementation((table: string) => {
        if (table === "tasks") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  single: selectSingleMock,
                }),
              }),
            }),
            delete: () => ({
              eq: () => ({
                eq: () => makeAwaitable(deleteExecMock, { error: null }),
              }),
            }),
          };
        }
        throw new Error(`Unexpected table ${table}`);
      });

      createClientMock.mockReturnValue(supabase);
      deleteEventMock.mockRejectedValue(new Error("nope"));

      const res = await deleteTask("t1");

      expect(deleteEventMock).toHaveBeenCalledTimes(1);
      expect(deleteExecMock).toHaveBeenCalledTimes(1);
      expect(res).toEqual({ success: true });
    });
  });

  describe("toggleTaskStatus", () => {
    it("returns unauthorized when no user", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      createClientMock.mockReturnValue(supabase);

      const res = await toggleTaskStatus("t1", "pending");
      expect(res).toEqual({ success: false, error: "Unauthorized." });
    });

    it("when marking done, updates users xp/streak using utils", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2026-05-05T10:00:00.000Z"));

      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } } });

      const taskSingleMock = jest.fn().mockResolvedValue({
        data: {
          scheduled_time: "2026-05-06T10:00:00.000Z",
          created_at: "2026-05-05T09:00:00.000Z",
        },
      });

      const updateTaskExecMock = jest.fn();
      const userSingleMock = jest.fn().mockResolvedValue({
        data: { xp: 100, streak_count: 2, last_active_date: "2026-05-04" },
      });
      const updateUserExecMock = jest.fn();

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
                eq: () => makeAwaitable(updateTaskExecMock, { error: null }),
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
            update: (payload: unknown) => ({
              eq: () => makeAwaitable(updateUserExecMock, { error: null }, payload),
            }),
          };
        }
        throw new Error(`Unexpected table ${table}`);
      });

      createClientMock.mockReturnValue(supabase);

      const res = await toggleTaskStatus("t1", "pending");

      expect(res).toEqual({ success: true });
      expect(updateTaskExecMock).toHaveBeenCalledTimes(1);
      expect(updateUserExecMock).toHaveBeenCalledTimes(1);

      const payload = updateUserExecMock.mock.calls[0][0];
      expect(payload.xp).toBeGreaterThan(100);
      expect(payload.streak_count).toBeGreaterThanOrEqual(1);
      expect(payload.last_active_date).toBe("2026-05-05");

      jest.useRealTimers();
    });
  });

  describe("saveSubTasks", () => {
    it("returns unauthorized when no user", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      createClientMock.mockReturnValue(supabase);

      const res = await saveSubTasks("t1", []);
      expect(res).toEqual({ success: false, error: "Unauthorized." });
    });

    it("updates tasks.sub_tasks for current user", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } } });

      const updateExecMock = jest.fn();
      supabase.from.mockImplementation((table: string) => {
        if (table === "tasks") {
          return {
            update: () => ({
              eq: () => ({
                eq: () => makeAwaitable(updateExecMock, { error: null }),
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

  describe("analyzeTaskWithAI", () => {
    it("returns parsed JSON from model response", async () => {
      generateContentMock.mockResolvedValue({ text: '{"summary":"ok","estimatedMinutes":42}' });

      const res = (await analyzeTaskWithAI("T", "D", "L")) as ActionResponse;
      expect(res.success).toBe(true);
      expect(res.data).toMatchObject({ summary: "ok", estimatedMinutes: 42 });
      expect(generateContentMock).toHaveBeenCalledTimes(1);
    });

    it("returns error when model throws", async () => {
      generateContentMock.mockRejectedValue(new Error("no key"));
      const res = (await analyzeTaskWithAI("T", "D", "L")) as ActionResponse;
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/no key/i);
    });
  });
});
