import type { RecipeOption } from "@/components/log/day-log";

export function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function isToday(date: Date): boolean {
  return toDateString(date) === toDateString(new Date());
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export type ScaledNutrition = {
  calories: number;
  protein_g: number | null;
  fat_g: number | null;
  carbs_g: number | null;
};

/** Scale recipe nutrition by number of servings ordered.
 * All *_per_serving values are already per-portion (PROJ-11).
 * Multiply directly by the number of servings logged. */
export function scaleRecipeNutrition(
  recipe: RecipeOption,
  servings: number
): ScaledNutrition {
  return {
    calories: recipe.calories_per_serving != null
      ? Math.round(recipe.calories_per_serving * servings)
      : 0,
    protein_g: recipe.protein_per_serving != null
      ? Math.round(recipe.protein_per_serving * servings * 10) / 10
      : null,
    fat_g: recipe.fat_per_serving != null
      ? Math.round(recipe.fat_per_serving * servings * 10) / 10
      : null,
    carbs_g: recipe.carbs_per_serving != null
      ? Math.round(recipe.carbs_per_serving * servings * 10) / 10
      : null,
  };
}

/** Sum total calories from a list of log entries */
export function sumCalories(entries: { calories: number }[]): number {
  return entries.reduce((sum, e) => sum + e.calories, 0);
}

/** Determine deficit/surplus label vs. goal */
export function calorieBalanceLabel(
  consumed: number,
  goal: number
): { label: string; isDeficit: boolean } {
  const diff = Math.round(goal - consumed);
  if (diff >= 0) {
    return { label: `−${diff.toLocaleString("de-DE")} kcal`, isDeficit: true };
  }
  return { label: `+${Math.abs(diff).toLocaleString("de-DE")} kcal`, isDeficit: false };
}
