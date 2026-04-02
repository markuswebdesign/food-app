import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { calcTdee, calcCalorieGoal } from "@/lib/utils/tdee";
import type { ActivityLevel, GoalType } from "@/lib/utils/tdee";
import { buildWeekData, calcWeekBalance, getWeekStart, getWeekEnd, toLocalDateString } from "@/lib/utils/dashboard";
import { calcStreak } from "@/lib/utils/streak";
import { MeTabs } from "@/components/me/me-tabs";
import { CalorieTodayCard } from "@/components/dashboard/calorie-today-card";
import { StreakWidget } from "@/components/dashboard/streak-widget";
import { WeekChart } from "@/components/dashboard/week-chart";
import { WeekSummary } from "@/components/dashboard/week-summary";
import { ProfileCTA } from "@/components/dashboard/profile-cta";
import { BadgesSection } from "@/components/profile/badges-section";
import { DayLog } from "@/components/log/day-log";
import type { LogEntry, RecipeOption } from "@/components/log/day-log";
import { ProfileHealthForm } from "@/components/profile/profile-health-form";
import { ProfileAvatar } from "@/components/profile/profile-avatar";

type Tab = "ubersicht" | "logbuch" | "profil";

export default async function MePage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const tab = (searchParams.tab ?? "ubersicht") as Tab;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date();
  const todayStr = toLocalDateString(today);

  // Always fetch profile — needed for all tabs
  const { data: profile } = await supabase
    .from("profiles")
    .select("custom_calorie_goal, goal_type, weight_kg, height_cm, age, activity_level, username, protein_goal_g, fat_goal_g, carbs_goal_g, longest_streak_days, avatar_url")
    .eq("id", user.id)
    .single();

  // Compute calorie goal (shared between tabs)
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

  const hasCalorieGoal = calorieGoal !== null;
  const goalType: GoalType = (profile?.goal_type as GoalType) ?? "maintain";

  // ── Streak (always fetched — used in Übersicht + Profil tabs) ───────────────
  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const ninetyDaysAgoStr = toLocalDateString(ninetyDaysAgo);

  const [{ data: streakEntries }, { data: dbBadges }] = await Promise.all([
    supabase
      .from("food_log_entries")
      .select("date, calories")
      .eq("user_id", user.id)
      .gte("date", ninetyDaysAgoStr)
      .lte("date", todayStr),
    supabase
      .from("profile_badges")
      .select("badge_type")
      .eq("user_id", user.id),
  ]);

  const streakLogByDate: Record<string, number> = {};
  for (const entry of streakEntries ?? []) {
    streakLogByDate[entry.date] = (streakLogByDate[entry.date] ?? 0) + entry.calories;
  }
  const streakData = hasCalorieGoal ? calcStreak(streakLogByDate, calorieGoal!, today, goalType) : null;

  // Persist new records + badges if streak improved
  if (streakData) {
    const storedLongest = profile?.longest_streak_days ?? 0;
    const earnedBadgeTypes = streakData.earnedBadges.map(d => `streak_${d}` as const);
    const existingBadgeTypes = new Set((dbBadges ?? []).map(b => b.badge_type));
    const newBadgeTypes = earnedBadgeTypes.filter(t => !existingBadgeTypes.has(t));

    const tasks = [];

    if (streakData.longestStreak > storedLongest) {
      tasks.push(
        supabase
          .from("profiles")
          .update({ longest_streak_days: streakData.longestStreak })
          .eq("id", user.id)
          .then()
      );
    }

    if (newBadgeTypes.length > 0) {
      tasks.push(
        supabase
          .from("profile_badges")
          .insert(newBadgeTypes.map(badge_type => ({ user_id: user.id, badge_type })))
          .then()
      );
    }

    if (tasks.length > 0) await Promise.all(tasks);
  }

  // Earned badges for display: combine DB badges + any newly earned
  const allEarnedBadgeNums = [
    ...(dbBadges ?? []).map(b => parseInt(b.badge_type.replace("streak_", ""), 10)),
    ...(streakData?.earnedBadges ?? []),
  ];
  const earnedBadgeNums = Array.from(new Set(allEarnedBadgeNums));

  // ── Tab: Übersicht ──────────────────────────────────────────────────────────
  let dashboardContent: React.ReactNode = null;

  if (tab === "ubersicht") {
    const weekStart = toLocalDateString(getWeekStart(today));
    const weekEnd = toLocalDateString(getWeekEnd(today));

    const [{ data: todayEntries }, { data: weekEntries }] = await Promise.all([
      supabase.from("food_log_entries").select("calories").eq("user_id", user.id).eq("date", todayStr),
      supabase.from("food_log_entries").select("date, calories").eq("user_id", user.id).gte("date", weekStart).lte("date", weekEnd),
    ]);

    const consumedToday = (todayEntries ?? []).reduce((sum, e) => sum + e.calories, 0);
    const logByDate: Record<string, number> = {};
    for (const entry of weekEntries ?? []) {
      logByDate[entry.date] = (logByDate[entry.date] ?? 0) + entry.calories;
    }
    const weekDays = hasCalorieGoal ? buildWeekData(today, logByDate, calorieGoal!) : [];
    const weekBalance = hasCalorieGoal ? calcWeekBalance(weekDays) : 0;

    dashboardContent = !hasCalorieGoal ? (
      <ProfileCTA />
    ) : (
      <div className="space-y-6">
        {streakData && <StreakWidget streak={streakData} />}
        <CalorieTodayCard consumed={consumedToday} goal={calorieGoal!} goalType={goalType} />
        <div className="space-y-3">
          <WeekChart days={weekDays} />
          <WeekSummary balance={weekBalance} goalType={goalType} />
        </div>
      </div>
    );
  }

  // ── Tab: Logbuch ────────────────────────────────────────────────────────────
  let logContent: React.ReactNode = null;

  if (tab === "logbuch") {
    const [{ data: entriesRaw }, { data: recipesRaw }] = await Promise.all([
      supabase
        .from("food_log_entries")
        .select("id, name, calories, protein_g, fat_g, carbs_g, servings, meal_time, recipe_id")
        .eq("user_id", user.id)
        .eq("date", todayStr)
        .order("created_at"),
      supabase
        .from("recipes")
        .select("id, title, servings, recipe_nutrition(calories, protein_g, fat_g, carbohydrates_g)")
        .or(`is_public.eq.true,user_id.eq.${user.id}`)
        .order("title"),
    ]);

    const recipes: RecipeOption[] = (recipesRaw ?? []).map((r: any) => {
      const nutrition = r.recipe_nutrition;
      const srv = r.servings || 1;
      return {
        id: r.id,
        title: r.title,
        servings: srv,
        calories_per_serving: nutrition?.calories != null ? nutrition.calories / srv : null,
        protein_per_serving: nutrition?.protein_g != null ? nutrition.protein_g / srv : null,
        fat_per_serving: nutrition?.fat_g != null ? nutrition.fat_g / srv : null,
        carbs_per_serving: nutrition?.carbohydrates_g != null ? nutrition.carbohydrates_g / srv : null,
      };
    });

    logContent = (
      <DayLog
        userId={user.id}
        initialEntries={(entriesRaw as LogEntry[]) ?? []}
        recipes={recipes}
        calorieGoal={calorieGoal}
        macroGoals={{
          protein_goal_g: profile?.protein_goal_g ?? null,
          fat_goal_g: profile?.fat_goal_g ?? null,
          carbs_goal_g: profile?.carbs_goal_g ?? null,
        }}
      />
    );
  }

  // ── Tab: Profil ─────────────────────────────────────────────────────────────
  let profileContent: React.ReactNode = null;

  if (tab === "profil") {
    profileContent = (
      <div className="space-y-6">
        <ProfileAvatar
          userId={user.id}
          username={profile?.username ?? "??"}
          currentAvatarUrl={profile?.avatar_url ?? null}
        />
        <BadgesSection earnedBadges={earnedBadgeNums} longestStreak={streakData?.longestStreak ?? 0} />
        <ProfileHealthForm
          userId={user.id}
          initial={{
            weight_kg: profile?.weight_kg ?? null,
            height_cm: profile?.height_cm ?? null,
            age: profile?.age ?? null,
            activity_level: profile?.activity_level ?? null,
            goal_type: profile?.goal_type ?? null,
            custom_calorie_goal: profile?.custom_calorie_goal ?? null,
            protein_goal_g: profile?.protein_goal_g ?? null,
            fat_goal_g: profile?.fat_goal_g ?? null,
            carbs_goal_g: profile?.carbs_goal_g ?? null,
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Suspense>
        <MeTabs />
      </Suspense>

      <div>
        {tab === "ubersicht" && dashboardContent}
        {tab === "logbuch" && logContent}
        {tab === "profil" && profileContent}
      </div>
    </div>
  );
}
