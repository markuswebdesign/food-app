import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { RecipeFilters } from "@/components/recipes/recipe-filters";
import type { Recipe } from "@/lib/types";

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: { category?: string; diet?: string; q?: string };
}) {
  const supabase = createClient();

  let query = supabase
    .from("recipes")
    .select(`
      id, title, description, image_url, prep_time_minutes, cook_time_minutes,
      servings, is_public, created_at, user_id,
      profiles(username),
      recipe_categories(category_id, categories(id, name, slug, type, icon)),
      recipe_nutrition(calories)
    `)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (searchParams.q) {
    query = query.ilike("title", `%${searchParams.q}%`);
  }

  const { data: recipes } = await query;

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("type");

  const normalized = (recipes ?? []).map((r: any) => ({
    ...r,
    categories: r.recipe_categories?.map((rc: any) => rc.categories) ?? [],
    recipe_nutrition: r.recipe_nutrition ?? null,
  })) as Recipe[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rezepte</h1>
          <p className="text-muted-foreground mt-1">
            {normalized.length} Rezept{normalized.length !== 1 ? "e" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/recipes/new">+ Neues Rezept</Link>
        </Button>
      </div>

      <Suspense fallback={<div className="h-16" />}>
        <RecipeFilters categories={categories ?? []} />
      </Suspense>

      {normalized.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">Noch keine Rezepte vorhanden.</p>
          <Button asChild className="mt-4">
            <Link href="/recipes/new">Erstes Rezept erstellen</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {normalized.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
