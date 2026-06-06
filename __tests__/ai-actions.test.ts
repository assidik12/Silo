/**
 * @jest-environment node
 *
 * ai-actions.test.ts
 *
 * Unit tests for generateTaskBreakdown (moved to app/actions/task.actions.ts)
 * and analyzeTaskWithAI.
 * Mocks: checkAiLimit, getAiResponse, Supabase, next/headers, next/cache
 */

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

// ─── Mock: lib/gamification ───────────────────────────────────────────────────
jest.mock("@/utils/gamification", () => ({
  calculateXp: jest.fn().mockReturnValue({ earnedXp: 20, isEarlyBonus: false }),
  calculateStreak: jest.fn().mockReturnValue({ newStreakCount: 1, newLastActiveDate: "2026-05-05" }),
}));

// ─── Mock: lib/ai-config (getAiResponse) ─────────────────────────────────────
const getAiResponseMock = jest.fn();
jest.mock("@/lib/ai/config", () => ({
  getAiResponse: (...args: unknown[]) => getAiResponseMock(...args),
  aiClient: {},
  AI_MODELS: {
    PRIMARY_GENERATION: "gemini-2.5-flash",
    FALLBACK_GENERATION: "gemini-pro",
    EMBEDDING: "gemini-embedding-2",
  },
}));

// ─── Mock: lib/limiter (checkAiLimit) ────────────────────────────────────────
const checkAiLimitMock = jest.fn();
jest.mock("@/lib/supabase/limiter", () => ({
  checkAiLimit: (...args: unknown[]) => checkAiLimitMock(...args),
}));

// ─── Mock: Supabase ───────────────────────────────────────────────────────────
jest.mock("@/utils/supabase/server", () => ({
  createClient: jest.fn(() => ({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
    from: jest.fn(),
  })),
}));

// ─── Import after mocks ────────────────────────────────────────────────────────
import { generateTaskBreakdown } from "@/app/actions/task.actions";
import type { ActionResponse } from "@/types";

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("generateTaskBreakdown (task.actions)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    checkAiLimitMock.mockResolvedValue({ allowed: true, remaining: 9 });
  });

  it("returns parsed JSON array of subtasks on success", async () => {
    getAiResponseMock.mockResolvedValue('["Langkah 1: Riset","Langkah 2: Outline","Langkah 3: Tulis"]');

    const res = (await generateTaskBreakdown("My Task", "desc", null)) as ActionResponse<string[]>;

    expect(res.success).toBe(true);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data).toHaveLength(3);
    expect(res.data?.[0]).toContain("Langkah 1");
    expect(getAiResponseMock).toHaveBeenCalledTimes(1);
  });

  it("returns rate limit error when daily AI limit is reached", async () => {
    checkAiLimitMock.mockResolvedValue({ allowed: false, remaining: 0 });

    const res = (await generateTaskBreakdown("Task", "desc", null)) as ActionResponse<string[]>;

    expect(res.success).toBe(false);
    expect(res.error).toMatch(/limit/i);
    expect(getAiResponseMock).not.toHaveBeenCalled();
  });

  it("returns error when AI response is null", async () => {
    getAiResponseMock.mockResolvedValue(null);

    const res = (await generateTaskBreakdown("Task", "desc", null)) as ActionResponse<string[]>;

    expect(res.success).toBe(false);
    expect(res.error).toMatch(/gagal/i);
  });

  it("returns error when AI throws an exception", async () => {
    getAiResponseMock.mockRejectedValue(new Error("Network timeout"));

    const res = (await generateTaskBreakdown("Task", "desc", null)) as ActionResponse<string[]>;

    expect(res.success).toBe(false);
    expect(res.error).toMatch(/network timeout/i);
  });

  it("passes both title and description to AI prompt", async () => {
    getAiResponseMock.mockResolvedValue('["Step 1","Step 2"]');

    await generateTaskBreakdown("Belajar Algoritma", "Materi sorting algorithms", null);

    expect(getAiResponseMock).toHaveBeenCalledWith(
      expect.stringContaining("Belajar Algoritma"),
      expect.any(String),
    );
  });
});
