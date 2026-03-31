import type { RecipeNutrition } from "@/lib/types";

export interface IngredientNutrition {
  amount: number;
  calories_per_100g?: number | null;
  protein_per_100g?: number | null;
  fat_per_100g?: number | null;
  carbs_per_100g?: number | null;
  fiber_per_100g?: number | null;
}

export function calculateRecipeNutrition(
  ingredients: IngredientNutrition[]
): RecipeNutrition {
  let calories = 0;
  let protein_g = 0;
  let fat_g = 0;
  let carbohydrates_g = 0;
  let fiber_g = 0;

  for (const ing of ingredients) {
    const factor = ing.amount / 100;
    calories += (ing.calories_per_100g ?? 0) * factor;
    protein_g += (ing.protein_per_100g ?? 0) * factor;
    fat_g += (ing.fat_per_100g ?? 0) * factor;
    carbohydrates_g += (ing.carbs_per_100g ?? 0) * factor;
    fiber_g += (ing.fiber_per_100g ?? 0) * factor;
  }

  return {
    calories: Math.round(calories),
    protein_g: Math.round(protein_g * 10) / 10,
    fat_g: Math.round(fat_g * 10) / 10,
    carbohydrates_g: Math.round(carbohydrates_g * 10) / 10,
    fiber_g: Math.round(fiber_g * 10) / 10,
  };
}
