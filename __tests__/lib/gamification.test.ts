/**
 * @jest-environment node
 */
import { calculateXp, calculateStreak } from "@/utils/gamification";

// ──────────────────────────────────────────────────────────────────────────────
// calculateXp
// ──────────────────────────────────────────────────────────────────────────────
describe("calculateXp()", () => {
  const makeDate = (hoursFromNow: number): Date => {
    const d = new Date();
    d.setTime(d.getTime() + hoursFromNow * 60 * 60 * 1000);
    return d;
  };

  // GT-01: Early Bird — selesai > 12 jam sebelum deadline
  it("GT-01: Early Bird (> 12 jam sebelum deadline) → 50 XP + isEarlyBonus: true", () => {
    const now = new Date();
    const deadline = makeDate(24);
    const result = calculateXp(now, deadline);
    expect(result.earnedXp).toBe(50);
    expect(result.isEarlyBonus).toBe(true);
  });

  // GT-02: Early Bird — tepat 12 jam
  it("GT-02: Early Bird (tepat 12 jam sebelum deadline) → 50 XP + isEarlyBonus: true", () => {
    const now = new Date();
    const deadline = makeDate(12);
    const result = calculateXp(now, deadline);
    expect(result.earnedXp).toBe(50);
    expect(result.isEarlyBonus).toBe(true);
  });

  // GT-03: Clutch — < 12 jam sebelum deadline
  it("GT-03: Clutch (6 jam sebelum deadline) → 25 XP + isEarlyBonus: false", () => {
    const now = new Date();
    const deadline = makeDate(6);
    const result = calculateXp(now, deadline);
    expect(result.earnedXp).toBe(25);
    expect(result.isEarlyBonus).toBe(false);
  });

  // GT-04: Clutch — tepat di deadline (0 jam)
  it("GT-04: Clutch (tepat di deadline, diffHours = 0) → 25 XP", () => {
    const now = new Date();
    const deadline = new Date(now);
    const result = calculateXp(now, deadline);
    expect(result.earnedXp).toBe(25);
    expect(result.isEarlyBonus).toBe(false);
  });

  // GT-05: Late — tanpa subtask
  it("GT-05: Late (terlambat, tanpa subtask) → 0 XP", () => {
    const now = new Date();
    const deadline = makeDate(-5);
    const result = calculateXp(now, deadline, 0, 0);
    expect(result.earnedXp).toBe(0);
    expect(result.isEarlyBonus).toBe(false);
  });

  // GT-06: Late — dengan subtask sebagian
  it("GT-06: Late (dengan 2 dari 4 subtask selesai) → XP antara 0 dan 12", () => {
    const now = new Date();
    const deadline = makeDate(-5);
    const result = calculateXp(now, deadline, 2, 4);
    expect(result.earnedXp).toBeGreaterThan(0);
    expect(result.earnedXp).toBeLessThanOrEqual(12);
  });

  // GT-07: Late — XP tidak melebihi batas 25% MAX_XP (12.5, dibulatkan 12 atau 13)
  it("GT-07: Late XP tidak melebihi 25% dari MAX_XP (12 atau 13) meski subtask penuh", () => {
    const now = new Date();
    const deadline = makeDate(-1);
    const result = calculateXp(now, deadline, 10, 10);
    expect(result.earnedXp).toBeLessThanOrEqual(13);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// calculateStreak
// ──────────────────────────────────────────────────────────────────────────────
describe("calculateStreak()", () => {
  const toDateStr = (d: Date) => d.toLocaleDateString("en-CA");

  const today = new Date();

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  // GT-08: First ever completion
  it("GT-08: First ever (lastActiveDate null) → streak = 1", () => {
    const result = calculateStreak(0, null, today);
    expect(result.newStreakCount).toBe(1);
  });

  // GT-09: Continue — aktif kemarin
  it("GT-09: Aktif kemarin → streak bertambah 1", () => {
    const result = calculateStreak(5, toDateStr(yesterday), today);
    expect(result.newStreakCount).toBe(6);
  });

  // GT-10: Same day — aktif hari ini sebelumnya (idempoten)
  it("GT-10: Sudah aktif hari ini → streak tidak bertambah", () => {
    const result = calculateStreak(5, toDateStr(today), today);
    expect(result.newStreakCount).toBe(5);
  });

  // GT-11: Reset — melewatkan 1 hari
  it("GT-11: Melewatkan 1 hari → streak reset ke 1", () => {
    const result = calculateStreak(10, toDateStr(twoDaysAgo), today);
    expect(result.newStreakCount).toBe(1);
  });

  // GT-12: Reset — melewatkan banyak hari
  it("GT-12: Melewatkan 30 hari → streak reset ke 1", () => {
    const result = calculateStreak(99, toDateStr(thirtyDaysAgo), today);
    expect(result.newStreakCount).toBe(1);
  });

  // GT-13: Format tanggal harus YYYY-MM-DD
  it("GT-13: newLastActiveDate selalu berformat YYYY-MM-DD", () => {
    const result = calculateStreak(1, null, today);
    expect(result.newLastActiveDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
