import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WeekPlan } from "@/components/meal-plan/week-plan";
import { calcTdee, calcCalorieGoal } from "@/lib/utils/tdee";
import type { ActivityLevel, GoalType } from "@/lib/utils/tdee";

export default async function MealPlanPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: recipesRaw }, { data: categories }, { data: favoritesRaw }, { data: profile }] = await Promise.all([
    supabase
      .from("recipes")
      .select("id, title, image_url, recipe_categories(categories(slug)), recipe_nutrition(calories)")
      .or(`is_public.eq.true,user_id.eq.${user.id}`)
      .order("title"),
    supabase
      .from("categories")
      .select("id, slug, name, icon, type")
      .order("type"),
    supabase
      .from("favorites")
      .select("recipe_id")
      .eq("user_id", user.id),
    supabase
      .from("profiles")
      .select("protein_goal_g, fat_goal_g, carbs_goal_g, custom_calorie_goal, goal_type, weight_kg, height_cm, age, activity_level")
      .eq("id", user.id)
      .single(),
  ]);

  const favoriteIds = new Set((favoritesRaw ?? []).map((f: any) => f.recipe_id));

  const recipes = (recipesRaw ?? []).map((r: any) => ({
    id: r.id,
    title: r.title,
    image_url: r.image_url,
    category_slugs: [
      ...(r.recipe_categories?.map((rc: any) => rc.categories?.slug).filter(Boolean) ?? []),
      ...(favoriteIds.has(r.id) ? ["favorite"] : []),
    ],
    recipe_nutrition: Array.isArray(r.recipe_nutrition) ? r.recipe_nutrition[0] ?? null : r.recipe_nutrition ?? null,
  }));

  const allCategories = [
    { id: "favorites", slug: "favorite", name: "MeinFavorit", icon: "❤️", type: "favorite" },
    ...(categories ?? []),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Wochenplan</h1>
        <p className="text-muted-foreground mt-1">Plane deine Mahlzeiten für die Woche</p>
      </div>
      <WeekPlan
        recipes={recipes}
        categories={allCategories}
        macroGoals={{
          protein_goal_g: profile?.protein_goal_g ?? null,
          fat_goal_g: profile?.fat_goal_g ?? null,
          carbs_goal_g: profile?.carbs_goal_g ?? null,
        }}
        calorieGoal={
          profile?.custom_calorie_goal
            ? profile.custom_calorie_goal
            : profile?.weight_kg && profile?.height_cm && profile?.age && profile?.activity_level
              ? calcCalorieGoal(
                  calcTdee(profile.weight_kg, profile.height_cm, profile.age, profile.activity_level as ActivityLevel),
                  (profile.goal_type as GoalType) ?? "maintain"
                )
              : null
        }
      />
    </div>
  );
}
