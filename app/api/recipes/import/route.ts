import { NextRequest, NextResponse } from "next/server";
import { scrapeRecipeFromUrl } from "@/lib/utils/recipe-scraper";

export async function POST(request: NextRequest) {
  const { url } = await request.json();

  if (!url) {
    return NextResponse.json({ error: "URL fehlt" }, { status: 400 });
  }

  try {
    const recipe = await scrapeRecipeFromUrl(url);
    return NextResponse.json(recipe);
  } catch {
    return NextResponse.json({ error: "Import fehlgeschlagen" }, { status: 500 });
  }
}
