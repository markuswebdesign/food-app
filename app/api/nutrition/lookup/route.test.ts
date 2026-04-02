/**
 * QA tests for the /api/nutrition/lookup route handler.
 * Tests edge cases: empty query, short query, case sensitivity, injection.
 */
import { describe, it, expect, vi } from "vitest";
import { lookupLocalIngredient } from "@/lib/nutrition/local-ingredients";

// We test the lookup logic directly since the Next.js route handler
// depends on NextRequest/NextResponse which need a full Next.js environment.
// We verify the logic that the route handler relies on.

describe("API lookup route – core logic", () => {
  // Mirrors the route's q parameter validation
  function simulateRouteLogic(q: string | null | undefined) {
    const trimmed = q?.trim();
    if (!trimmed || trimmed.length < 2) return null;
    const local = lookupLocalIngredient(trimmed);
    if (local) return { ...local, source: "local" as const };
    return null; // Would fall through to OpenFoodFacts in real route
  }

  it("returns null for empty query", () => {
    expect(simulateRouteLogic("")).toBeNull();
    expect(simulateRouteLogic(null)).toBeNull();
    expect(simulateRouteLogic(undefined)).toBeNull();
  });

  it("returns null for single-character query (length < 2)", () => {
    expect(simulateRouteLogic("a")).toBeNull();
    expect(simulateRouteLogic("B")).toBeNull();
  });

  it("returns null for whitespace-only query", () => {
    expect(simulateRouteLogic("   ")).toBeNull();
    expect(simulateRouteLogic("  ")).toBeNull();
  });

  it("handles whitespace-padded query correctly", () => {
    const result = simulateRouteLogic("  Apfel  ");
    expect(result).not.toBeNull();
    expect(result!.calories_per_100g).toBe(52);
  });

  it("is case-insensitive", () => {
    expect(simulateRouteLogic("APFEL")).not.toBeNull();
    expect(simulateRouteLogic("apfel")).not.toBeNull();
    expect(simulateRouteLogic("SNICKERS")).not.toBeNull();
  });

  it("returns local source for known ingredients", () => {
    const result = simulateRouteLogic("Reis");
    expect(result).not.toBeNull();
    expect(result!.source).toBe("local");
  });

  it("returns null for unknown ingredients (would fallthrough to OFF)", () => {
    expect(simulateRouteLogic("Tapioka Perlen")).toBeNull();
  });

  // ── Injection / XSS edge cases ──────────────────────────────────────────

  it("handles script injection input gracefully (no crash)", () => {
    const result = simulateRouteLogic('<script>alert("xss")</script>');
    expect(result).toBeNull(); // just not found, no crash
  });

  it("handles SQL injection input gracefully (no crash)", () => {
    const result = simulateRouteLogic("'; DROP TABLE users; --");
    expect(result).toBeNull();
  });

  it("handles extremely long input gracefully", () => {
    const longStr = "a".repeat(10000);
    const result = simulateRouteLogic(longStr);
    expect(result).toBeNull();
  });

  it("handles unicode / emoji input gracefully", () => {
    expect(simulateRouteLogic("🍎🍕")).toBeNull();
  });

  it("handles null bytes gracefully", () => {
    expect(simulateRouteLogic("Apfel\0")).toBeNull();
  });

  // ── Two-character minimum boundary ──────────────────────────────────────

  it("accepts exactly 2-char query", () => {
    // "Ei" is a known ingredient
    const result = simulateRouteLogic("Ei");
    expect(result).not.toBeNull();
    expect(result!.protein_per_100g).toBe(13);
  });

  it("accepts 2-char query for 'OJ' (orangensaft alias)", () => {
    const result = simulateRouteLogic("OJ");
    // "oj" is an alias for orangensaft
    expect(result).not.toBeNull();
    expect(result!.calories_per_100g).toBe(45);
  });
});
