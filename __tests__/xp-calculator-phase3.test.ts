/**
 * xp-calculator-phase3.test.ts
 *
 * Additional XP tests for the Phase 3 signature: calculateXp(completedAt, createdAt, deadlineTime)
 */

import { calculateXp } from "@/utils/gamification";

describe("XP Calculator (Phase 3 signature)", () => {
  it("awards base XP when completed after deadline", () => {
    const createdAt = new Date("2026-05-05T08:00:00.000Z");
    const deadline = new Date("2026-05-05T10:00:00.000Z");
    const completedAt = new Date("2026-05-05T10:01:00.000Z");

    const { earnedXp, isEarlyBonus } = calculateXp(completedAt, createdAt, deadline);

    expect(earnedXp).toBe(10);
    expect(isEarlyBonus).toBe(false);
  });

  it("awards more than base XP when completed early with valid duration window", () => {
    const createdAt = new Date("2026-05-05T08:00:00.000Z");
    const deadline = new Date("2026-05-05T10:00:00.000Z");
    const completedAt = new Date("2026-05-05T09:00:00.000Z");

    const { earnedXp, isEarlyBonus } = calculateXp(completedAt, createdAt, deadline);

    expect(isEarlyBonus).toBe(true);
    expect(earnedXp).toBeGreaterThan(10);
  });
});
