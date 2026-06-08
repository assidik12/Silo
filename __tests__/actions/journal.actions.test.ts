/**
 * @jest-environment node
 */
import {
  createJournalEntry,
  getRecentSentiment,
  deleteJournalEntry,
  updateJournalEntry,
} from "@/app/actions/journal.actions";

// ── Mocks ────────────────────────────────────────────────────────────────────
jest.mock("next/headers", () => ({
  cookies: jest.fn().mockResolvedValue({}),
}));

jest.mock("@/utils/supabase/server", () => ({
  createClient: jest.fn(),
}));

jest.mock("@/lib/ai/journaling", () => ({
  generateJournalReflection: jest.fn(),
}));

import { createClient } from "@/utils/supabase/server";
import { generateJournalReflection } from "@/lib/ai/journaling";

const mockCreateClient = createClient as jest.Mock;
const mockGenerateReflection = generateJournalReflection as jest.Mock;

// ── Shared fixtures ───────────────────────────────────────────────────────────
const MOCK_USER = { id: "user-abc-123" };
const MOCK_ENTRY = {
  id: "entry-001",
  user_id: MOCK_USER.id,
  raw_text: "Hari ini capek",
  ai_reflection: "Kamu sudah lakukan yang terbaik!",
  sentiment_score: 7,
  created_at: new Date().toISOString(),
};
const MOCK_PROFILE = { name: "Andi", major: "TI", semester: 6, ai_persona: "mindful" };
const AI_RESPONSE = { reflection: "Refleksi ok", sentiment_score: 7 };

// ── Helper: build a fresh supabase mock ──────────────────────────────────────
function setupSupabase(overrides: {
  user?: typeof MOCK_USER | null;
  countResponse?: { count: number | null; error: object | null };
  profileResponse?: { data: object | null; error: object | null };
  aiResponse?: object | null;
  insertResponse?: { data: object | null; error: object | null };
  selectResponse?: { data: object[] | null; error: object | null };
  deleteResponse?: { error: object | null };
  updateResponse?: { data: object | null; error: object | null };
} = {}) {
  const {
    user = MOCK_USER,
    countResponse = { count: 0, error: null },
    profileResponse = { data: MOCK_PROFILE, error: null },
    aiResponse = AI_RESPONSE,
    insertResponse = { data: MOCK_ENTRY, error: null },
    selectResponse = { data: [MOCK_ENTRY], error: null },
    deleteResponse = { error: null },
    updateResponse = { data: MOCK_ENTRY, error: null },
  } = overrides;

  // Set AI mock
  if (aiResponse === null) {
    mockGenerateReflection.mockResolvedValue(null);
  } else {
    mockGenerateReflection.mockResolvedValue(aiResponse);
  }

  // Build supabase-like object with proper chaining
  const supabase = {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user } }),
    },
    from: jest.fn().mockImplementation((table: string) => {
      if (table === "journal_entries") {
        return {
          select: jest.fn().mockImplementation((_fields: string, opts?: Record<string, unknown>) => {
            // head:true = count query
            if (opts?.head) {
              return {
                eq: jest.fn().mockReturnThis(),
                neq: jest.fn().mockReturnThis(),
                gte: jest.fn().mockResolvedValue(countResponse),
              };
            }
            // Regular select
            return {
              eq: jest.fn().mockReturnThis(),
              order: jest.fn().mockReturnThis(),
              limit: jest.fn().mockResolvedValue(selectResponse),
              single: jest.fn().mockResolvedValue(selectResponse),
            };
          }),
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue(insertResponse),
            }),
          }),
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue(deleteResponse),
            }),
          }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue(updateResponse),
                }),
              }),
            }),
          }),
        };
      }

      if (table === "users") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue(profileResponse),
            }),
          }),
        };
      }

      return {};
    }),
  };

  mockCreateClient.mockReturnValue(supabase);
  return supabase;
}

beforeEach(() => jest.clearAllMocks());

// ──────────────────────────────────────────────────────────────────────────────
// createJournalEntry
// ──────────────────────────────────────────────────────────────────────────────
describe("createJournalEntry()", () => {
  // JA-01
  it("JA-01: User tidak login → { success: false, error: 'Not authenticated' }", async () => {
    setupSupabase({ user: null });
    const result = await createJournalEntry("text");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Not authenticated");
  });

  // JA-04
  it("JA-04: Rate limit tercapai (count = 2) → success: false + pesan limit", async () => {
    setupSupabase({ countResponse: { count: 2, error: null } });
    const result = await createJournalEntry("text");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Limit tercapai/);
  });

  // JA-05
  it("JA-05: count = 3 (melebihi batas) → tetap ditolak", async () => {
    setupSupabase({ countResponse: { count: 3, error: null } });
    const result = await createJournalEntry("text");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Limit tercapai/);
  });

  // JA-06
  it("JA-06: DB error saat cek limit → { success: false, error: 'Failed to check limits' }", async () => {
    setupSupabase({ countResponse: { count: null, error: { message: "DB Error" } } });
    const result = await createJournalEntry("text");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to check limits");
  });

  // JA-07
  it("JA-07: Error saat ambil profil → { success: false, error: 'Failed to fetch profile' }", async () => {
    setupSupabase({
      countResponse: { count: 0, error: null },
      profileResponse: { data: null, error: { message: "Profile error" } },
    });
    const result = await createJournalEntry("text");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to fetch profile");
  });

  // JA-08: Override persona
  it("JA-08: overridePersona='savage' → generateJournalReflection dipanggil dengan persona savage", async () => {
    setupSupabase({ countResponse: { count: 0, error: null } });
    await createJournalEntry("text", "savage");
    expect(mockGenerateReflection).toHaveBeenCalledWith(
      expect.objectContaining({ ai_persona: "savage" }),
      "text"
    );
  });

  // JA-10
  it("JA-10: AI gagal (return null) → { success: false, error: 'AI gagal merespons...' }", async () => {
    setupSupabase({ countResponse: { count: 0, error: null }, aiResponse: null });
    const result = await createJournalEntry("text");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/AI gagal/);
  });

  // JA-11
  it("JA-11: Happy Path — semua sukses → { success: true, data: newEntry }", async () => {
    setupSupabase({ countResponse: { count: 0, error: null } });
    const result = await createJournalEntry("text");
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({ id: MOCK_ENTRY.id });
  });

  // JA-12
  it("JA-12: DB insert error → { success: false, error: 'Gagal menyimpan jurnal' }", async () => {
    setupSupabase({
      countResponse: { count: 0, error: null },
      insertResponse: { data: null, error: { message: "insert error" } },
    });
    const result = await createJournalEntry("text");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Gagal menyimpan/);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// getRecentSentiment
// ──────────────────────────────────────────────────────────────────────────────
describe("getRecentSentiment()", () => {
  // JA-13
  it("JA-13: User tidak login → { success: false, error: 'Not authenticated' }", async () => {
    setupSupabase({ user: null });
    const result = await getRecentSentiment();
    expect(result.success).toBe(false);
    expect(result.error).toBe("Not authenticated");
  });

  // JA-14: Belum pernah jurnal → default score 5
  it("JA-14: Tidak ada jurnal (data kosong) → { success: true, data: 5 }", async () => {
    setupSupabase({ selectResponse: { data: [], error: null } });
    const result = await getRecentSentiment();
    expect(result.success).toBe(true);
    expect(result.data).toBe(5);
  });

  // JA-15
  it("JA-15: Ada entri dengan sentiment_score 8 → { success: true, data: 8 }", async () => {
    setupSupabase({ selectResponse: { data: [{ sentiment_score: 8 }], error: null } });
    const result = await getRecentSentiment();
    expect(result.success).toBe(true);
    expect(result.data).toBe(8);
  });

  // JA-16
  it("JA-16: DB error → { success: false, error: 'Gagal mengambil data sentimen' }", async () => {
    setupSupabase({ selectResponse: { data: null, error: { message: "DB error" } } });
    const result = await getRecentSentiment();
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Gagal mengambil/);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// deleteJournalEntry
// ──────────────────────────────────────────────────────────────────────────────
describe("deleteJournalEntry()", () => {
  // JA-17
  it("JA-17: User tidak login → { success: false, error: 'Not authenticated' }", async () => {
    setupSupabase({ user: null });
    const result = await deleteJournalEntry("entry-001");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Not authenticated");
  });

  // JA-19
  it("JA-19: Hapus berhasil → { success: true }", async () => {
    setupSupabase({ deleteResponse: { error: null } });
    const result = await deleteJournalEntry("entry-001");
    expect(result.success).toBe(true);
  });

  // JA-20
  it("JA-20: DB error saat hapus → { success: false, error: 'Gagal menghapus jurnal' }", async () => {
    setupSupabase({ deleteResponse: { error: { message: "delete error" } } });
    const result = await deleteJournalEntry("entry-001");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Gagal menghapus/);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// updateJournalEntry
// ──────────────────────────────────────────────────────────────────────────────
describe("updateJournalEntry()", () => {
  // JA-21: Update teks saja (tanpa AI) — AI tidak dipanggil
  it("JA-21: enhanceWithAI = false → generateJournalReflection TIDAK dipanggil", async () => {
    setupSupabase();
    await updateJournalEntry("entry-001", "teks baru", false);
    expect(mockGenerateReflection).not.toHaveBeenCalled();
  });

  // JA-22: Update + AI + rate limit tercapai (dengan neq fix — exclude entry yang diedit)
  it("JA-22: enhanceWithAI = true, 2 entri lain hari ini → ditolak (rate limit)", async () => {
    setupSupabase({ countResponse: { count: 2, error: null } });
    const result = await updateJournalEntry("entry-001", "teks baru", true);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Limit tercapai/);
  });

  // JA-23
  it("JA-23: enhanceWithAI = true, limit belum tercapai → success: true", async () => {
    setupSupabase({ countResponse: { count: 0, error: null } });
    const result = await updateJournalEntry("entry-001", "teks baru", true);
    expect(result.success).toBe(true);
  });
});
