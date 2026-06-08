/**
 * @jest-environment node
 */
import { generateJournalReflection } from "@/lib/ai/journaling";
import { UserProfile } from "@/types";

// WAJIB: Mock Gemini API — dilarang real-call ke LLM
jest.mock("@/lib/ai/config", () => ({
  getAiResponse: jest.fn(),
}));

import { getAiResponse } from "@/lib/ai/config";
const mockGetAiResponse = getAiResponse as jest.Mock;

const mockProfile: Partial<UserProfile> = {
  name: "Andi",
  major: "Teknik Informatika",
  semester: 6,
  ai_persona: "mindful",
};

const validAiResponse = JSON.stringify({
  reflection: "Kamu sudah melakukan yang terbaik hari ini!",
  sentiment_score: 7,
});

beforeEach(() => {
  jest.clearAllMocks();
});

// ──────────────────────────────────────────────────────────────────────────────
// generateJournalReflection
// ──────────────────────────────────────────────────────────────────────────────
describe("generateJournalReflection()", () => {
  // AT-01: Happy Path
  it("AT-01: Respons AI valid → return parsed JournalReflectionResponse", async () => {
    mockGetAiResponse.mockResolvedValue(validAiResponse);
    const result = await generateJournalReflection(mockProfile, "Hari ini capek banget.");
    expect(result).not.toBeNull();
    expect(result?.reflection).toBe("Kamu sudah melakukan yang terbaik hari ini!");
    expect(result?.sentiment_score).toBe(7);
  });

  // AT-02: Prompt Tunneling — nama user diinjek ke system instruction
  it("AT-02: Prompt Tunneling — nama user masuk ke system instruction", async () => {
    mockGetAiResponse.mockResolvedValue(validAiResponse);
    await generateJournalReflection(mockProfile, "Curhatan gue...");

    const [, systemInstruction] = mockGetAiResponse.mock.calls[0];
    expect(systemInstruction).toContain("Andi");
  });

  // AT-03: Persona Mindful
  it("AT-03: Persona 'mindful' → system instruction mengandung nada suportif/empati", async () => {
    mockGetAiResponse.mockResolvedValue(validAiResponse);
    await generateJournalReflection({ ...mockProfile, ai_persona: "mindful" }, "text");

    const [, systemInstruction] = mockGetAiResponse.mock.calls[0];
    expect(systemInstruction.toLowerCase()).toMatch(/suportif|empati|afirmasi/);
  });

  // AT-04: Persona Savage
  it("AT-04: Persona 'savage' → system instruction mengandung nada blak-blakan", async () => {
    mockGetAiResponse.mockResolvedValue(validAiResponse);
    await generateJournalReflection({ ...mockProfile, ai_persona: "savage" }, "text");

    const [, systemInstruction] = mockGetAiResponse.mock.calls[0];
    expect(systemInstruction.toLowerCase()).toMatch(/savage|blak-blakan|roasting/);
  });

  // AT-05: Persona Aesthetic
  it("AT-05: Persona 'aesthetic' → system instruction mengandung nada puitis", async () => {
    mockGetAiResponse.mockResolvedValue(validAiResponse);
    await generateJournalReflection({ ...mockProfile, ai_persona: "aesthetic" }, "text");

    const [, systemInstruction] = mockGetAiResponse.mock.calls[0];
    expect(systemInstruction.toLowerCase()).toMatch(/puitis|aesthetic|tenang/);
  });

  // AT-06: Default profile fallback — profil kosong
  it("AT-06: Profil kosong tidak crash, gunakan default values", async () => {
    mockGetAiResponse.mockResolvedValue(validAiResponse);
    await expect(generateJournalReflection({}, "text")).resolves.not.toThrow();

    const [, systemInstruction] = mockGetAiResponse.mock.calls[0];
    expect(systemInstruction).toContain("Mahasiswa"); // default name
  });

  // AT-07: AI gagal — getAiResponse return null
  it("AT-07: getAiResponse return null → fungsi return null", async () => {
    mockGetAiResponse.mockResolvedValue(null);
    const result = await generateJournalReflection(mockProfile, "text");
    expect(result).toBeNull();
  });

  // AT-08: JSON rusak — AI return invalid string
  it("AT-08: AI return string bukan JSON → return null (tidak crash)", async () => {
    mockGetAiResponse.mockResolvedValue("ini bukan json sama sekali");
    const result = await generateJournalReflection(mockProfile, "text");
    expect(result).toBeNull();
  });

  // AT-09: JSON parseable tapi field tidak lengkap
  it("AT-09: AI return JSON tanpa sentiment_score → field bisa undefined, tidak crash", async () => {
    mockGetAiResponse.mockResolvedValue(JSON.stringify({ reflection: "ok" }));
    const result = await generateJournalReflection(mockProfile, "text");
    // Tidak crash adalah yang utama; sentiment_score bisa undefined
    expect(result).not.toBeNull();
    expect(result?.reflection).toBe("ok");
    expect(result?.sentiment_score).toBeUndefined();
  });
});
