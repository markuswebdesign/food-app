import { describe, it, expect } from "vitest";
import { sumMacros, defaultMacroGoals, effectiveMacroGoals } from "./macro-progress";

describe("sumMacros", () => {
  it("sums all macros from entries with data", () => {
    const result = sumMacros([
      { protein_g: 30, fat_g: 10, carbs_g: 50 },
      { protein_g: 20, fat_g: 5,  carbs_g: 30 },
    ]);
    expect(result.protein_g).toBe(50);
    expect(result.fat_g).toBe(15);
    expect(result.carbs_g).toBe(80);
    expect(result.hasData).toBe(true);
  });

  it("sets hasData=false for empty entries", () => {
    const result = sumMacros([]);
    expect(result.hasData).toBe(false);
    expect(result.protein_g).toBe(0);
  });

  it("sets hasData=false when all macro fields are null (calories-only entry)", () => {
    const result = sumMacros([
      { protein_g: null, fat_g: null, carbs_g: null },
    ]);
    expect(result.hasData).toBe(false);
  });

  it("sets hasData=true when at least one macro field is non-null", () => {
    const result = sumMacros([
      { protein_g: null, fat_g: null, carbs_g: null },
      { protein_g: 25, fat_g: null, carbs_g: null },
    ]);
    expect(result.hasData).toBe(true);
    expect(result.protein_g).toBe(25);
  });

  it("skips null values instead of treating as 0", () => {
    const result = sumMacros([
      { protein_g: 10, fat_g: null, carbs_g: 20 },
    ]);
    expect(result.fat_g).toBe(0); // internal accumulator stays 0, not NaN
    expect(result.protein_g).toBe(10);
    expect(result.carbs_g).toBe(20);
  });
});

describe("defaultMacroGoals", () => {
  it("calculates 30/30/40 split from calorie goal", () => {
    const goals = defaultMacroGoals(2000);
    // Protein: 2000 * 0.30 / 4 = 150g
    expect(goals.protein_goal_g).toBe(150);
    // Fat: 2000 * 0.30 / 9 ≈ 67g
    expect(goals.fat_goal_g).toBe(67);
    // Carbs: 2000 * 0.40 / 4 = 200g
    expect(goals.carbs_goal_g).toBe(200);
  });

  it("rounds to whole grams", () => {
    const goals = defaultMacroGoals(1500);
    expect(Number.isInteger(goals.protein_goal_g)).toBe(true);
    expect(Number.isInteger(goals.fat_goal_g)).toBe(true);
    expect(Number.isInteger(goals.carbs_goal_g)).toBe(true);
  });

  it("handles low calorie goals (e.g. 500 kcal)", () => {
    const goals = defaultMacroGoals(500);
    // Should not crash, values should be positive
    expect(goals.protein_goal_g).toBeGreaterThan(0);
    expect(goals.fat_goal_g).toBeGreaterThan(0);
    expect(goals.carbs_goal_g).toBeGreaterThan(0);
  });
});

describe("effectiveMacroGoals", () => {
  const manual = { protein_goal_g: 160, fat_goal_g: 60, carbs_goal_g: 220 };
  const empty  = { protein_goal_g: null, fat_goal_g: null, carbs_goal_g: null };

  it("returns manual goals when all three are set", () => {
    const result = effectiveMacroGoals(manual, 2000);
    expect(result).toEqual(manual);
  });

  it("falls back to default goals when manual goals are not set", () => {
    const result = effectiveMacroGoals(empty, 2000);
    expect(result).toEqual(defaultMacroGoals(2000));
  });

  it("returns null when no manual goals and no calorie goal", () => {
    const result = effectiveMacroGoals(empty, null);
    expect(result).toBeNull();
  });

  it("returns default goals when only some manual values are set (partial)", () => {
    // Only protein_goal_g set — not all three → falls back to default
    const partial = { protein_goal_g: 160, fat_goal_g: null, carbs_goal_g: null };
    const result = effectiveMacroGoals(partial, 2000);
    expect(result).toEqual(defaultMacroGoals(2000));
  });
});
