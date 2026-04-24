export type Category = {
  id: string;
  name: string;
  type: "meal_time" | "diet";
  slug: string;
  icon: string | null;
};

export type Ingredient = {
  id: string;
  recipe_id: string;
  name: string;
  amount: number | null;
  unit: string | null;
  calories_per_100g: number | null;
  protein_per_100g: number | null;
  fat_per_100g: number | null;
  carbs_per_100g: number | null;
  micronutrients: Record<string, number>;
};

export type RecipeNutrition = {
  calories: number | null;
  protein_g: number | null;
  fat_g: number | null;
  carbohydrates_g: number | null;
  fiber_g: number | null;
  nutrition_source?: "calculated" | "manual" | null;
  unknown_ingredients?: string[] | null;
};

export type Recipe = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  instructions: string;
  servings: number;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  image_url: string | null;
  source_url: string | null;
  is_public: boolean;
  is_global: boolean;
  created_at: string;
  updated_at: string;
  categories?: Category[];
  ingredients?: Ingredient[];
  recipe_nutrition?: RecipeNutrition | null;
  profiles?: { username: string; avatar_url: string | null } | null;
  is_favorited?: boolean;
  in_meal_plan?: boolean;
};
