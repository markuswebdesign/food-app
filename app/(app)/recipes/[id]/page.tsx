import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { NutritionCard } from "@/components/recipes/nutrition-card";
import { DeleteRecipeButton } from "@/components/recipes/delete-recipe-button";
import { Clock, Users, ChefHat } from "lucide-react";

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
      profiles(username),
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
          {isOwner && (
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/recipes/${recipe.id}/edit`}>Bearbeiten</Link>
              </Button>
              <DeleteRecipeButton recipeId={recipe.id} />
            </div>
          )}
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
          {recipe.prep_time_minutes && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> Vorbereitung: {recipe.prep_time_minutes} Min
            </span>
          )}
          {recipe.cook_time_minutes && (
            <span className="flex items-center gap-1.5">
              <ChefHat className="h-4 w-4" /> Kochen: {recipe.cook_time_minutes} Min
            </span>
          )}
          {totalTime > 0 && (
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Clock className="h-4 w-4" /> Gesamt: {totalTime} Min
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" /> {recipe.servings} Portionen
          </span>
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
      {recipe.recipe_nutrition && (
        <>
          <Separator />
          <NutritionCard nutrition={recipe.recipe_nutrition} servings={recipe.servings} />
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
