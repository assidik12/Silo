/**
 * Pure utility functions for gamification logic.
 * Centered in lib/ for modularity and reusability.
 */

export interface XpResult {
  earnedXp: number;
  isEarlyBonus: boolean;
}

export interface StreakResult {
  newStreakCount: number;
  newLastActiveDate: string; // ISO date string: YYYY-MM-DD
}

/**
 * Calculates the XP earned when a task is completed.
 * @param completedAt  The moment the user marked the task as done.
 * @param deadlineTime Task deadline/scheduled datetime.
 * @param subTasksDoneCount Number of subtasks completed.
 * @param subTasksTotalCount Total number of subtasks.
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
      const expSubTask = MAX_XP / subTasksTotalCount;
      const calculatedXp = (subTasksDoneCount * (0.05 * MAX_XP)) + (0.10 * (expSubTask * subTasksDoneCount));
      const maxAllowed = 0.25 * MAX_XP; // 12.5
      earnedXp = Math.round(Math.min(calculatedXp, maxAllowed));
    } else {
      earnedXp = 0;
    }
  }

  return { earnedXp, isEarlyBonus };
}

/**
 * Calculates the new streak count after a task is completed.
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
  } else {
    newStreakCount = 1; // First ever task completion
  }

  return { newStreakCount, newLastActiveDate: todayStr };
}
