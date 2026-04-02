import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { NutritionCard } from "@/components/recipes/nutrition-card";
import { DeleteRecipeButton } from "@/components/recipes/delete-recipe-button";
import { FavoriteButton } from "@/components/recipes/favorite-button";
import { Clock, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function RecipeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: recipe } = await supabase
    .from("recipes")
    .select(`
      *,
      profiles!recipes_user_id_fkey(username, avatar_url),
      recipe_categories(categories(id, name, slug, type, icon)),
      ingredients(*),
      recipe_nutrition(*)
    `)
    .eq("id", params.id)
    .single();

  if (!recipe) notFound();

  const categories = recipe.recipe_categories?.map((rc: any) => rc.categories) ?? [];
  const isOwner = user?.id === recipe.user_id;
  const totalTime = (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);

  const { data: favoriteRow } = user
    ? await supabase
        .from("favorites")
        .select("recipe_id")
        .eq("recipe_id", params.id)
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };
  const isFavorited = !!favoriteRow;

  const nutrition = Array.isArray(recipe.recipe_nutrition)
    ? recipe.recipe_nutrition[0] ?? null
    : recipe.recipe_nutrition ?? null;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        {recipe.image_url && (
          <div className="aspect-video w-full overflow-hidden rounded-xl">
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold">{recipe.title}</h1>
          <div className="flex gap-2 shrink-0">
            {user && (
              <FavoriteButton recipeId={recipe.id} initialFavorited={isFavorited} />
            )}
            {isOwner && (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/recipes/${recipe.id}/edit`}>Bearbeiten</Link>
                </Button>
                <DeleteRecipeButton recipeId={recipe.id} />
              </>
            )}
          </div>
        </div>

        {recipe.description && (
          <p className="text-muted-foreground text-lg">{recipe.description}</p>
        )}

        <div className="flex flex-wrap gap-2">
          {categories.map((cat: any) => (
            <Badge key={cat.id} variant="secondary">
              {cat.name}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          {totalTime > 0 && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> Arbeitszeit: {totalTime} Min
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" /> {recipe.servings} Portionen
          </span>
          {recipe.profiles?.username && (
            <span className="flex items-center gap-1.5">
              <Avatar className="h-5 w-5">
                <AvatarImage src={(recipe.profiles as any).avatar_url ?? undefined} />
                <AvatarFallback className="text-[10px]">
                  {recipe.profiles.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              @{recipe.profiles.username}
            </span>
          )}
        </div>
      </div>

      <Separator />

      {/* Ingredients */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Zutaten</h2>
        {recipe.ingredients && recipe.ingredients.length > 0 ? (
          <ul className="space-y-2">
            {recipe.ingredients.map((ing: any) => (
              <li key={ing.id} className="flex items-center gap-3 text-sm">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                <span className="font-medium">
                  {ing.amount && `${ing.amount} ${ing.unit ?? ""}`.trim()}
                </span>
                <span>{ing.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">Keine Zutaten angegeben.</p>
        )}
      </div>

      <Separator />

      {/* Instructions */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Zubereitung</h2>
        <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
          {recipe.instructions}
        </div>
      </div>

      {/* Nutrition */}
      {nutrition && (
        <>
          <Separator />
          <NutritionCard nutrition={nutrition} servings={recipe.servings} />
        </>
      )}

      {recipe.source_url && (
        <p className="text-sm text-muted-foreground">
          Quelle:{" "}
          <a href={recipe.source_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
            {recipe.source_url}
          </a>
        </p>
      )}
    </div>
  );
}
