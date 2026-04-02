import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Users } from "lucide-react";
import type { Recipe } from "@/lib/types";
import { FavoriteButton } from "./favorite-button";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const totalTime = (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);

  return (
    <div className="relative">
      <Link href={`/recipes/${recipe.id}`}>
        <Card className="h-full hover:shadow-md transition-shadow overflow-hidden">
          {recipe.image_url ? (
            <div className="aspect-video overflow-hidden">
              <img
                src={recipe.image_url}
                alt={recipe.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="aspect-video bg-muted flex items-center justify-center text-4xl">
              🍽
            </div>
          )}

          <CardHeader className="pb-2">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2">
              {recipe.title}
            </h3>
            {recipe.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {recipe.description}
              </p>
            )}
          </CardHeader>

          <CardContent className="pb-2">
            <div className="flex flex-wrap gap-1.5">
              {recipe.categories?.slice(0, 3).map((cat) => (
                <Badge key={cat.id} variant="secondary" className="text-xs">
                  {cat.name}
                </Badge>
              ))}
            </div>
          </CardContent>

          <CardFooter className="text-xs text-muted-foreground flex flex-col gap-2 items-start">
            <div className="flex gap-4">
              {totalTime > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {totalTime} Min
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" /> {recipe.servings} Portionen
              </span>
              {recipe.recipe_nutrition?.calories && (
                <span>{Math.round(recipe.recipe_nutrition.calories)} kcal</span>
              )}
            </div>
            {recipe.profiles?.username && (
              <div className="flex items-center gap-1.5">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={recipe.profiles.avatar_url ?? undefined} />
                  <AvatarFallback className="text-[8px]">
                    {recipe.profiles.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>@{recipe.profiles.username}</span>
              </div>
            )}
          </CardFooter>
        </Card>
      </Link>

      <div className="absolute top-2 right-2">
        <FavoriteButton
          recipeId={recipe.id}
          initialFavorited={recipe.is_favorited ?? false}
        />
      </div>
    </div>
  );
}
