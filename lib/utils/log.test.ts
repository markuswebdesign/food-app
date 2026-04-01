import { describe, it, expect, vi, afterEach } from "vitest";
import {
  toDateString,
  isToday,
  scaleRecipeNutrition,
  sumCalories,
  calorieBalanceLabel,
} from "./log";
import type { RecipeOption } from "@/components/log/day-log";

const baseRecipe: RecipeOption = {
  id: "r1",
  title: "Pasta",
  servings: 2,
  calories_per_serving: 400, // per serving (not per recipe total)
  protein_per_serving: 15,
  fat_per_serving: 10,
  carbs_per_serving: 60,
};

describe("toDateString", () => {
  it("gibt YYYY-MM-DD Format zurück", () => {
    const d = new Date("2026-04-01T12:00:00Z");
    expect(toDateString(d)).toBe("2026-04-01");
  });
});

describe("isToday", () => {
  it("gibt true für heutiges Datum zurück", () => {
    expect(isToday(new Date())).toBe(true);
  });

  it("gibt false für gestern zurück", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isToday(yesterday)).toBe(false);
  });

  it("gibt false für morgen zurück", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(isToday(tomorrow)).toBe(false);
  });
});

describe("scaleRecipeNutrition", () => {
  it("skaliert Kalorien korrekt für 1 Portion", () => {
    const result = scaleRecipeNutrition(baseRecipe, 1);
    expect(result.calories).toBe(400);
  });

  it("skaliert Kalorien korrekt für 2 Portionen", () => {
    const result = scaleRecipeNutrition(baseRecipe, 2);
    expect(result.calories).toBe(800);
  });

  it("skaliert Makros proportional", () => {
    const result = scaleRecipeNutrition(baseRecipe, 2);
    // factor = 2 / 2 = 1
    expect(result.protein_g).toBe(15);
    expect(result.fat_g).toBe(10);
    expect(result.carbs_g).toBe(60);
  });

  it("skaliert Makros für halbe Portion", () => {
    const result = scaleRecipeNutrition(baseRecipe, 1);
    // factor = 1 / 2 = 0.5
    expect(result.protein_g).toBe(7.5);
    expect(result.fat_g).toBe(5);
    expect(result.carbs_g).toBe(30);
  });

  it("gibt 0 Kalorien zurück wenn calories_per_serving null ist", () => {
    const recipe = { ...baseRecipe, calories_per_serving: null };
    const result = scaleRecipeNutrition(recipe, 1);
    expect(result.calories).toBe(0);
  });

  it("gibt null Makros zurück wenn nicht vorhanden", () => {
    const recipe = { ...baseRecipe, protein_per_serving: null, fat_per_serving: null, carbs_per_serving: null };
    const result = scaleRecipeNutrition(recipe, 1);
    expect(result.protein_g).toBeNull();
    expect(result.fat_g).toBeNull();
    expect(result.carbs_g).toBeNull();
  });

  it("behandelt servings=0 im Rezept ohne Division-by-zero", () => {
    const recipe = { ...baseRecipe, servings: 0 };
    const result = scaleRecipeNutrition(recipe, 1);
    // servings || 1 verhindert Division durch 0
    expect(result.calories).toBe(400);
  });
});

describe("sumCalories", () => {
  it("summiert Kalorien korrekt", () => {
    const entries = [{ calories: 300 }, { calories: 500 }, { calories: 200 }];
    expect(sumCalories(entries)).toBe(1000);
  });

  it("gibt 0 für leere Liste zurück", () => {
    expect(sumCalories([])).toBe(0);
  });

  it("funktioniert mit Dezimalwerten", () => {
    const entries = [{ calories: 100.5 }, { calories: 200.3 }];
    expect(sumCalories(entries)).toBeCloseTo(300.8);
  });
});

describe("calorieBalanceLabel", () => {
  it("zeigt Defizit korrekt (consumed < goal)", () => {
    const { label, isDeficit } = calorieBalanceLabel(1300, 1800);
    expect(label).toContain("500");
    expect(label).toContain("−");
    expect(isDeficit).toBe(true);
  });

  it("zeigt Überschuss korrekt (consumed > goal)", () => {
    const { label, isDeficit } = calorieBalanceLabel(2100, 1800);
    expect(label).toContain("300");
    expect(label).toContain("+");
    expect(isDeficit).toBe(false);
  });

  it("zeigt 0 Defizit wenn exakt auf Ziel", () => {
    const { label, isDeficit } = calorieBalanceLabel(1800, 1800);
    expect(label).toContain("0");
    expect(isDeficit).toBe(true);
  });
});
