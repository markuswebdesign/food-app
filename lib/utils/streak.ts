import { toLocalDateString } from "./dashboard";

export type StreakStatus = "on_track" | "surplus" | "no_log";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  status: StreakStatus;
  motivationText: string;
  earnedBadges: number[]; // milestone days earned, e.g. [7, 14]
}

const MOTIVATION: Record<StreakStatus, string> = {
  on_track: "Super, weiter so!",
  surplus: "Morgen ist ein neuer Tag",
  no_log: "Vergiss nicht zu loggen",
};

const BADGE_THRESHOLDS = [7, 14, 30];

export function calcStreak(
  logByDate: Record<string, number>,
  calorieGoal: number,
  today: Date
): StreakData {
  const todayStr = toLocalDateString(today);
  const todayCalories = logByDate[todayStr] ?? null;

  let status: StreakStatus;
  if (todayCalories === null) {
    status = "no_log";
  } else if (todayCalories <= calorieGoal) {
    status = "on_track";
  } else {
    status = "surplus";
  }

  // Current streak: count consecutive days backwards from today
  let currentStreak = status === "on_track" ? 1 : 0;
  for (let i = 1; i <= 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = toLocalDateString(d);
    const cal = logByDate[dateStr] ?? null;
    if (cal === null || cal > calorieGoal) break;
    currentStreak++;
  }

  // Longest streak: scan all available dates in order
  const allDates = Object.keys(logByDate).filter(d => d <= todayStr).sort();
  let longest = 0;
  let run = 0;
  for (const dateStr of allDates) {
    const cal = logByDate[dateStr];
    if (cal <= calorieGoal) {
      run++;
      if (run > longest) longest = run;
    } else {
      run = 0;
    }
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
