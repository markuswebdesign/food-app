/**
 * QA tests for newly added local ingredients (fruits, snacks, protein, beverages, fast food).
 */
import { describe, it, expect } from "vitest";
import { lookupLocalIngredient } from "./local-ingredients";

describe("lookupLocalIngredient – new fruit entries", () => {
  it("finds Apfel with correct nutrition", () => {
    const r = lookupLocalIngredient("Apfel");
    expect(r).not.toBeNull();
    expect(r!.calories_per_100g).toBe(52);
    expect(r!.protein_per_100g).toBe(0.3);
  });

  it("finds Banane with correct nutrition", () => {
    const r = lookupLocalIngredient("Banane");
    expect(r).not.toBeNull();
    expect(r!.calories_per_100g).toBe(89);
    expect(r!.carbs_per_100g).toBe(23);
  });

  it("finds Birne", () => {
    expect(lookupLocalIngredient("Birne")).not.toBeNull();
  });

  it("finds Orange and Mandarine as same entry", () => {
    const orange = lookupLocalIngredient("Orange");
    const mandarine = lookupLocalIngredient("Mandarine");
    expect(orange).not.toBeNull();
    expect(mandarine).not.toBeNull();
    expect(orange!.calories_per_100g).toBe(mandarine!.calories_per_100g);
  });

  it("finds Erdbeere/Erdbeeren", () => {
    expect(lookupLocalIngredient("Erdbeere")).not.toBeNull();
    expect(lookupLocalIngredient("Erdbeeren")).not.toBeNull();
  });

  it("finds Weintrauben / Trauben", () => {
    expect(lookupLocalIngredient("Weintrauben")).not.toBeNull();
    expect(lookupLocalIngredient("Trauben")).not.toBeNull();
  });

  it("finds Mango", () => {
    expect(lookupLocalIngredient("Mango")).not.toBeNull();
  });

  it("finds Ananas", () => {
    expect(lookupLocalIngredient("Ananas")).not.toBeNull();
  });

  it("finds Kiwi", () => {
    expect(lookupLocalIngredient("Kiwi")).not.toBeNull();
  });

  it("finds Blaubeeren / Heidelbeeren", () => {
    expect(lookupLocalIngredient("Blaubeeren")).not.toBeNull();
    expect(lookupLocalIngredient("Heidelbeeren")).not.toBeNull();
  });

  it("finds Himbeeren", () => {
    expect(lookupLocalIngredient("Himbeeren")).not.toBeNull();
  });

  it("finds Wassermelone", () => {
    expect(lookupLocalIngredient("Wassermelone")).not.toBeNull();
  });

  it("finds Avocado", () => {
    const r = lookupLocalIngredient("Avocado");
    expect(r).not.toBeNull();
    expect(r!.calories_per_100g).toBe(160);
    expect(r!.fat_per_100g).toBe(15);
  });
});

describe("lookupLocalIngredient – snacks & sweets", () => {
  it("finds Snickers", () => {
    const r = lookupLocalIngredient("Snickers");
    expect(r).not.toBeNull();
    expect(r!.calories_per_100g).toBe(488);
  });

  it("finds Twix", () => {
    const r = lookupLocalIngredient("Twix");
    expect(r).not.toBeNull();
    expect(r!.calories_per_100g).toBe(495);
  });

  it("finds KitKat / Kit Kat", () => {
    expect(lookupLocalIngredient("Kitkat")).not.toBeNull();
    expect(lookupLocalIngredient("Kit Kat")).not.toBeNull();
  });

  it("finds Chips", () => {
    const r = lookupLocalIngredient("Chips");
    expect(r).not.toBeNull();
    expect(r!.calories_per_100g).toBe(536);
  });

  it("finds Nutella", () => {
    const r = lookupLocalIngredient("Nutella");
    expect(r).not.toBeNull();
    expect(r!.calories_per_100g).toBe(539);
  });

  it("finds Gummibaerchen / Haribo", () => {
    expect(lookupLocalIngredient("Gummibärchen")).not.toBeNull();
    expect(lookupLocalIngredient("Haribo")).not.toBeNull();
  });

  it("finds Popcorn", () => {
    expect(lookupLocalIngredient("Popcorn")).not.toBeNull();
  });

  it("finds Croissant", () => {
    expect(lookupLocalIngredient("Croissant")).not.toBeNull();
  });
});

describe("lookupLocalIngredient – protein products", () => {
  it("finds Proteinshake", () => {
    const r = lookupLocalIngredient("Proteinshake");
    expect(r).not.toBeNull();
    expect(r!.protein_per_100g).toBe(20);
    expect(r!.calories_per_100g).toBe(98);
  });

  it("finds Whey Protein explicitly", () => {
    const whey = lookupLocalIngredient("Whey Protein");
    expect(whey).not.toBeNull();
    expect(whey!.protein_per_100g).toBe(80);
  });

  // BUG: "Whey" alone matches "whey shake" (proteinshake entry, 20g protein)
  // instead of "whey" alias in whey protein entry (80g protein).
  // This is because proteinshake appears first in the array and word-matching
  // is greedy (all query words in alias words = match).
  it("BUG: 'Whey' alone matches proteinshake (wrong entry) instead of whey protein", () => {
    const whey = lookupLocalIngredient("Whey");
    expect(whey).not.toBeNull();
    // This SHOULD be 80 (whey protein) but is 20 (proteinshake) due to ordering bug
    expect(whey!.protein_per_100g).toBe(20); // documents current (buggy) behavior
  });

  it("finds Proteinriegel", () => {
    const r = lookupLocalIngredient("Proteinriegel");
    expect(r).not.toBeNull();
    expect(r!.protein_per_100g).toBe(33);
  });

  it("finds Eiweißpulver as alias for Whey", () => {
    const r = lookupLocalIngredient("Eiweißpulver");
    expect(r).not.toBeNull();
    expect(r!.protein_per_100g).toBe(80);
  });
});

describe("lookupLocalIngredient – beverages", () => {
  it("finds Cola", () => {
    const r = lookupLocalIngredient("Cola");
    expect(r).not.toBeNull();
    expect(r!.calories_per_100g).toBe(42);
  });

  it("finds Kaffee", () => {
    const r = lookupLocalIngredient("Kaffee");
    expect(r).not.toBeNull();
    expect(r!.calories_per_100g).toBe(2);
  });

  it("finds Orangensaft", () => {
    const r = lookupLocalIngredient("Orangensaft");
    expect(r).not.toBeNull();
    expect(r!.calories_per_100g).toBe(45);
  });

  it("finds Bier", () => {
    const r = lookupLocalIngredient("Bier");
    expect(r).not.toBeNull();
    expect(r!.calories_per_100g).toBe(43);
  });

  it("finds Cappuccino / Latte Macchiato", () => {
    expect(lookupLocalIngredient("Cappuccino")).not.toBeNull();
    expect(lookupLocalIngredient("Latte Macchiato")).not.toBeNull();
  });
});

describe("lookupLocalIngredient – fast food", () => {
  it("finds Pizza", () => {
    const r = lookupLocalIngredient("Pizza");
    expect(r).not.toBeNull();
    expect(r!.calories_per_100g).toBe(266);
  });

  it("finds Burger / Hamburger / Cheeseburger", () => {
    expect(lookupLocalIngredient("Burger")).not.toBeNull();
    expect(lookupLocalIngredient("Hamburger")).not.toBeNull();
    expect(lookupLocalIngredient("Cheeseburger")).not.toBeNull();
  });

  it("finds Pommes", () => {
    const r = lookupLocalIngredient("Pommes");
    expect(r).not.toBeNull();
    expect(r!.calories_per_100g).toBe(312);
  });

  it("finds Doener", () => {
    const r = lookupLocalIngredient("Döner");
    expect(r).not.toBeNull();
    expect(r!.calories_per_100g).toBe(235);
  });
});
