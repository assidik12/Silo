import { calculateStreak } from '@/utils/gamification';

// Helpers to build deterministic Date objects from a YYYY-MM-DD string
// without timezone drift (we pin to noon UTC so local offsets don't cross day boundaries).
const makeDate = (dateStr: string) => new Date(`${dateStr}T12:00:00.000Z`);

describe('Streak Logic', () => {
  // ----------------------------------------------------------------
  // Case 1: Continued streak (last active was yesterday)
  // ----------------------------------------------------------------
  it('increments streak by 1 when last active was yesterday', () => {
    const completedAt = makeDate('2026-05-05');
    const yesterdayStr = '2026-05-04'; // en-CA of "yesterday"

    const { newStreakCount, newLastActiveDate } = calculateStreak(
      5,
      yesterdayStr,
      completedAt
    );

    expect(newStreakCount).toBe(6);
    expect(newLastActiveDate).toBe(completedAt.toLocaleDateString('en-CA'));
  });

  // ----------------------------------------------------------------
  // Case 2: Same-day completion (streak should NOT change)
  // ----------------------------------------------------------------
  it('does not change streak when another task is completed on the same day', () => {
    const completedAt = makeDate('2026-05-05');
    const todayStr = completedAt.toLocaleDateString('en-CA'); // '2026-05-05'

    const { newStreakCount } = calculateStreak(7, todayStr, completedAt);

    expect(newStreakCount).toBe(7); // unchanged
  });

  // ----------------------------------------------------------------
  // Case 3: Missed a day — streak resets to 1
  // ----------------------------------------------------------------
  it('resets streak to 1 when last active was more than 1 day ago', () => {
    const completedAt = makeDate('2026-05-05');
    const twoDaysAgoStr = '2026-05-03';

    const { newStreakCount } = calculateStreak(10, twoDaysAgoStr, completedAt);

    expect(newStreakCount).toBe(1);
  });

  // ----------------------------------------------------------------
  // Case 4: Very long gap (e.g. a week)
  // ----------------------------------------------------------------
  it('resets streak to 1 when last active was a week ago', () => {
    const completedAt = makeDate('2026-05-05');
    const aWeekAgoStr = '2026-04-28';

    const { newStreakCount } = calculateStreak(20, aWeekAgoStr, completedAt);

    expect(newStreakCount).toBe(1);
  });

  // ----------------------------------------------------------------
  // Case 5: First ever task (no previous activity)
  // ----------------------------------------------------------------
  it('starts streak at 1 when there is no previous activity (null)', () => {
    const completedAt = makeDate('2026-05-05');

    const { newStreakCount } = calculateStreak(0, null, completedAt);

    expect(newStreakCount).toBe(1);
  });

  // ----------------------------------------------------------------
  // Case 6: lastActiveDate is always updated to today
  // ----------------------------------------------------------------
  it('always sets newLastActiveDate to today regardless of previous date', () => {
    const completedAt = makeDate('2026-05-05');
    const expectedToday = completedAt.toLocaleDateString('en-CA');

    // From yesterday
    expect(calculateStreak(3, '2026-05-04', completedAt).newLastActiveDate).toBe(expectedToday);
    // From two days ago
    expect(calculateStreak(3, '2026-05-03', completedAt).newLastActiveDate).toBe(expectedToday);
    // From null
    expect(calculateStreak(0, null, completedAt).newLastActiveDate).toBe(expectedToday);
  });
});
