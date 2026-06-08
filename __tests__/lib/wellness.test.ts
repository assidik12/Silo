/**
 * @jest-environment node
 */
import { getAffirmationCategory, getRecommendedPomodoro } from "@/utils/wellness";

// ──────────────────────────────────────────────────────────────────────────────
// getAffirmationCategory
// ──────────────────────────────────────────────────────────────────────────────
describe("getAffirmationCategory()", () => {
  // WT-01 & WT-02 — "On Fire!" zone
  describe('Score >= 8 → "On Fire! 🔥"', () => {
    it("WT-01: score = 10 (batas atas) returns On Fire", () => {
      const result = getAffirmationCategory(10);
      expect(result.category).toBe("On Fire! 🔥");
      expect(result.color).toBe("text-green-500");
    });

    it("WT-02: score = 8 (batas bawah) returns On Fire", () => {
      const result = getAffirmationCategory(8);
      expect(result.category).toBe("On Fire! 🔥");
    });
  });

  // WT-03 & WT-04 — "Doing Okay" zone
  describe('Score 5–7 → "Doing Okay 🍃"', () => {
    it("WT-03: score = 5 (batas bawah) returns Doing Okay", () => {
      const result = getAffirmationCategory(5);
      expect(result.category).toBe("Doing Okay 🍃");
      expect(result.color).toBe("text-blue-500");
    });

    it("WT-04: score = 6 (tengah zona) returns Doing Okay", () => {
      const result = getAffirmationCategory(6);
      expect(result.category).toBe("Doing Okay 🍃");
    });
  });

  // WT-05 & WT-06 — "Take a Breath" zone
  describe('Score <= 4 → "Take a Breath 💙"', () => {
    it("WT-05: score = 4 (batas atas zona rendah) returns Take a Breath", () => {
      const result = getAffirmationCategory(4);
      expect(result.category).toBe("Take a Breath 💙");
      expect(result.color).toBe("text-red-400");
    });

    it("WT-06: score = 1 (batas bawah) returns Take a Breath", () => {
      const result = getAffirmationCategory(1);
      expect(result.category).toBe("Take a Breath 💙");
    });
  });

  // WT-07 — Edge case: score 0
  it("WT-07: score = 0 (di luar range) tidak crash, masuk zona Take a Breath", () => {
    expect(() => getAffirmationCategory(0)).not.toThrow();
    const result = getAffirmationCategory(0);
    expect(result.category).toBe("Take a Breath 💙");
  });

  // WT-08 — Semua field hadir
  it("WT-08: semua output field (category, affirmation, color) selalu ada", () => {
    const result = getAffirmationCategory(7);
    expect(result).toHaveProperty("category");
    expect(result).toHaveProperty("affirmation");
    expect(result).toHaveProperty("color");
  });

  // WT-09 — Affirmation tidak kosong di semua branch
  it.each([10, 7, 1])(
    "WT-09: affirmation tidak kosong untuk score %i",
    (score) => {
      const { affirmation } = getAffirmationCategory(score);
      expect(affirmation.length).toBeGreaterThan(0);
    }
  );
});

// ──────────────────────────────────────────────────────────────────────────────
// getRecommendedPomodoro
// ──────────────────────────────────────────────────────────────────────────────
describe("getRecommendedPomodoro()", () => {
  // WT-10 & WT-11 — Pomodoro normal (score tinggi)
  it("WT-10: score = 10 → workMinutes: 25, breakMinutes: 5", () => {
    expect(getRecommendedPomodoro(10)).toEqual({ workMinutes: 25, breakMinutes: 5 });
  });

  it("WT-11: score = 8 (batas bawah zona tinggi) → workMinutes: 25, breakMinutes: 5", () => {
    expect(getRecommendedPomodoro(8)).toEqual({ workMinutes: 25, breakMinutes: 5 });
  });

  // WT-12 & WT-13 — Pomodoro rileks (score sedang)
  it("WT-12: score = 7 (batas atas zona sedang) → workMinutes: 20, breakMinutes: 5", () => {
    expect(getRecommendedPomodoro(7)).toEqual({ workMinutes: 20, breakMinutes: 5 });
  });

  it("WT-13: score = 5 (batas bawah zona sedang) → workMinutes: 20, breakMinutes: 5", () => {
    expect(getRecommendedPomodoro(5)).toEqual({ workMinutes: 20, breakMinutes: 5 });
  });

  // WT-14 & WT-15 — Pomodoro mode stres (score rendah)
  it("WT-14: score = 4 → workMinutes: 15, breakMinutes: 10 (istirahat diperpanjang)", () => {
    expect(getRecommendedPomodoro(4)).toEqual({ workMinutes: 15, breakMinutes: 10 });
  });

  it("WT-15: score = 1 (terendah) → workMinutes: 15, breakMinutes: 10", () => {
    expect(getRecommendedPomodoro(1)).toEqual({ workMinutes: 15, breakMinutes: 10 });
  });

  // WT-16 — Edge case: score 0
  it("WT-16: score = 0 tidak crash, masuk branch rendah", () => {
    expect(() => getRecommendedPomodoro(0)).not.toThrow();
    expect(getRecommendedPomodoro(0)).toEqual({ workMinutes: 15, breakMinutes: 10 });
  });
});
