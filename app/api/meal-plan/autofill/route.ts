import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type MealTime = "breakfast" | "lunch" | "dinner" | "snack";

const DAYS = 7;
const MEAL_TIMES: MealTime[] = ["breakfast", "lunch", "dinner", "snack"];

const SLUG_TO_MEAL: Record<string, MealTime> = {
  breakfast: "breakfast",
  lunch: "lunch",
  dinner: "dinner",
  snack: "snack",
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getMonday(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
}

function dateForDay(weekStart: string, dayOfWeek: number): string {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + (dayOfWeek - 1));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mode } = await request.json() as { mode: "overwrite" | "empty-only" };

  // Fetch favorites with categories
  const { data: favoritesRaw } = await supabase
    .from("favorites")
    .select("recipe_id, recipes(id, title, image_url, recipe_nutrition(calories, protein_g, fat_g, carbohydrates_g), recipe_categories(categories(slug)))")
    .eq("user_id", user.id);

  const favorites = (favoritesRaw ?? []).map((f: any) => ({
    id: f.recipe_id,
    title: f.recipes?.title ?? "",
    image_url: f.recipes?.image_url ?? null,
    nutrition: Array.isArray(f.recipes?.recipe_nutrition) ? f.recipes.recipe_nutrition[0] ?? null : null,
    slugs: (f.recipes?.recipe_categories ?? []).map((rc: any) => rc.categories?.slug).filter(Boolean) as string[],
  }));

  if (favorites.length < 10) {
    return NextResponse.json({ error: "too_few_favorites", count: favorites.length }, { status: 400 });
  }

  // Group by meal time
  const byMeal: Record<MealTime, typeof favorites> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };

  for (const fav of favorites) {
    let assigned = false;
    for (const slug of fav.slugs) {
      if (SLUG_TO_MEAL[slug]) {
        byMeal[SLUG_TO_MEAL[slug]].push(fav);
        assigned = true;
        break;
      }
    }
    if (!assigned) {
      // Uncategorized → distribute as lunch or dinner
      const target = Math.random() < 0.5 ? "lunch" : "dinner";
      byMeal[target].push(fav);
    }
  }

  // Upsert meal plan for current week
  const weekStart = getMonday(new Date());
  const { data: plan } = await supabase
    .from("meal_plans")
    .upsert({ user_id: user.id, week_start: weekStart }, { onConflict: "user_id,week_start" })
    .select("id")
    .single();

  if (!plan) return NextResponse.json({ error: "Wochenplan konnte nicht erstellt werden" }, { status: 500 });

  // Load existing entries if mode is "empty-only"
  let existingSlots = new Set<string>();
  if (mode === "empty-only") {
    const { data: existing } = await supabase
      .from("meal_plan_entries")
      .select("day_of_week, meal_time")
      .eq("meal_plan_id", plan.id);
    existingSlots = new Set((existing ?? []).map((e: any) => `${e.day_of_week}-${e.meal_time}`));
  } else {
    // Delete all existing entries + their log entries
    const { data: existing } = await supabase
      .from("meal_plan_entries")
      .select("id, food_log_entry_id")
      .eq("meal_plan_id", plan.id);
    if (existing && existing.length > 0) {
      const logIds = existing.map((e: any) => e.food_log_entry_id).filter(Boolean);
      if (logIds.length > 0) await supabase.from("food_log_entries").delete().in("id", logIds);
      await supabase.from("meal_plan_entries").delete().eq("meal_plan_id", plan.id);
    }
  }

  // Build pointers for cycling through shuffled pools
  const pools: Record<MealTime, { items: typeof favorites; idx: number }> = {
    breakfast: { items: shuffle(byMeal.breakfast), idx: 0 },
    lunch: { items: shuffle(byMeal.lunch), idx: 0 },
    dinner: { items: shuffle(byMeal.dinner), idx: 0 },
    snack: { items: shuffle(byMeal.snack), idx: 0 },
  };

  function nextRecipe(meal: MealTime) {
    const pool = pools[meal];
    if (pool.items.length === 0) return null;
    const item = pool.items[pool.idx % pool.items.length];
    pool.idx++;
    return item;
  }

  for (const meal of MEAL_TIMES) {
    for (let day = 1; day <= DAYS; day++) {
      const slotKey = `${day}-${meal}`;
      if (mode === "empty-only" && existingSlots.has(slotKey)) continue;

      const recipe = nextRecipe(meal);
      if (!recipe) continue;

      const entryDate = dateForDay(weekStart, day);
      const { data: logEntry } = await supabase
        .from("food_log_entries")
        .insert({
          user_id: user.id,
          date: entryDate,
          name: recipe.title,
          calories: recipe.nutrition?.calories ?? 0,
          protein_g: recipe.nutrition?.protein_g ?? null,
          fat_g: recipe.nutrition?.fat_g ?? null,
          carbs_g: recipe.nutrition?.carbohydrates_g ?? null,
          servings: 1,
          meal_time: meal,
          recipe_id: recipe.id,
        })
        .select("id")
        .single();

      await supabase.from("meal_plan_entries").insert({
        meal_plan_id: plan.id,
        recipe_id: recipe.id,
        day_of_week: day,
        meal_time: meal,
        servings: 1,
        food_log_entry_id: logEntry?.id ?? null,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
