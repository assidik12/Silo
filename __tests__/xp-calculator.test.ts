import { calculateXp } from '@/utils/gamification';

describe('XP Calculator', () => {
  // ----------------------------------------------------------------
  // Baseline: task completed AFTER scheduled time (no bonus)
  // ----------------------------------------------------------------
  it('awards 10 XP when task is completed after its scheduled time', () => {
    const scheduledTime = new Date('2026-05-05T10:00:00.000Z');
    const completedAt = new Date('2026-05-05T11:30:00.000Z'); // 1.5 hours late

    const { earnedXp, isEarlyBonus } = calculateXp(completedAt, scheduledTime);

    expect(earnedXp).toBe(10);
    expect(isEarlyBonus).toBe(false);
  });

  // ----------------------------------------------------------------
  // Early submission: task completed BEFORE scheduled time (+5 bonus)
  // ----------------------------------------------------------------
  it('awards 15 XP when task is completed before its scheduled time', () => {
    const scheduledTime = new Date('2026-05-05T14:00:00.000Z');
    const completedAt = new Date('2026-05-05T09:00:00.000Z'); // 5 hours early

    const { earnedXp, isEarlyBonus } = calculateXp(completedAt, scheduledTime);

    expect(earnedXp).toBe(15);
    expect(isEarlyBonus).toBe(true);
  });

  // ----------------------------------------------------------------
  // Edge case: completed at exactly the scheduled moment (no bonus)
  // ----------------------------------------------------------------
  it('awards 10 XP (no bonus) when completed exactly at the scheduled time', () => {
    const scheduledTime = new Date('2026-05-05T12:00:00.000Z');
    const completedAt = new Date('2026-05-05T12:00:00.000Z'); // exactly on time

    const { earnedXp, isEarlyBonus } = calculateXp(completedAt, scheduledTime);

    expect(earnedXp).toBe(10);
    expect(isEarlyBonus).toBe(false);
  });

  // ----------------------------------------------------------------
  // Cumulative: verify total XP accumulation pattern
  // ----------------------------------------------------------------
  it('correctly separates base XP from early bonus XP', () => {
    const scheduledTime = new Date('2026-05-05T18:00:00.000Z');
    const completedAt = new Date('2026-05-05T08:00:00.000Z'); // 10 hours early

    const { earnedXp } = calculateXp(completedAt, scheduledTime);

    // Base (10) + Bonus (5) = 15
    expect(earnedXp).toBe(15);
  });
});
