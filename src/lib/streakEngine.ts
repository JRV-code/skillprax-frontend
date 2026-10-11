/**
 * SKILL-TRACK Streak & Freeze Economy Engine
 * 
 * Rules:
 * 1. Initial streak freezes = 0 (Unearned).
 * 2. Freezes can ONLY be accumulated by hitting 7-day milestone increments (Day 7, 14, 21, 28...).
 * 3. Never hardcode 3 freezes by default.
 */

export interface StreakEvaluationResult {
  newStreak: number;
  newFreezes: number;
  earnedFreeze: boolean;
  milestoneReached: boolean;
  celebrationToast: string | null;
}

/**
 * Evaluates streak progression upon day completion.
 * @param currentStreak The user's active streak count in days.
 * @param currentFreezes The user's currently banked streak freeze shields (starts at 0).
 */
export function evaluateStreakCompletion(
  currentStreak: number,
  currentFreezes: number = 0
): StreakEvaluationResult {
  const newStreak = Math.max(1, currentStreak + 1);
  let newFreezes = Math.max(0, currentFreezes);
  let earnedFreeze = false;
  let milestoneReached = false;
  let celebrationToast: string | null = null;

  // Multiples of 7 award +1 streak freeze
  if (newStreak % 7 === 0) {
    earnedFreeze = true;
    milestoneReached = true;
    newFreezes += 1;
    celebrationToast = `🔥 ${newStreak}-Day Streak Complete! ❄️ +1 Streak Freeze earned!`;
  }

  return {
    newStreak,
    newFreezes,
    earnedFreeze,
    milestoneReached,
    celebrationToast,
  };
}

/**
 * Checks if a specific day streak count warrants a celebration
 */
export function checkStreakMilestone(streakDays: number): { isMilestone: boolean; message: string | null } {
  if (streakDays > 0 && streakDays % 7 === 0) {
    return {
      isMilestone: true,
      message: `7-Day Streak Complete! ❄️ +1 Streak Freeze earned! (${streakDays} Days Strong)`,
    };
  }
  return { isMilestone: false, message: null };
}
