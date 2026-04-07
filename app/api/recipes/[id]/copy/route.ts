import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: original } = await supabase
    .from("recipes")
    .select(`*, ingredients(*), recipe_nutrition(*), recipe_categories(category_id)`)
    .eq("id", params.id)
    .single();

  if (!original) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Must not already own it
  if (original.user_id === user.id) {
    return NextResponse.json({ error: "Already your recipe" }, { status: 400 });
  }

  const { data: copy, error: recipeError } = await supabase
    .from("recipes")
    .insert({
      user_id: user.id,
      title: original.title,
      description: original.description,
      instructions: original.instructions,
      servings: original.servings,
      prep_time_minutes: original.prep_time_minutes,
      cook_time_minutes: original.cook_time_minutes,
      image_url: original.image_url,
      source_url: original.source_url,
      is_public: false,
      is_global: false,
    })
    .select("id")
    .single();

  if (recipeError || !copy) return NextResponse.json({ error: "Failed to copy" }, { status: 500 });

  if (original.ingredients?.length > 0) {
    await supabase.from("ingredients").insert(
      original.ingredients.map((ing: any) => ({
        recipe_id: copy.id,
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
        calories_per_100g: ing.calories_per_100g,
        protein_per_100g: ing.protein_per_100g,
        fat_per_100g: ing.fat_per_100g,
        carbs_per_100g: ing.carbs_per_100g,
        micronutrients: ing.micronutrients,
      }))
    );
  }

  const nutrition = Array.isArray(original.recipe_nutrition)
    ? original.recipe_nutrition[0]
    : original.recipe_nutrition;
  if (nutrition) {
    await supabase.from("recipe_nutrition").insert({
      recipe_id: copy.id,
      calories: nutrition.calories,
      protein_g: nutrition.protein_g,
      fat_g: nutrition.fat_g,
      carbohydrates_g: nutrition.carbohydrates_g,
      fiber_g: nutrition.fiber_g,
      nutrition_source: nutrition.nutrition_source,
    });
  }

  if (original.recipe_categories?.length > 0) {
    await supabase.from("recipe_categories").insert(
      original.recipe_categories.map((rc: any) => ({
        recipe_id: copy.id,
        category_id: rc.category_id,
      }))
    );
  }

  return NextResponse.json({ recipeId: copy.id }, { status: 201 });
}
