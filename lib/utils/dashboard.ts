/**
 * Dashboard utility functions for week-based calorie calculations.
 * Uses local date strings (YYYY-MM-DD) throughout to match food_log_entries.date.
 */

export type DayOfWeek = "Mo" | "Di" | "Mi" | "Do" | "Fr" | "Sa" | "So";

export type WeekDayData = {
  label: DayOfWeek;
  date: string; // YYYY-MM-DD
  consumed: number | null; // null = no entries logged (not 0)
  goal: number;
  isToday: boolean;
  isPast: boolean;
};

/** Returns YYYY-MM-DD for a given Date in local time */
export function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Returns the Monday of the week containing `date` */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Returns the Sunday of the week containing `date` */
export function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

const DAY_LABELS: DayOfWeek[] = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

/**
 * Builds 7-day WeekDayData array for the current week.
 * @param today      current Date
 * @param logByDate  map of date string → total calories (only dates with entries)
 * @param goal       daily calorie goal
 */
export function buildWeekData(
  today: Date,
  logByDate: Record<string, number>,
  goal: number
): WeekDayData[] {
  const start = getWeekStart(today);
  const todayStr = toLocalDateString(today);

  return DAY_LABELS.map((label, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dateStr = toLocalDateString(d);
    const isPast = dateStr < todayStr;
    const isToday = dateStr === todayStr;
    const consumed = Object.prototype.hasOwnProperty.call(logByDate, dateStr)
      ? logByDate[dateStr]
      : null;

    return { label, date: dateStr, consumed, goal, isToday, isPast };
  });
}

/**
 * Computes weekly deficit/surplus total.
 * Only counts days with actual log entries AND that are today or in the past.
 */
export function calcWeekBalance(days: WeekDayData[]): number {
  return days.reduce((sum, day) => {
    if (day.consumed === null) return sum;
    if (!day.isToday && !day.isPast) return sum;
    return sum + (day.goal - day.consumed);
  }, 0);
}
