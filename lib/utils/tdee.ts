export type ActivityLevel =
  | "sedentary"
  | "lightly_active"
  | "moderately_active"
  | "very_active"
  | "extra_active";

export type GoalType = "lose" | "maintain";

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

/** Mifflin-St Jeor, gender-neutral average */
export function calcBmr(weight: number, height: number, age: number): number {
  return 10 * weight + 6.25 * height - 5 * age - 78;
}

export function calcTdee(
  weight: number,
  height: number,
  age: number,
  activity: ActivityLevel
): number {
  return Math.round(calcBmr(weight, height, age) * ACTIVITY_FACTORS[activity]);
}

export function calcCalorieGoal(
  tdee: number,
  goal: GoalType,
  customGoal?: number | null
): number {
  if (customGoal != null && customGoal > 0) return customGoal;
  return goal === "lose" ? tdee - 500 : tdee;
}

export function validateHealthInputs(
  weight: number,
  height: number,
  age: number
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (weight < 30 || weight > 300)
    errors.weight = "Gewicht muss zwischen 30 und 300 kg liegen";
  if (height < 100 || height > 250)
    errors.height = "Größe muss zwischen 100 und 250 cm liegen";
  if (age < 10 || age > 120)
    errors.age = "Alter muss zwischen 10 und 120 Jahren liegen";
  return errors;
}
