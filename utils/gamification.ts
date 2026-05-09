/**
 * Pure utility functions for gamification logic.
 * These are intentionally side-effect-free so they can be easily unit-tested.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface XpResult {
  earnedXp: number;
  isEarlyBonus: boolean;
}

export interface StreakResult {
  newStreakCount: number;
  newLastActiveDate: string; // ISO date string: YYYY-MM-DD
}

// ---------------------------------------------------------------------------
// XP Calculation
// ---------------------------------------------------------------------------

/**
 * Calculates the XP earned when a task is completed.
 *
 * Rules:
 * - Base reward: +10 XP
 * - Legacy early bonus: +5 XP if `completedAt` is strictly before `scheduledTime`
 * - Phase 3 early bonus: additional XP based on time saved between `createdAt` and `deadlineTime`
 *
 * @param completedAt  The moment the user marked the task as done.
 * @param scheduledTime Legacy: task's scheduled datetime.
 * @param createdAt Phase 3: task creation datetime.
 * @param deadlineTime Phase 3: task deadline/scheduled datetime.
 */
export function calculateXp(completedAt: Date, scheduledTime: Date): XpResult;
export function calculateXp(completedAt: Date, createdAt: Date, deadlineTime: Date): XpResult;
export function calculateXp(completedAt: Date, arg2: Date, arg3?: Date): XpResult {
  const baseXp = 10;
  let earnedXp = baseXp;
  let isEarlyBonus = false;

  // Backward-compatible signature: (completedAt, scheduledTime)
  if (!arg3) {
    const scheduledTime = arg2;
    if (completedAt < scheduledTime) {
      isEarlyBonus = true;
      earnedXp += 5;
    }
    return { earnedXp, isEarlyBonus };
  }

  // Phase 3 signature: (completedAt, createdAt, deadlineTime)
  const createdAt = arg2;
  const deadlineTime = arg3;

  if (completedAt < deadlineTime) {
    isEarlyBonus = true;
    const totalDuration = deadlineTime.getTime() - createdAt.getTime();
    const timeSpent = completedAt.getTime() - createdAt.getTime();

    if (totalDuration > 0 && timeSpent >= 0) {
      const timeSavedRatio = 1 - timeSpent / totalDuration;
      earnedXp += Math.round(timeSavedRatio * 20);
    } else {
      earnedXp += 5;
    }
  }

  return { earnedXp, isEarlyBonus };
}

// ---------------------------------------------------------------------------
// Streak Calculation
// ---------------------------------------------------------------------------

/**
 * Calculates the new streak count after a task is completed.
 *
 * Rules (Phase 3):
 * - If `lastActiveDate` was yesterday → increment streak by 1
 * - If `lastActiveDate` was today     → streak unchanged (already counted)
 * - Otherwise (older or null)         → reset streak to 1
 *
 * @param currentStreakCount The user's streak count before this completion.
 * @param lastActiveDate     The user's last active date (YYYY-MM-DD) or null.
 * @param completedAt        The moment the user marked the task as done.
 */
export function calculateStreak(currentStreakCount: number, lastActiveDate: string | null, completedAt: Date): StreakResult {
  const todayStr = completedAt.toLocaleDateString("en-CA"); // YYYY-MM-DD

  let newStreakCount = currentStreakCount;

  if (lastActiveDate) {
    const yesterday = new Date(completedAt);
    yesterday.setDate(completedAt.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString("en-CA");

    if (lastActiveDate === yesterdayStr) {
      newStreakCount += 1;
    } else if (lastActiveDate !== todayStr) {
      newStreakCount = 1; // Missed a day — reset
    }
    // lastActiveDate === todayStr → do nothing; streak stays the same
  } else {
    newStreakCount = 1; // First ever task completion
  }

  return { newStreakCount, newLastActiveDate: todayStr };
}
