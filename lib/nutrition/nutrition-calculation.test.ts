/**
 * QA tests for nutrition calculation logic used in day-log.tsx.
 * Tests the calculatedFood formula: amount/100 * per100g values.
 * Also tests scaleRecipeNutrition from lib/utils/log.ts.
 */
import { describe, it, expect } from "vitest";
import { scaleRecipeNutrition, sumCalories, calorieBalanceLabel } from "@/lib/utils/log";
import { lookupLocalIngredient, type NutritionPer100g } from "./local-ingredients";

// ── calculatedFood formula (inline in day-log.tsx) ──────────────────────────

function calculateFood(nutrition: NutritionPer100g, amountG: number) {
  const factor = amountG / 100;
  return {
    calories: Math.round(nutrition.calories_per_100g * factor),
    protein_g: Math.round(nutrition.protein_per_100g * factor * 10) / 10,
    fat_g: Math.round(nutrition.fat_per_100g * factor * 10) / 10,
    carbs_g: Math.round(nutrition.carbs_per_100g * factor * 10) / 10,
  };
}

describe("calculateFood (day-log formula)", () => {
  it("calculates correctly for 100g (identity)", () => {
    const apfel = lookupLocalIngredient("Apfel")!;
    const result = calculateFood(apfel, 100);
    expect(result.calories).toBe(52);
    expect(result.protein_g).toBe(0.3);
    expect(result.fat_g).toBe(0.2);
    expect(result.carbs_g).toBe(14);
  });

  it("calculates correctly for 200g (double)", () => {
    const apfel = lookupLocalIngredient("Apfel")!;
    const result = calculateFood(apfel, 200);
    expect(result.calories).toBe(104);
    expect(result.protein_g).toBe(0.6);
    expect(result.carbs_g).toBe(28);
  });

  it("calculates correctly for 50g (half)", () => {
    const reis = lookupLocalIngredient("Reis")!;
    const result = calculateFood(reis, 50);
    expect(result.calories).toBe(180);
    expect(result.protein_g).toBe(3.5);
  });

  it("calculates correctly for 150g Snickers", () => {
    const snickers = lookupLocalIngredient("Snickers")!;
    const result = calculateFood(snickers, 150);
    expect(result.calories).toBe(732);
    expect(result.protein_g).toBe(7.4);  // 4.9 * 1.5 = 7.35, rounded
  });

  it("handles 0g amount (returns zero macros)", () => {
    const apfel = lookupLocalIngredient("Apfel")!;
    const result = calculateFood(apfel, 0);
    expect(result.calories).toBe(0);
    expect(result.protein_g).toBe(0);
    expect(result.fat_g).toBe(0);
    expect(result.carbs_g).toBe(0);
  });

  it("handles very small amounts (5g)", () => {
    const butter = lookupLocalIngredient("Butter")!;
    const result = calculateFood(butter, 5);
    expect(result.calories).toBe(37); // 741 * 0.05 = 37.05
    expect(result.fat_g).toBe(4.1);   // 82 * 0.05 = 4.1
  });

  it("handles large amounts (1000g)", () => {
    const milch = lookupLocalIngredient("Milch")!;
    const result = calculateFood(milch, 1000);
    expect(result.calories).toBe(640);
  });

  it("handles fractional results with proper rounding", () => {
    // Proteinshake: 20g protein per 100g
    // 33g: 20 * 0.33 = 6.6 -> 6.6
    const shake = lookupLocalIngredient("Proteinshake")!;
    const result = calculateFood(shake, 33);
    expect(result.protein_g).toBe(6.6);
  });
});

// ── scaleRecipeNutrition ────────────────────────────────────────────────────

describe("scaleRecipeNutrition", () => {
  const recipe = {
    id: "test-1",
    title: "Test Recipe",
    calories_per_serving: 500,
    protein_per_serving: 30,
    fat_per_serving: 20,
    carbs_per_serving: 50,
    servings: 4,
  };

  it("scales by 1 serving (identity)", () => {
    const result = scaleRecipeNutrition(recipe, 1);
    expect(result.calories).toBe(500);
    expect(result.protein_g).toBe(30);
    expect(result.fat_g).toBe(20);
    expect(result.carbs_g).toBe(50);
  });

  it("scales by 2 servings", () => {
    const result = scaleRecipeNutrition(recipe, 2);
    expect(result.calories).toBe(1000);
    expect(result.protein_g).toBe(60);
  });

  it("scales by 0.5 servings", () => {
    const result = scaleRecipeNutrition(recipe, 0.5);
    expect(result.calories).toBe(250);
    expect(result.protein_g).toBe(15);
  });

  it("handles null nutrition values", () => {
    const nullRecipe = {
      id: "test-2",
      title: "No Nutrition",
      calories_per_serving: null,
      protein_per_serving: null,
      fat_per_serving: null,
      carbs_per_serving: null,
      servings: 1,
    };
    const result = scaleRecipeNutrition(nullRecipe, 2);
    expect(result.calories).toBe(0);
    expect(result.protein_g).toBeNull();
    expect(result.fat_g).toBeNull();
    expect(result.carbs_g).toBeNull();
  });
});

// ── sumCalories ─────────────────────────────────────────────────────────────

describe("sumCalories", () => {
  it("sums correctly", () => {
    expect(sumCalories([{ calories: 100 }, { calories: 250 }, { calories: 50 }])).toBe(400);
  });

  it("returns 0 for empty array", () => {
    expect(sumCalories([])).toBe(0);
  });
});

// ── calorieBalanceLabel ─────────────────────────────────────────────────────

describe("calorieBalanceLabel", () => {
  it("shows deficit when under goal", () => {
    const result = calorieBalanceLabel(1500, 2000);
    expect(result.isDeficit).toBe(true);
  });

  it("shows surplus when over goal", () => {
    const result = calorieBalanceLabel(2500, 2000);
    expect(result.isDeficit).toBe(false);
  });

  it("shows deficit when exactly at goal (diff=0)", () => {
    const result = calorieBalanceLabel(2000, 2000);
    expect(result.isDeficit).toBe(true);
  });
});
