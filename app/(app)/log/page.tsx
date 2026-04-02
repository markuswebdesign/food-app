import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DayLog } from "@/components/log/day-log";
import type { LogEntry, RecipeOption } from "@/components/log/day-log";

export default async function LogPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString().split("T")[0];

  const [
    { data: entriesRaw },
    { data: recipesRaw },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from("food_log_entries")
      .select("id, name, calories, protein_g, fat_g, carbs_g, servings, meal_time, recipe_id")
      .eq("user_id", user.id)
      .eq("date", today)
      .order("created_at"),
    supabase
      .from("recipes")
      .select("id, title, servings, recipe_nutrition(calories, protein_g, fat_g, carbohydrates_g)")
      .or(`is_public.eq.true,user_id.eq.${user.id}`)
      .order("title"),
    supabase
      .from("profiles")
      .select("custom_calorie_goal, goal_type, weight_kg, height_cm, age, activity_level, protein_goal_g, fat_goal_g, carbs_goal_g")
      .eq("id", user.id)
      .single(),
  ]);

  // Compute effective calorie goal from profile
  let calorieGoal: number | null = null;
  if (profile?.custom_calorie_goal) {
    calorieGoal = profile.custom_calorie_goal;
  } else if (profile?.weight_kg && profile?.height_cm && profile?.age && profile?.activity_level) {
    const { calcTdee, calcCalorieGoal } = await import("@/lib/utils/tdee");
    const tdee = calcTdee(profile.weight_kg, profile.height_cm, profile.age, profile.activity_level as any);
    calorieGoal = calcCalorieGoal(tdee, (profile.goal_type as any) ?? "maintain");
  }

  const recipes: RecipeOption[] = (recipesRaw ?? []).map((r: any) => {
    const nutrition = r.recipe_nutrition;
    return {
      id: r.id,
      title: r.title,
      servings: r.servings || 1,
      calories_per_serving: nutrition?.calories ?? null,
      protein_per_serving: nutrition?.protein_g ?? null,
      fat_per_serving: nutrition?.fat_g ?? null,
      carbs_per_serving: nutrition?.carbohydrates_g ?? null,
    };
  });

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Logbuch</h1>
        <p className="text-muted-foreground mt-1">Erfasse was du heute gegessen hast</p>
      </div>
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
    </div>
  );
}
