import { toLocalDateString } from "./dashboard";

export type StreakStatus = "on_track" | "on_track_maintain" | "surplus" | "no_log";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  status: StreakStatus;
  motivationText: string;
  earnedBadges: number[]; // milestone days earned, e.g. [7, 14]
}

const MOTIVATION: Record<StreakStatus, string> = {
  on_track: "Super, weiter so!",
  on_track_maintain: "Du bist auf Kurs",
  surplus: "Morgen ist ein neuer Tag",
  no_log: "Vergiss nicht zu loggen",
};

const BADGE_THRESHOLDS = [7, 14, 30];
const MAINTAIN_TOLERANCE_KCAL = 100;

/** Returns true if the given calories count as "within goal" for streak purposes */
function isWithinGoal(calories: number, goal: number, isMaintain: boolean): boolean {
  if (isMaintain) {
    return Math.abs(calories - goal) <= MAINTAIN_TOLERANCE_KCAL;
  }
  return calories <= goal;
}

export function calcStreak(
  logByDate: Record<string, number>,
  calorieGoal: number,
  today: Date,
  goalType: "lose" | "maintain" = "lose"
): StreakData {
  const isMaintain = goalType === "maintain";
  const todayStr = toLocalDateString(today);
  const todayCalories = logByDate[todayStr] ?? null;

  // Determine today's status
  let status: StreakStatus;
  if (todayCalories === null) {
    status = "no_log";
  } else if (isWithinGoal(todayCalories, calorieGoal, isMaintain)) {
    status = isMaintain ? "on_track_maintain" : "on_track";
  } else {
    status = "surplus";
  }

  const todayOnTrack = status === "on_track" || status === "on_track_maintain";

  // Current streak: walk backwards day-by-day (checks date continuity)
  let currentStreak = todayOnTrack ? 1 : 0;
  for (let i = 1; i <= 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = toLocalDateString(d);
    const cal = logByDate[dateStr] ?? null;
    if (cal === null || !isWithinGoal(cal, calorieGoal, isMaintain)) break;
    currentStreak++;
  }

  // Longest streak: scan sorted dates, check that each is exactly 1 day after the previous
  const allDates = Object.keys(logByDate).filter(d => d <= todayStr).sort();
  let longest = 0;
  let run = 0;
  let prevDate: string | null = null;

  for (const dateStr of allDates) {
    const cal = logByDate[dateStr];
    const isConsecutive =
      prevDate === null ||
      (() => {
        const prev = new Date(prevDate + "T12:00:00");
        const curr = new Date(dateStr + "T12:00:00");
        const diffMs = curr.getTime() - prev.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        return diffDays === 1;
      })();

    if (isConsecutive && isWithinGoal(cal, calorieGoal, isMaintain)) {
      run++;
      if (run > longest) longest = run;
    } else if (!isConsecutive || !isWithinGoal(cal, calorieGoal, isMaintain)) {
      run = isWithinGoal(cal, calorieGoal, isMaintain) ? 1 : 0;
    }

    prevDate = dateStr;
  }
  longest = Math.max(longest, currentStreak);

  const earnedBadges = BADGE_THRESHOLDS.filter(t => longest >= t);

  return {
    currentStreak,
    longestStreak: longest,
    status,
    motivationText: MOTIVATION[status],
    earnedBadges,
  };
}
