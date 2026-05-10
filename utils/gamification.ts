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
export function calculateXp(completedAt: Date, deadlineTime: Date, subTasksDoneCount: number = 0, subTasksTotalCount: number = 0): XpResult {
  const MAX_XP = 50;
  let earnedXp = 0;
  let isEarlyBonus = false;

  const diffHours = (deadlineTime.getTime() - completedAt.getTime()) / (1000 * 60 * 60);

  if (diffHours >= 12) {
    // Selesai > 12 jam sebelum deadline
    earnedXp = MAX_XP;
    isEarlyBonus = true;
  } else if (diffHours >= 0 && diffHours < 12) {
    // Selesai < 12 jam sebelum deadline
    earnedXp = MAX_XP * 0.5; // 25
  } else {
    // Terlambat
    if (subTasksDoneCount > 0 && subTasksTotalCount > 0) {
      // Hanya Sebagian Selesai: (Jumlah sub-task selesai * 5%) + (10% dari EXP sub-task)
      const expSubTask = MAX_XP / subTasksTotalCount;
      const calculatedXp = (subTasksDoneCount * (0.05 * MAX_XP)) + (0.10 * (expSubTask * subTasksDoneCount));
      const maxAllowed = 0.25 * MAX_XP; // 12.5
      earnedXp = Math.round(Math.min(calculatedXp, maxAllowed));
    } else {
      // Tidak ada progres saat deadline
      earnedXp = 0;
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
