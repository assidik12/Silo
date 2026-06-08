/**
 * @jest-environment node
 *
 * rate-limiter.test.ts
 *
 * Unit tests for lib/limiter.ts
 * Covers Q3 Phase 3.1: Rate Limiting LLM
 * Mocks: Supabase, next/headers (cookies)
 */

// ─── Mock: next/headers ────────────────────────────────────────────────────────
jest.mock("next/headers", () => ({
  cookies: jest.fn(async () => ({
    get: jest.fn(),
    getAll: jest.fn(() => []),
    set: jest.fn(),
  })),
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
import { checkAiLimit } from "@/lib/supabase/limiter";

// ─── Constants ────────────────────────────────────────────────────────────────
const DAILY_LIMIT = 10; // must match lib/limiter.ts

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("lib/limiter - checkAiLimit (Q3 Phase 3.1: Rate Limiting AI)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("returns allowed: false, remaining: 0 when no user session", async () => {
    const supabase = makeSupabaseMock();
    supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    createClientMock.mockReturnValue(supabase);

    const result = await checkAiLimit();

    expect(result).toEqual({ allowed: false, remaining: 0 });
  });

  it("returns allowed: true with full remaining when user record does not exist", async () => {
    const supabase = makeSupabaseMock();
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });

    const singleMock = jest.fn().mockResolvedValue({
      data: null,
      error: { code: "PGRST116", message: "No rows" },
    });
    supabase.from.mockImplementation(() => ({
      select: () => ({
        eq: () => ({ single: singleMock }),
      }),
    }));
    createClientMock.mockReturnValue(supabase);

    const result = await checkAiLimit();

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(DAILY_LIMIT);
  });

  it("resets counter and allows request on a new UTC day", async () => {
    jest.useFakeTimers();
    // Set current time to 2026-05-12 08:00 UTC
    jest.setSystemTime(new Date("2026-05-12T08:00:00.000Z"));

    const supabase = makeSupabaseMock();
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });

    const updateEqMock = jest.fn().mockResolvedValue({ error: null });
    const singleMock = jest.fn().mockResolvedValue({
      data: {
        ai_usage_count: 9, // was almost at limit
        last_ai_reset_at: "2026-05-11T20:00:00.000Z", // yesterday
      },
      error: null,
    });

    supabase.from.mockImplementation(() => ({
      select: () => ({
        eq: () => ({ single: singleMock }),
      }),
      update: () => ({
        eq: updateEqMock,
      }),
    }));
    createClientMock.mockReturnValue(supabase);

    const result = await checkAiLimit();

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(DAILY_LIMIT - 1); // reset to 1 usage
    expect(updateEqMock).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  it("blocks request when daily limit is reached on the same day", async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-05-12T14:00:00.000Z"));

    const supabase = makeSupabaseMock();
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-2" } },
    });

    const singleMock = jest.fn().mockResolvedValue({
      data: {
        ai_usage_count: DAILY_LIMIT, // exactly at limit
        last_ai_reset_at: "2026-05-12T00:00:00.000Z", // same day
      },
      error: null,
    });

    supabase.from.mockImplementation(() => ({
      select: () => ({
        eq: () => ({ single: singleMock }),
      }),
    }));
    createClientMock.mockReturnValue(supabase);

    const result = await checkAiLimit();

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);

    jest.useRealTimers();
  });

  it("allows request and increments counter within limit on same day", async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-05-12T10:00:00.000Z"));

    const supabase = makeSupabaseMock();
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-3" } },
    });

    const currentUsage = 3;
    const singleMock = jest.fn().mockResolvedValue({
      data: {
        ai_usage_count: currentUsage,
        last_ai_reset_at: "2026-05-12T00:00:00.000Z", // same day
      },
      error: null,
    });

    const updateEqMock = jest.fn().mockResolvedValue({ error: null });
    supabase.from.mockImplementation(() => ({
      select: () => ({
        eq: () => ({ single: singleMock }),
      }),
      update: () => ({
        eq: updateEqMock,
      }),
    }));
    createClientMock.mockReturnValue(supabase);

    const result = await checkAiLimit();

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(DAILY_LIMIT - (currentUsage + 1));
    expect(updateEqMock).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  it("allows request when usage is exactly 1 below daily limit", async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-05-12T10:00:00.000Z"));

    const supabase = makeSupabaseMock();
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-4" } },
    });

    const singleMock = jest.fn().mockResolvedValue({
      data: {
        ai_usage_count: DAILY_LIMIT - 1, // one before the limit
        last_ai_reset_at: "2026-05-12T00:00:00.000Z",
      },
      error: null,
    });

    supabase.from.mockImplementation(() => ({
      select: () => ({
        eq: () => ({ single: singleMock }),
      }),
      update: () => ({ eq: jest.fn().mockResolvedValue({ error: null }) }),
    }));
    createClientMock.mockReturnValue(supabase);

    const result = await checkAiLimit();

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0); // will hit limit after this call

    jest.useRealTimers();
  });

  it("correctly detects new day across month boundary", async () => {
    jest.useFakeTimers();
    // April 30 → May 1 transition
    jest.setSystemTime(new Date("2026-05-01T00:01:00.000Z"));

    const supabase = makeSupabaseMock();
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-5" } },
    });

    const updateEqMock = jest.fn().mockResolvedValue({ error: null });
    const singleMock = jest.fn().mockResolvedValue({
      data: {
        ai_usage_count: 8,
        last_ai_reset_at: "2026-04-30T22:00:00.000Z", // yesterday (April 30)
      },
      error: null,
    });

    supabase.from.mockImplementation(() => ({
      select: () => ({
        eq: () => ({ single: singleMock }),
      }),
      update: () => ({ eq: updateEqMock }),
    }));
    createClientMock.mockReturnValue(supabase);

    const result = await checkAiLimit();

    // New day → reset and allow
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(DAILY_LIMIT - 1);
    expect(updateEqMock).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  it("correctly detects new day across year boundary", async () => {
    jest.useFakeTimers();
    // Dec 31, 2025 → Jan 1, 2026
    jest.setSystemTime(new Date("2026-01-01T00:00:01.000Z"));

    const supabase = makeSupabaseMock();
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-6" } },
    });

    const updateEqMock = jest.fn().mockResolvedValue({ error: null });
    const singleMock = jest.fn().mockResolvedValue({
      data: {
        ai_usage_count: 10,
        last_ai_reset_at: "2025-12-31T23:00:00.000Z",
      },
      error: null,
    });

    supabase.from.mockImplementation(() => ({
      select: () => ({
        eq: () => ({ single: singleMock }),
      }),
      update: () => ({ eq: updateEqMock }),
    }));
    createClientMock.mockReturnValue(supabase);

    const result = await checkAiLimit();

    expect(result.allowed).toBe(true);
    expect(updateEqMock).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });
});
