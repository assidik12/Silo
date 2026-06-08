/**
 * @jest-environment node
 *
 * user-actions.test.ts
 *
 * Unit tests for app/actions/user.actions.ts
 * Covers Q3 Phase 1.2: Full Profile & Preference Edit
 * Mocks: Supabase, next/headers, next/cache, task.actions (createWelcomeTasks)
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
const revalidatePathMock = jest.fn();
jest.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => revalidatePathMock(...args),
}));

// ─── Mock: createWelcomeTasks (dependency of user.actions) ──────────────────
const createWelcomeTasksMock = jest.fn().mockResolvedValue({ success: true });
jest.mock("@/app/actions/task.actions", () => ({
  createWelcomeTasks: (...args: unknown[]) => createWelcomeTasksMock(...args),
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
  updateUserProfile,
  getUserProfile,
} from "@/app/actions/user.actions";

// ─── Test payload helper ──────────────────────────────────────────────────────
const validProfilePayload = {
  name: "Budi Santoso",
  major: "Teknik Informatika",
  productive_hours: "09:00",
  interests: "AI, Coding, Musik",
  learning_type: "ngebut" as const,
  bio: "Mahasiswa semester 5 yang suka ngoding.",
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("user.actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ══════════════════════════════════════════════════════════════
  // updateUserProfile (Q3 Phase 1.2 - Full Profile Edit)
  // ══════════════════════════════════════════════════════════════
  describe("updateUserProfile", () => {
    it("returns unauthorized when user is not logged in", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      createClientMock.mockReturnValue(supabase);

      const res = await updateUserProfile(validProfilePayload);

      expect(res).toEqual({ success: false, error: "Unauthorized" });
    });

    it("upserts profile with all fields for existing user (onboarding already completed)", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1", email: "budi@test.com" } },
      });

      const existingUserMock = jest.fn().mockResolvedValue({
        data: { onboarding_completed: true },
        error: null,
      });
      const upsertMock = jest.fn().mockResolvedValue({ error: null });

      supabase.from.mockImplementation((table: string) => {
        if (table === "users") {
          return {
            select: () => ({
              eq: () => ({ single: existingUserMock }),
            }),
            upsert: upsertMock,
          };
        }
        throw new Error(`Unexpected table: ${table}`);
      });
      createClientMock.mockReturnValue(supabase);

      const res = await updateUserProfile(validProfilePayload);

      expect(res).toEqual({ success: true });
      expect(upsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "user-1",
          email: "budi@test.com",
          name: "Budi Santoso",
          major: "Teknik Informatika",
          learning_type: "ngebut",
          onboarding_completed: true,
        }),
      );
    });

    it("calls createWelcomeTasks only on first-time onboarding", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "new-user-1", email: "new@test.com" } },
      });

      const existingUserMock = jest.fn().mockResolvedValue({
        data: { onboarding_completed: false }, // first time
        error: null,
      });
      const upsertMock = jest.fn().mockResolvedValue({ error: null });

      supabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({ single: existingUserMock }),
        }),
        upsert: upsertMock,
      }));
      createClientMock.mockReturnValue(supabase);

      const res = await updateUserProfile(validProfilePayload);

      expect(res.success).toBe(true);
      expect(createWelcomeTasksMock).toHaveBeenCalledTimes(1);
      expect(createWelcomeTasksMock).toHaveBeenCalledWith("new-user-1");
    });

    it("does NOT call createWelcomeTasks when onboarding was already completed", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "old-user-1", email: "old@test.com" } },
      });

      const existingUserMock = jest.fn().mockResolvedValue({
        data: { onboarding_completed: true },
        error: null,
      });
      const upsertMock = jest.fn().mockResolvedValue({ error: null });

      supabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({ single: existingUserMock }),
        }),
        upsert: upsertMock,
      }));
      createClientMock.mockReturnValue(supabase);

      await updateUserProfile(validProfilePayload);

      expect(createWelcomeTasksMock).not.toHaveBeenCalled();
    });

    it("revalidates dashboard and profile paths on success", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1", email: "u@test.com" } },
      });
      supabase.from.mockImplementation(() => ({
        select: () => ({ eq: () => ({ single: jest.fn().mockResolvedValue({ data: { onboarding_completed: true } }) }) }),
        upsert: jest.fn().mockResolvedValue({ error: null }),
      }));
      createClientMock.mockReturnValue(supabase);

      await updateUserProfile(validProfilePayload);

      expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard");
      expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard/profile");
    });

    it("returns error when upsert fails", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1", email: "u@test.com" } },
      });
      supabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            single: jest.fn().mockResolvedValue({ data: { onboarding_completed: true } }),
          }),
        }),
        upsert: jest.fn().mockResolvedValue({ error: { message: "unique constraint violation" } }),
      }));
      createClientMock.mockReturnValue(supabase);

      const res = await updateUserProfile(validProfilePayload);

      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });

    it("sets bio to null when bio is empty string", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1", email: "u@test.com" } },
      });

      const upsertMock = jest.fn().mockResolvedValue({ error: null });
      supabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            single: jest.fn().mockResolvedValue({ data: { onboarding_completed: true } }),
          }),
        }),
        upsert: upsertMock,
      }));
      createClientMock.mockReturnValue(supabase);

      await updateUserProfile({ ...validProfilePayload, bio: "" });

      const upserted = upsertMock.mock.calls[0][0];
      expect(upserted.bio).toBeNull();
    });

    it("accepts 'santai' as a valid learning_type", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1", email: "u@test.com" } },
      });

      const upsertMock = jest.fn().mockResolvedValue({ error: null });
      supabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            single: jest.fn().mockResolvedValue({ data: { onboarding_completed: true } }),
          }),
        }),
        upsert: upsertMock,
      }));
      createClientMock.mockReturnValue(supabase);

      const res = await updateUserProfile({ ...validProfilePayload, learning_type: "santai" });
      expect(res.success).toBe(true);

      const upserted = upsertMock.mock.calls[0][0];
      expect(upserted.learning_type).toBe("santai");
    });
  });

  // ══════════════════════════════════════════════════════════════
  // getUserProfile
  // ══════════════════════════════════════════════════════════════
  describe("getUserProfile", () => {
    it("returns unauthorized when no user session", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      createClientMock.mockReturnValue(supabase);

      const res = await getUserProfile();
      expect(res).toEqual({ success: false, error: "Unauthorized" });
    });

    it("returns user profile data on success", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
      });

      const profileData = {
        id: "user-1",
        name: "Budi",
        major: "Informatika",
        learning_type: "ngebut",
        xp: 350,
        streak_count: 7,
      };

      const singleMock = jest.fn().mockResolvedValue({ data: profileData, error: null });
      supabase.from.mockImplementation((table: string) => {
        if (table === "users") {
          return {
            select: () => ({
              eq: () => ({ single: singleMock }),
            }),
          };
        }
        throw new Error(`Unexpected table: ${table}`);
      });
      createClientMock.mockReturnValue(supabase);

      const res = (await getUserProfile()) as ActionResponse<typeof profileData>;

      expect(res.success).toBe(true);
      expect(res.data).toMatchObject({ id: "user-1", name: "Budi", xp: 350 });
    });

    it("returns error when supabase query fails", async () => {
      const supabase = makeSupabaseMock();
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
      });

      supabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            single: jest.fn().mockResolvedValue({ data: null, error: { message: "Row not found" } }),
          }),
        }),
      }));
      createClientMock.mockReturnValue(supabase);

      const res = await getUserProfile();

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/row not found/i);
    });
  });
});
