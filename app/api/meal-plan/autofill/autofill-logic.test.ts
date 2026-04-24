import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mirrors the logic inside `app/api/meal-plan/autofill/route.ts`.
// The file keeps these helpers internal, so we re-implement here exactly
// to regression-test the algorithm.

type MealTime = "breakfast" | "lunch" | "dinner" | "snack";

const SLUG_TO_MEAL: Record<string, MealTime> = {
  breakfast: "breakfast",
  lunch: "lunch",
  dinner: "dinner",
  snack: "snack",
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Favorite {
  id: string;
  slugs: string[];
}

function groupByMeal(favorites: Favorite[]): Record<MealTime, Favorite[]> {
  const byMeal: Record<MealTime, Favorite[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };
  for (const fav of favorites) {
    let assigned = false;
    for (const slug of fav.slugs) {
      if (SLUG_TO_MEAL[slug]) {
        byMeal[SLUG_TO_MEAL[slug]].push(fav);
        assigned = true;
        break;
      }
    }
    if (!assigned) {
      const target = Math.random() < 0.5 ? "lunch" : "dinner";
      byMeal[target].push(fav);
    }
  }
  return byMeal;
}

describe("shuffle (Fisher-Yates) – PROJ-26 Autofill", () => {
  beforeEach(() => vi.spyOn(Math, "random").mockImplementation(() => 0));
  afterEach(() => vi.restoreAllMocks());

  it("enthält dieselben Elemente wie das Original", () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle(arr);
    expect(result.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it("mutiert das Original-Array NICHT", () => {
    const arr = [1, 2, 3, 4, 5];
    const snapshot = [...arr];
    shuffle(arr);
    expect(arr).toEqual(snapshot);
  });

  it("liefert dasselbe Array zurück bei leerer Eingabe", () => {
    expect(shuffle([])).toEqual([]);
  });

  it("liefert dasselbe Array bei Länge 1", () => {
    expect(shuffle([42])).toEqual([42]);
  });
});

describe("Kategorie-Verteilung – PROJ-26 Autofill", () => {
  beforeEach(() => vi.spyOn(Math, "random").mockImplementation(() => 0.3)); // < 0.5 → lunch
  afterEach(() => vi.restoreAllMocks());

  it("Favoriten mit 'breakfast'-Slug landen in breakfast", () => {
    const favs: Favorite[] = [{ id: "a", slugs: ["breakfast"] }];
    const grouped = groupByMeal(favs);
    expect(grouped.breakfast).toHaveLength(1);
    expect(grouped.lunch).toHaveLength(0);
  });

  it("Favoriten ohne passenden Slug werden als lunch/dinner eingereiht", () => {
    const favs: Favorite[] = [{ id: "a", slugs: [] }];
    const grouped = groupByMeal(favs);
    // Mit Math.random = 0.3 < 0.5 → lunch
    expect(grouped.lunch).toHaveLength(1);
    expect(grouped.dinner).toHaveLength(0);
  });

  it("Ernährungsform-Slugs (vegan/vegetarian) werden nicht als Meal erkannt → Fallback", () => {
    const favs: Favorite[] = [{ id: "a", slugs: ["vegan"] }];
    const grouped = groupByMeal(favs);
    expect(grouped.breakfast).toHaveLength(0);
    expect(grouped.snack).toHaveLength(0);
    expect(grouped.lunch.length + grouped.dinner.length).toBe(1);
  });

  it("erster passender Meal-Slug gewinnt, weitere werden ignoriert", () => {
    const favs: Favorite[] = [{ id: "a", slugs: ["dinner", "breakfast"] }];
    const grouped = groupByMeal(favs);
    expect(grouped.dinner).toHaveLength(1);
    expect(grouped.breakfast).toHaveLength(0);
  });

  it("vegan + breakfast → landet korrekt in breakfast (vegan ignoriert)", () => {
    const favs: Favorite[] = [{ id: "a", slugs: ["vegan", "breakfast"] }];
    const grouped = groupByMeal(favs);
    expect(grouped.breakfast).toHaveLength(1);
  });

  it("kombiniert 10 Favoriten korrekt auf alle 4 Mahlzeiten (mixed)", () => {
    const favs: Favorite[] = [
      { id: "a", slugs: ["breakfast"] },
      { id: "b", slugs: ["breakfast"] },
      { id: "c", slugs: ["lunch"] },
      { id: "d", slugs: ["lunch"] },
      { id: "e", slugs: ["dinner"] },
      { id: "f", slugs: ["dinner"] },
      { id: "g", slugs: ["snack"] },
      { id: "h", slugs: ["snack"] },
      { id: "i", slugs: [] },
      { id: "j", slugs: [] },
    ];
    const grouped = groupByMeal(favs);
    expect(grouped.breakfast).toHaveLength(2);
    // 2 echte lunch + 2 echte dinner + 2 uncategorised → 6
    expect(grouped.lunch.length + grouped.dinner.length).toBe(6);
    expect(grouped.snack).toHaveLength(2);
  });
});

describe("Pool-Zyklus (cycling) – PROJ-26 Autofill", () => {
  // Mirror of `nextRecipe`-Logik
  function makePool<T>(items: T[]) {
    return {
      items,
      idx: 0,
      next(): T | null {
        if (this.items.length === 0) return null;
        const item = this.items[this.idx % this.items.length];
        this.idx++;
        return item;
      },
    };
  }

  it("liefert null wenn Pool leer", () => {
    const pool = makePool<number>([]);
    expect(pool.next()).toBeNull();
  });

  it("cycelt durch Items wenn mehr Slots als Items", () => {
    const pool = makePool([1, 2]);
    // 7 Tage á Mahlzeit
    const picks = Array.from({ length: 7 }, () => pool.next());
    expect(picks).toEqual([1, 2, 1, 2, 1, 2, 1]);
  });

  it("bei Pool-Größe ≥ 7: kein Rezept mehrfach für 7 Tage", () => {
    const pool = makePool([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const picks = Array.from({ length: 7 }, () => pool.next());
    expect(new Set(picks).size).toBe(7);
  });
});
