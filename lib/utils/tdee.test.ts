import { describe, it, expect } from "vitest";
import {
  calcBmr,
  calcTdee,
  calcCalorieGoal,
  validateHealthInputs,
} from "./tdee";

describe("calcBmr", () => {
  it("berechnet BMR korrekt für Beispielwerte (75kg, 175cm, 30 Jahre)", () => {
    // 10*75 + 6.25*175 - 5*30 - 78 = 750 + 1093.75 - 150 - 78 = 1615.75
    expect(calcBmr(75, 175, 30)).toBeCloseTo(1615.75);
  });

  it("berechnet BMR für Grenzwerte (30kg, 100cm, 10 Jahre)", () => {
    // 10*30 + 6.25*100 - 5*10 - 78 = 300 + 625 - 50 - 78 = 797
    expect(calcBmr(30, 100, 10)).toBeCloseTo(797);
  });
});

describe("calcTdee", () => {
  it("multipliziert BMR mit Aktivitätsfaktor 1.2 für sedentary", () => {
    const bmr = calcBmr(75, 175, 30);
    expect(calcTdee(75, 175, 30, "sedentary")).toBe(Math.round(bmr * 1.2));
  });

  it("multipliziert BMR mit Faktor 1.55 für moderately_active", () => {
    const bmr = calcBmr(75, 175, 30);
    expect(calcTdee(75, 175, 30, "moderately_active")).toBe(Math.round(bmr * 1.55));
  });

  it("multipliziert BMR mit Faktor 1.9 für extra_active", () => {
    const bmr = calcBmr(75, 175, 30);
    expect(calcTdee(75, 175, 30, "extra_active")).toBe(Math.round(bmr * 1.9));
  });

  it("gibt eine ganze Zahl zurück (gerundet)", () => {
    const result = calcTdee(75, 175, 30, "lightly_active");
    expect(Number.isInteger(result)).toBe(true);
  });
});

describe("calcCalorieGoal", () => {
  it("gibt TDEE - 500 bei Ziel 'lose'", () => {
    expect(calcCalorieGoal(2000, "lose")).toBe(1500);
  });

  it("gibt TDEE bei Ziel 'maintain'", () => {
    expect(calcCalorieGoal(2000, "maintain")).toBe(2000);
  });

  it("gibt manuelles Ziel zurück wenn gesetzt", () => {
    expect(calcCalorieGoal(2000, "lose", 1800)).toBe(1800);
  });

  it("ignoriert manuelles Ziel wenn null", () => {
    expect(calcCalorieGoal(2000, "lose", null)).toBe(1500);
  });

  it("ignoriert manuelles Ziel wenn 0 (ungültig)", () => {
    expect(calcCalorieGoal(2000, "lose", 0)).toBe(1500);
  });
});

describe("validateHealthInputs", () => {
  it("gibt keine Fehler für gültige Werte zurück", () => {
    expect(validateHealthInputs(75, 175, 30)).toEqual({});
  });

  it("gibt Fehler für zu niedriges Gewicht zurück (< 30 kg)", () => {
    const errors = validateHealthInputs(20, 175, 30);
    expect(errors.weight).toBeDefined();
  });

  it("gibt Fehler für zu hohes Gewicht zurück (> 300 kg)", () => {
    const errors = validateHealthInputs(500, 175, 30);
    expect(errors.weight).toBeDefined();
  });

  it("gibt Fehler für zu kleine Größe zurück (< 100 cm)", () => {
    const errors = validateHealthInputs(75, 50, 30);
    expect(errors.height).toBeDefined();
  });

  it("gibt Fehler für zu großes Alter zurück (> 120 Jahre)", () => {
    const errors = validateHealthInputs(75, 175, 150);
    expect(errors.age).toBeDefined();
  });

  it("gibt mehrere Fehler gleichzeitig zurück", () => {
    const errors = validateHealthInputs(5, 50, 150);
    expect(Object.keys(errors).length).toBe(3);
  });

  it("akzeptiert Grenzwerte als gültig (30kg, 100cm, 10 Jahre)", () => {
    expect(validateHealthInputs(30, 100, 10)).toEqual({});
  });

  it("akzeptiert obere Grenzwerte als gültig (300kg, 250cm, 120 Jahre)", () => {
    expect(validateHealthInputs(300, 250, 120)).toEqual({});
  });
});
