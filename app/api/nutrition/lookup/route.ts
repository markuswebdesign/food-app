import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json(null);

  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&json=1&page_size=1&fields=nutriments`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return NextResponse.json(null);

    const data = await res.json();
    const n = data.products?.[0]?.nutriments;
    if (!n) return NextResponse.json(null);

    return NextResponse.json({
      calories_per_100g: n["energy-kcal_100g"] ?? null,
      protein_per_100g: n["proteins_100g"] ?? null,
      fat_per_100g: n["fat_100g"] ?? null,
      carbs_per_100g: n["carbohydrates_100g"] ?? null,
      fiber_per_100g: n["fiber_100g"] ?? null,
    });
  } catch {
    return NextResponse.json(null);
  }
}
