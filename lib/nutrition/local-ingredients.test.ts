import { describe, it, expect } from "vitest";
import { lookupLocalIngredient } from "./local-ingredients";

describe("lookupLocalIngredient", () => {
  // Exakte Treffer
  it("findet Mehl exakt", () => {
    const result = lookupLocalIngredient("Mehl");
    expect(result).not.toBeNull();
    expect(result!.calories_per_100g).toBe(340);
    expect(result!.protein_per_100g).toBe(10);
  });

  it("findet Butter exakt", () => {
    const result = lookupLocalIngredient("Butter");
    expect(result).not.toBeNull();
    expect(result!.calories_per_100g).toBe(741);
    expect(result!.fat_per_100g).toBe(82);
  });

  it("findet Eier (singular)", () => {
    const result = lookupLocalIngredient("Ei");
    expect(result).not.toBeNull();
    expect(result!.protein_per_100g).toBe(13);
  });

  it("findet Olivenöl", () => {
    const result = lookupLocalIngredient("Olivenöl");
    expect(result).not.toBeNull();
    expect(result!.calories_per_100g).toBe(884);
    expect(result!.fat_per_100g).toBe(100);
  });

  // Groß-/Kleinschreibung
  it("ist case-insensitiv", () => {
    expect(lookupLocalIngredient("MEHL")).not.toBeNull();
    expect(lookupLocalIngredient("butter")).not.toBeNull();
    expect(lookupLocalIngredient("Hähnchenbrust")).not.toBeNull();
  });

  // Alias-Matching (Teilstring)
  it("findet Weizenmehl als Alias von Mehl", () => {
    const result = lookupLocalIngredient("Weizenmehl");
    expect(result).not.toBeNull();
    expect(result!.calories_per_100g).toBe(340);
  });

  it("findet Karotten als Alias von Möhren", () => {
    const result = lookupLocalIngredient("Möhre");
    expect(result).not.toBeNull();
    expect(result!.calories_per_100g).toBe(41);
  });

  it("findet Champignons über Alias 'Pilze'", () => {
    const result = lookupLocalIngredient("Pilze");
    expect(result).not.toBeNull();
  });

  it("findet Hähnchenbrust über Alias 'Hühnerbrust'", () => {
    const result = lookupLocalIngredient("Hühnerbrust");
    expect(result).not.toBeNull();
    expect(result!.protein_per_100g).toBe(23);
  });

  // Partielle Übereinstimmung
  it("findet 'Knoblauchzehe' über Teilstring von Alias", () => {
    const result = lookupLocalIngredient("Knoblauchzehe");
    expect(result).not.toBeNull();
  });

  it("findet 'Rote Linsen' über Alias", () => {
    const result = lookupLocalIngredient("Rote Linsen");
    expect(result).not.toBeNull();
    expect(result!.protein_per_100g).toBe(25);
  });

  // Nicht gefunden
  it("gibt null für unbekannte Zutaten zurück", () => {
    expect(lookupLocalIngredient("Trüffelöl")).toBeNull();
    expect(lookupLocalIngredient("Sriracha")).toBeNull();
    expect(lookupLocalIngredient("Bärlauch")).toBeNull();
  });

  it("gibt null für leere Eingabe zurück", () => {
    expect(lookupLocalIngredient("")).toBeNull();
    expect(lookupLocalIngredient("   ")).toBeNull();
  });

  // Rückgabe enthält keine aliases
  it("gibt kein aliases-Feld zurück", () => {
    const result = lookupLocalIngredient("Mehl");
    expect(result).not.toBeNull();
    expect(Object.keys(result!)).not.toContain("aliases");
  });

  // Nährwerte vollständig
  it("gibt alle Makros zurück", () => {
    const result = lookupLocalIngredient("Reis");
    expect(result).not.toBeNull();
    expect(result).toMatchObject({
      calories_per_100g: expect.any(Number),
      protein_per_100g: expect.any(Number),
      fat_per_100g: expect.any(Number),
      carbs_per_100g: expect.any(Number),
      fiber_per_100g: expect.any(Number),
    });
  });

  // Salz = 0 kcal
  it("Salz hat 0 Kalorien", () => {
    const result = lookupLocalIngredient("Salz");
    expect(result).not.toBeNull();
    expect(result!.calories_per_100g).toBe(0);
  });
});
