/**
 * @jest-environment node
 *
 * feedback-actions.test.ts
 *
 * Unit tests for app/actions/feedback.actions.ts
 * Covers Q3 Phase 1.1: Export Feedback JSON
 * Mocks: Supabase, next/headers, next/cache
 */

import type { ActionResponse } from "@/types";

// ─── Mock: next/headers ────────────────────────────────────────────────────────
jest.mock("next/headers", () => ({
  cookies: jest.fn(async () => ({
    get: jest.fn(),
    getAll: jest.fn(() => []),
    set: jest.fn(),
  })),
}));

// ─── Mock: next/cache ─────────────────────────────────────────────────────────
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// ─── Supabase mock factory ─────────────────────────────────────────────────────
type SupabaseMock = {
  auth: { getUser: jest.Mock };
  from: jest.Mock;
};

function makeSupabaseMock(): SupabaseMock {
  return {
    auth: { getUser: jest.fn() },
    from: jest.fn(),
  };
}

const createClientMock = jest.fn();
jest.mock("@/utils/supabase/server", () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}));

// ─── Import after mocks ────────────────────────────────────────────────────────
import {
  sendFeedback,
  getAllFeedback,
  checkTaskMilestone,
} from "@/app/actions/feedback.actions";

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("feedback.actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ══════════════════════════════════════════════════════════════
  // sendFeedback
  // ══════════════════════════════════════════════════════════════
  describe("sendFeedback", () => {
    it("returns unauthorized when user is not logged in", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      createClientMock.mockReturnValue(supabase);

      const res = await sendFeedback({ type: "general", message: "test" });

      expect(res).toEqual({ success: false, error: "Unauthorized" });
    });

    it("inserts feedback and returns success for authenticated user", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
      });

      const insertMock = jest.fn().mockResolvedValue({ error: null });
      supabase.from.mockImplementation((table: string) => {
        if (table === "feedback") return { insert: insertMock };
        throw new Error(`Unexpected table: ${table}`);
      });
      createClientMock.mockReturnValue(supabase);

      const res = await sendFeedback({
        type: "general",
        category: "idea",
        message: "I love this app!",
        rating: 5,
        metadata: { source: "dashboard" },
      });

      expect(res).toEqual({ success: true });
      expect(insertMock).toHaveBeenCalledTimes(1);
      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: "user-1",
          type: "general",
          category: "idea",
          message: "I love this app!",
          rating: 5,
        }),
      );
    });

    it("returns error object when supabase insert fails", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
      });

      const insertMock = jest
        .fn()
        .mockResolvedValue({ error: { message: "DB constraint violation" } });
      supabase.from.mockImplementation(() => ({ insert: insertMock }));
      createClientMock.mockReturnValue(supabase);

      const res = await sendFeedback({ type: "bug" as "general" });

      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });

    it("uses empty object for metadata when not provided", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
      });

      const insertMock = jest.fn().mockResolvedValue({ error: null });
      supabase.from.mockImplementation(() => ({ insert: insertMock }));
      createClientMock.mockReturnValue(supabase);

      await sendFeedback({ type: "general" });

      const inserted = insertMock.mock.calls[0][0];
      expect(inserted.metadata).toEqual({});
    });
  });

  // ══════════════════════════════════════════════════════════════
  // getAllFeedback (Export Feedback JSON – Q3 Phase 1.1)
  // ══════════════════════════════════════════════════════════════
  describe("getAllFeedback", () => {
    it("returns unauthorized for non-admin user", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1", email: "student@example.com" } },
      });
      createClientMock.mockReturnValue(supabase);

      // Set admin email to a different address
      process.env.NEXT_PUBLIC_ADMIN_EMAIL = "admin@dojo.app";

      const res = await getAllFeedback();

      expect(res).toEqual({ success: false, error: "Unauthorized" });
    });

    it("returns unauthorized when user is not logged in", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      createClientMock.mockReturnValue(supabase);

      const res = await getAllFeedback();
      expect(res.success).toBe(false);
    });

    it("returns all feedback data for admin user", async () => {
      const adminEmail = "admin@dojo.app";
      process.env.NEXT_PUBLIC_ADMIN_EMAIL = adminEmail;

      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "admin-1", email: adminEmail } },
      });

      const mockFeedbackData = [
        { id: "f1", type: "general", message: "Great app!", rating: 5 },
        { id: "f2", type: "bug", message: "Found a bug", rating: null },
      ];

      const orderMock = jest.fn().mockResolvedValue({
        data: mockFeedbackData,
        error: null,
      });
      const selectMock = jest.fn().mockReturnValue({ order: orderMock });
      supabase.from.mockImplementation((table: string) => {
        if (table === "feedback") return { select: selectMock };
        throw new Error(`Unexpected table: ${table}`);
      });
      createClientMock.mockReturnValue(supabase);

      const res = (await getAllFeedback()) as ActionResponse<unknown[]>;

      expect(res.success).toBe(true);
      expect(res.data).toHaveLength(2);
      expect(res.data?.[0]).toMatchObject({ id: "f1", type: "general" });
    });

    it("returns error when supabase query fails", async () => {
      const adminEmail = "admin@dojo.app";
      process.env.NEXT_PUBLIC_ADMIN_EMAIL = adminEmail;

      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "admin-1", email: adminEmail } },
      });

      const orderMock = jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: "Connection lost" } });
      supabase.from.mockImplementation(() => ({
        select: () => ({ order: orderMock }),
      }));
      createClientMock.mockReturnValue(supabase);

      const res = await getAllFeedback();

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/connection lost/i);
    });
  });

  // ══════════════════════════════════════════════════════════════
  // checkTaskMilestone
  // ══════════════════════════════════════════════════════════════
  describe("checkTaskMilestone", () => {
    it("returns shouldShow: false when user is not logged in", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      createClientMock.mockReturnValue(supabase);

      const res = await checkTaskMilestone();
      expect(res).toEqual({ shouldShow: false });
    });

    it("returns shouldShow: true when user has >= 5 done tasks and no milestone feedback yet", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
      });

      const feedbackSingleMock = jest
        .fn()
        .mockResolvedValue({ data: null, error: { code: "PGRST116" } });

      supabase.from.mockImplementation((table: string) => {
        if (table === "tasks") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => Promise.resolve({ count: 5, error: null }),
              }),
            }),
          };
        }
        if (table === "feedback") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({ single: feedbackSingleMock }),
              }),
            }),
          };
        }
        throw new Error(`Unexpected table: ${table}`);
      });
      createClientMock.mockReturnValue(supabase);

      const res = await checkTaskMilestone();
      expect(res).toHaveProperty("shouldShow");
      expect(typeof res.shouldShow).toBe("boolean");
    });

    it("returns shouldShow: false on supabase error", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
      });
      supabase.from.mockImplementation(() => {
        throw new Error("Network error");
      });
      createClientMock.mockReturnValue(supabase);

      const res = await checkTaskMilestone();
      expect(res).toEqual({ shouldShow: false });
    });
  });
});
