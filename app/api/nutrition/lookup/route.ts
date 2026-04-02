import { NextRequest, NextResponse } from "next/server";
import { lookupLocalIngredient } from "@/lib/nutrition/local-ingredients";

type NutritionResult = {
  calories_per_100g: number;
  protein_per_100g: number;
  fat_per_100g: number;
  carbs_per_100g: number;
  fiber_per_100g: number;
  source: "local" | "openfoodfacts";
};

async function lookupOpenFoodFacts(query: string): Promise<NutritionResult | null> {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=1&page_size=5&fields=product_name,nutriments&lc=de`;
    const res = await fetch(url, {
      headers: { "User-Agent": "food-app/1.0 (nutrition lookup)" },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const products = data?.products ?? [];

    for (const product of products) {
      const n = product?.nutriments;
      if (!n) continue;

      const calories = n["energy-kcal_100g"] ?? n["energy-kcal"] ?? null;
      const protein = n["proteins_100g"] ?? n["proteins"] ?? null;
      const fat = n["fat_100g"] ?? n["fat"] ?? null;
      const carbs = n["carbohydrates_100g"] ?? n["carbohydrates"] ?? null;
      const fiber = n["fiber_100g"] ?? n["fiber"] ?? 0;

      if (calories == null || protein == null || fat == null || carbs == null) continue;

      return {
        calories_per_100g: Math.round(calories),
        protein_per_100g: Math.round(protein * 10) / 10,
        fat_per_100g: Math.round(fat * 10) / 10,
        carbs_per_100g: Math.round(carbs * 10) / 10,
        fiber_per_100g: Math.round(fiber * 10) / 10,
        source: "openfoodfacts",
      };
    }

    return null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json(null);

  // Schicht 1: Lokale Tabelle
  const local = lookupLocalIngredient(q);
  if (local) {
    return NextResponse.json({ ...local, source: "local" });
  }

  // Schicht 2: OpenFoodFacts API
  const off = await lookupOpenFoodFacts(q);
  if (off) {
    return NextResponse.json(off);
  }

  // Schicht 3: Kein Treffer
  return NextResponse.json(null);
}
