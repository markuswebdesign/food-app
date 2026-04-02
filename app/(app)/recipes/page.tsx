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
  searchParams: { category?: string; diet?: string; q?: string; favorites?: string; mine?: string };
}) {
  const supabase = createClient();

  // Kategorie-IDs für aktive Filter vorab laden
  const filterSlugs = [searchParams.category, searchParams.diet].filter(Boolean) as string[];
  const categoryFilterIds: Record<string, string[]> = {};

  for (const slug of filterSlugs) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .single();

    if (cat) {
      const { data: links } = await supabase
        .from("recipe_categories")
        .select("recipe_id")
        .eq("category_id", cat.id);
      categoryFilterIds[slug] = links?.map((l: any) => l.recipe_id) ?? [];
    }
  }

  let query = supabase
    .from("recipes")
    .select(`
      id, title, description, image_url, prep_time_minutes, cook_time_minutes,
      servings, is_public, created_at, user_id,
      profiles!recipes_user_id_fkey(username, avatar_url),
      recipe_categories(category_id, categories(id, name, slug, type, icon)),
      recipe_nutrition(calories)
    `)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (searchParams.q) {
    query = query.ilike("title", `%${searchParams.q}%`);
  }

  if (searchParams.category && categoryFilterIds[searchParams.category]) {
    const ids = categoryFilterIds[searchParams.category];
    query = query.in("id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"]);
  }

  if (searchParams.diet && categoryFilterIds[searchParams.diet]) {
    const ids = categoryFilterIds[searchParams.diet];
    query = query.in("id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"]);
  }

  const { data: recipes } = await query;
  const { data: categories } = await supabase.from("categories").select("*").order("type");

  let favoriteIds = new Set<string>();
  let currentUserId: string | null = null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      currentUserId = user.id;
      const { data: favs } = await supabase
        .from("favorites")
        .select("recipe_id")
        .eq("user_id", user.id);
      favoriteIds = new Set((favs ?? []).map((f: any) => f.recipe_id));
    }
  } catch {}

  let normalized = (recipes ?? []).map((r: any) => ({
    ...r,
    categories: r.recipe_categories?.map((rc: any) => rc.categories) ?? [],
    recipe_nutrition: Array.isArray(r.recipe_nutrition)
      ? r.recipe_nutrition[0] ?? null
      : r.recipe_nutrition ?? null,
    is_favorited: favoriteIds.has(r.id),
  })) as Recipe[];

  if (searchParams.favorites === "1") {
    normalized = normalized.filter((r) => r.is_favorited);
  }

  if (searchParams.mine === "1" && currentUserId) {
    normalized = normalized.filter((r) => r.user_id === currentUserId);
  }

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
        <RecipeFilters categories={categories ?? []} showMineFilter={!!currentUserId} />
      </Suspense>

      {normalized.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">Keine Rezepte gefunden.</p>
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
