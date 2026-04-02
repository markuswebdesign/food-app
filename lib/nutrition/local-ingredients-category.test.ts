/**
 * PROJ-9: Unit tests for lookupCategory()
 */
import { describe, it, expect } from "vitest";
import { lookupCategory, CATEGORY_ORDER } from "./local-ingredients";

describe("lookupCategory", () => {
  // ── Happy path: known categories ──────────────────────────────────────────

  it("categorizes vegetables correctly", () => {
    expect(lookupCategory("Karotte")).toBe("Gemüse & Obst");
    expect(lookupCategory("kartoffeln")).toBe("Gemüse & Obst");
    expect(lookupCategory("Zwiebel")).toBe("Gemüse & Obst");
    expect(lookupCategory("Tomate")).toBe("Gemüse & Obst");
    expect(lookupCategory("Zucchini")).toBe("Gemüse & Obst");
    expect(lookupCategory("Brokkoli")).toBe("Gemüse & Obst");
  });

  it("categorizes fruits correctly", () => {
    expect(lookupCategory("Apfel")).toBe("Gemüse & Obst");
    expect(lookupCategory("Zitrone")).toBe("Gemüse & Obst");
    expect(lookupCategory("Banane")).toBe("Gemüse & Obst");
  });

  it("categorizes meat and fish correctly", () => {
    expect(lookupCategory("Hähnchenbrust")).toBe("Fleisch & Fisch");
    expect(lookupCategory("Hackfleisch")).toBe("Fleisch & Fisch");
    expect(lookupCategory("Lachs")).toBe("Fleisch & Fisch");
    expect(lookupCategory("Speck")).toBe("Fleisch & Fisch");
  });

  it("categorizes dairy and eggs correctly", () => {
    expect(lookupCategory("Milch")).toBe("Milchprodukte & Eier");
    expect(lookupCategory("Butter")).toBe("Milchprodukte & Eier");
    expect(lookupCategory("Eier")).toBe("Milchprodukte & Eier");
    expect(lookupCategory("Joghurt")).toBe("Milchprodukte & Eier");
    expect(lookupCategory("Parmesan")).toBe("Milchprodukte & Eier");
  });

  it("categorizes bread and baking correctly", () => {
    expect(lookupCategory("Mehl")).toBe("Brot & Backwaren");
    expect(lookupCategory("Brot")).toBe("Brot & Backwaren");
    expect(lookupCategory("Haferflocken")).toBe("Brot & Backwaren");
  });

  it("categorizes spices and oils correctly", () => {
    expect(lookupCategory("Salz")).toBe("Gewürze & Öle");
    expect(lookupCategory("Olivenöl")).toBe("Gewürze & Öle");
    expect(lookupCategory("Senf")).toBe("Gewürze & Öle");
    expect(lookupCategory("Pfeffer")).toBe("Gewürze & Öle");
    expect(lookupCategory("Zucker")).toBe("Gewürze & Öle");
  });

  it("categorizes canned goods and dry goods correctly", () => {
    expect(lookupCategory("Nudeln")).toBe("Konserven & Trockenware");
    expect(lookupCategory("Reis")).toBe("Konserven & Trockenware");
    expect(lookupCategory("Linsen")).toBe("Konserven & Trockenware");
    expect(lookupCategory("Dosentomaten")).toBe("Konserven & Trockenware");
    expect(lookupCategory("Kichererbsen")).toBe("Konserven & Trockenware");
  });

  it("categorizes frozen food correctly", () => {
    expect(lookupCategory("Tiefkühlgemüse")).toBe("Tiefkühl");
    expect(lookupCategory("Tiefkühlerbsen")).toBe("Tiefkühl");
  });

  // ── Case insensitivity ────────────────────────────────────────────────────

  it("is case-insensitive", () => {
    expect(lookupCategory("KAROTTE")).toBe("Gemüse & Obst");
    expect(lookupCategory("Hähnchenbrust")).toBe("Fleisch & Fisch");
    expect(lookupCategory("MILCH")).toBe("Milchprodukte & Eier");
  });

  // ── Unknown / fallback ────────────────────────────────────────────────────

  it("returns Sonstiges for unknown ingredients", () => {
    expect(lookupCategory("Quinoa")).toBe("Sonstiges");
    expect(lookupCategory("Trüffelöl")).toBe("Sonstiges");
    expect(lookupCategory("Xyzabc")).toBe("Sonstiges");
  });

  it("returns Sonstiges for empty string", () => {
    expect(lookupCategory("")).toBe("Sonstiges");
  });

  it("returns Sonstiges for whitespace-only input", () => {
    expect(lookupCategory("   ")).toBe("Sonstiges");
  });

  // ── Word-boundary safety ─────────────────────────────────────────────────

  it("does NOT match 'öl' in 'Trüffelöl' (no substring matching)", () => {
    // "öl" is a keyword in Gewürze & Öle — but "Trüffelöl" should NOT match
    expect(lookupCategory("Trüffelöl")).toBe("Sonstiges");
  });

  it("does NOT match 'ei' in 'Weizenmehl' (no substring matching)", () => {
    // "ei" keyword should not match inside compound words
    expect(lookupCategory("Weizenmehl")).toBe("Brot & Backwaren");
  });

  it("does NOT match 'reis' in 'Paprikastreifen'", () => {
    expect(lookupCategory("Paprikastreifen")).toBe("Sonstiges");
  });

  // ── Multi-word queries ────────────────────────────────────────────────────

  it("matches multi-word ingredient names", () => {
    expect(lookupCategory("Rote Linsen")).toBe("Konserven & Trockenware");
    expect(lookupCategory("Gehackte Tomaten")).toBe("Konserven & Trockenware");
    expect(lookupCategory("Griechischer Joghurt")).toBe("Milchprodukte & Eier");
  });

  // ── CATEGORY_ORDER completeness ───────────────────────────────────────────

  it("CATEGORY_ORDER has exactly 9 entries ending with Sonstiges", () => {
    expect(CATEGORY_ORDER).toHaveLength(9);
    expect(CATEGORY_ORDER[CATEGORY_ORDER.length - 1]).toBe("Sonstiges");
  });
});
