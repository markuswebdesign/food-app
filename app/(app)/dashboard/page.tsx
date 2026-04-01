import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { calcTdee, calcCalorieGoal } from "@/lib/utils/tdee";
import type { ActivityLevel, GoalType } from "@/lib/utils/tdee";
import { buildWeekData, calcWeekBalance, getWeekStart, getWeekEnd, toLocalDateString } from "@/lib/utils/dashboard";
import { CalorieTodayCard } from "@/components/dashboard/calorie-today-card";
import { WeekChart } from "@/components/dashboard/week-chart";
import { WeekSummary } from "@/components/dashboard/week-summary";
import { ProfileCTA } from "@/components/dashboard/profile-cta";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date();
  const todayStr = toLocalDateString(today);
  const weekStart = toLocalDateString(getWeekStart(today));
  const weekEnd = toLocalDateString(getWeekEnd(today));

  const [
    { data: profile },
    { data: todayEntries },
    { data: weekEntries },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("custom_calorie_goal, goal_type, weight_kg, height_cm, age, activity_level")
      .eq("id", user.id)
      .single(),
    supabase
      .from("food_log_entries")
      .select("calories")
      .eq("user_id", user.id)
      .eq("date", todayStr),
    supabase
      .from("food_log_entries")
      .select("date, calories")
      .eq("user_id", user.id)
      .gte("date", weekStart)
      .lte("date", weekEnd),
  ]);

  // Compute effective calorie goal
  let calorieGoal: number | null = null;
  if (profile?.custom_calorie_goal) {
    calorieGoal = profile.custom_calorie_goal;
  } else if (profile?.weight_kg && profile?.height_cm && profile?.age && profile?.activity_level) {
    const tdee = calcTdee(
      profile.weight_kg,
      profile.height_cm,
      profile.age,
      profile.activity_level as ActivityLevel
    );
    calorieGoal = calcCalorieGoal(tdee, (profile.goal_type as GoalType) ?? "maintain");
  }

  const hasProfile = calorieGoal !== null;
  const goalType: GoalType = (profile?.goal_type as GoalType) ?? "maintain";

  // Today total
  const consumedToday = (todayEntries ?? []).reduce((sum, e) => sum + e.calories, 0);

  // Week aggregation: date → total calories
  const logByDate: Record<string, number> = {};
  for (const entry of weekEntries ?? []) {
    logByDate[entry.date] = (logByDate[entry.date] ?? 0) + entry.calories;
  }

  const weekDays = hasProfile ? buildWeekData(today, logByDate, calorieGoal!) : [];
  const weekBalance = hasProfile ? calcWeekBalance(weekDays) : 0;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Dein Kalorienstatus auf einen Blick</p>
      </div>

      {!hasProfile ? (
        <ProfileCTA />
      ) : (
        <>
          <CalorieTodayCard
            consumed={consumedToday}
            goal={calorieGoal!}
            goalType={goalType}
          />

          <div className="space-y-3">
            <WeekChart days={weekDays} />
            <WeekSummary balance={weekBalance} goalType={goalType} />
          </div>
        </>
      )}
    </div>
  );
}
