import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import * as cheerio from "cheerio";

// ─── Schema ───────────────────────────────────────────────────────────────────

interface ParsedIngredient {
  name: string;
  amount: number | null;
  unit: string | null;
}

interface ParsedRecipe {
  title: string;
  description: string | null;
  instructions: string;
  servings: number;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  image_url: string | null;
  ingredients: ParsedIngredient[];
  category: string | null;
}


// ─── Content Fetching ─────────────────────────────────────────────────────────

async function fetchPageText(url: string): Promise<{ text: string; imageUrl: string | null }> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "de-DE,de;q=0.9,en;q=0.8",
    },
    signal: AbortSignal.timeout(15000),
  });

  const html = await res.text();
  const $ = cheerio.load(html);

  // Extract og:image before stripping
  const imageUrl =
    $('meta[property="og:image"]').attr("content") ??
    $('meta[name="twitter:image"]').attr("content") ??
    null;

  // Try to extract JSON-LD first (best quality)
  let jsonLdText = "";
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() ?? "");
      const recipe =
        data["@type"] === "Recipe"
          ? data
          : Array.isArray(data["@graph"])
          ? data["@graph"].find((g: { "@type": string }) => g["@type"] === "Recipe")
          : null;
      if (recipe) {
        jsonLdText = JSON.stringify(recipe, null, 2);
      }
    } catch {}
  });

  if (jsonLdText) {
    return { text: jsonLdText.slice(0, 20000), imageUrl };
  }

  // Fallback: clean HTML text
  $("script, style, nav, header, footer, aside, .ads, .ad, .cookie, .banner").remove();
  const text = $.text().replace(/\s+/g, " ").trim().slice(0, 20000);
  return { text, imageUrl };
}

async function fetchTikTokText(url: string): Promise<{ text: string; imageUrl: string | null }> {
  // oEmbed gives us at least thumbnail + title
  const oembedRes = await fetch(
    `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`
  );
  const oembed = oembedRes.ok ? await oembedRes.json() : {};

  // Try to scrape description from TikTok page
  let description = oembed.title ?? "";
  let imageUrl = oembed.thumbnail_url ?? null;

  try {
    const pageRes = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(10000),
    });
    const html = await pageRes.text();
    const $ = cheerio.load(html);

    // TikTok embeds video description in meta tags and script tags
    const ogDesc = $('meta[property="og:description"]').attr("content") ?? "";
    const metaDesc = $('meta[name="description"]').attr("content") ?? "";
    description = ogDesc || metaDesc || description;

    if (!imageUrl) {
      imageUrl = $('meta[property="og:image"]').attr("content") ?? null;
    }
  } catch {}

  const text = `TikTok Video von ${oembed.author_name ?? "unbekannt"}\n\nBeschreibung: ${description}`;
  return { text: text.slice(0, 10000), imageUrl };
}

async function fetchInstagramText(url: string): Promise<{ text: string; imageUrl: string | null }> {
  // Instagram's unauthenticated oEmbed API was deprecated in 2020.
  // Scrape the page directly — og:description contains the post caption (recipe text),
  // og:image contains the food photo.
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "de-DE,de;q=0.9,en;q=0.8",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    signal: AbortSignal.timeout(15000),
  });

  const html = await res.text();
  const $ = cheerio.load(html);

  const imageUrl =
    $('meta[property="og:image"]').attr("content") ??
    $('meta[name="twitter:image"]').attr("content") ??
    null;

  // og:description on Instagram contains the full post caption
  const caption =
    $('meta[property="og:description"]').attr("content") ??
    $('meta[name="description"]').attr("content") ??
    "";

  const title =
    $('meta[property="og:title"]').attr("content") ??
    $("title").text() ??
    "";

  // If meta tags have content, use them (most reliable on Instagram)
  if (caption.length > 20) {
    const text = `Instagram Rezept\n\nTitel: ${title}\n\nBeschreibung: ${caption}`;
    return { text: text.slice(0, 10000), imageUrl };
  }

  // Fallback: cleaned page text (less likely to work due to Instagram's JS-rendering)
  $("script, style, nav, header, footer, aside").remove();
  const text = $.text().replace(/\s+/g, " ").trim();
  return { text: text.slice(0, 10000), imageUrl };
}

// ─── Nutrition Lookup ─────────────────────────────────────────────────────────

interface NutritionData {
  calories_per_100g: number | null;
  protein_per_100g: number | null;
  fat_per_100g: number | null;
  carbs_per_100g: number | null;
  fiber_per_100g: number | null;
}

async function lookupNutrition(name: string): Promise<NutritionData> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(name)}&json=1&page_size=1&fields=nutriments`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return nullNutrition();
    const data = await res.json();
    const n = data.products?.[0]?.nutriments;
    if (!n) return nullNutrition();
    return {
      calories_per_100g: n["energy-kcal_100g"] ?? null,
      protein_per_100g: n["proteins_100g"] ?? null,
      fat_per_100g: n["fat_100g"] ?? null,
      carbs_per_100g: n["carbohydrates_100g"] ?? null,
      fiber_per_100g: n["fiber_100g"] ?? null,
    };
  } catch {
    return nullNutrition();
  }
}

function nullNutrition(): NutritionData {
  return {
    calories_per_100g: null,
    protein_per_100g: null,
    fat_per_100g: null,
    carbs_per_100g: null,
    fiber_per_100g: null,
  };
}

// ─── Claude Haiku Extraction ──────────────────────────────────────────────────

async function extractRecipeWithClaude(
  rawText: string,
  sourceUrl: string
): Promise<ParsedRecipe> {
  const client = new Anthropic();

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 2048,
    system:
      "Du bist ein Rezept-Extraktions-Assistent. Extrahiere aus dem gegebenen Text ein strukturiertes Rezept auf Deutsch. Antworte NUR mit validem JSON, ohne Markdown-Codeblock. Übersetze ins Deutsche falls nötig. Mengenangaben ohne Zahl: amount null setzen. Zubereitungsschritte als nummerierte Liste. Schätze die Nährwerte pro 100g für jede Zutat basierend auf deinem Ernährungswissen.",
    messages: [
      {
        role: "user",
        content: `Extrahiere das Rezept aus diesem Inhalt (Quelle: ${sourceUrl}) als JSON mit diesen Feldern:
{
  "title": "string",
  "description": "string oder null",
  "instructions": "nummerierte Schritte als string",
  "servings": number,
  "prep_time_minutes": number oder null,
  "cook_time_minutes": number oder null,
  "image_url": "string oder null",
  "category": "Frühstück|Mittagessen|Abendessen|Dessert|Snack oder null",
  "ingredients": [
    {
      "name": "string",
      "amount": number oder null,
      "unit": "string oder null",
      "calories_per_100g": number (geschätzter Kaloriengehalt pro 100g),
      "protein_per_100g": number (geschätzter Proteingehalt pro 100g),
      "fat_per_100g": number (geschätzter Fettgehalt pro 100g),
      "carbs_per_100g": number (geschätzter Kohlenhydratgehalt pro 100g),
      "fiber_per_100g": number oder null (geschätzter Ballaststoffgehalt pro 100g)
    }
  ]
}

Inhalt:
${rawText}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  // Extract the first complete JSON object, ignoring any trailing text
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Kein JSON in der Antwort gefunden");
  return JSON.parse(match[0]) as ParsedRecipe;
}

// ─── API Route ────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const { url } = await request.json();

  if (!url) {
    return NextResponse.json({ error: "URL fehlt" }, { status: 400 });
  }

  try {
    // 1. Fetch page content
    let fetched: { text: string; imageUrl: string | null };

    if (url.includes("tiktok.com")) {
      fetched = await fetchTikTokText(url);
    } else if (url.includes("instagram.com")) {
      fetched = await fetchInstagramText(url);
    } else {
      fetched = await fetchPageText(url);
    }

    // Detect login walls / empty content before calling Claude
    const textLower = fetched.text.toLowerCase();
    if (
      fetched.text.length < 100 ||
      (url.includes("instagram.com") && (textLower.includes("log in") || textLower.includes("anmelden") || textLower.includes("sign in")))
    ) {
      return NextResponse.json(
        { error: "Instagram-Seite konnte nicht geladen werden. Bitte stelle sicher, dass der Post öffentlich ist, oder kopiere die Rezeptbeschreibung manuell." },
        { status: 422 }
      );
    }

    // 2. Extract recipe with Claude Haiku
    const recipe = await extractRecipeWithClaude(fetched.text, url);

    // Use scraped image if Claude didn't find one
    if (!recipe.image_url && fetched.imageUrl) {
      recipe.image_url = fetched.imageUrl;
    }

    // 3. Auto-lookup nutrition for all ingredients in parallel
    // Prefer OpenFoodFacts values where available; fall back to Claude's estimates
    const ingredientsWithNutrition = await Promise.all(
      recipe.ingredients.map(async (ing) => {
        const nutrition = await lookupNutrition(ing.name);
        const ingAny = ing as any;
        return {
          ...ing,
          calories_per_100g: nutrition.calories_per_100g ?? ingAny.calories_per_100g ?? null,
          protein_per_100g:  nutrition.protein_per_100g  ?? ingAny.protein_per_100g  ?? null,
          fat_per_100g:      nutrition.fat_per_100g      ?? ingAny.fat_per_100g      ?? null,
          carbs_per_100g:    nutrition.carbs_per_100g    ?? ingAny.carbs_per_100g    ?? null,
          fiber_per_100g:    nutrition.fiber_per_100g    ?? ingAny.fiber_per_100g    ?? null,
        };
      })
    );

    return NextResponse.json({
      ...recipe,
      source_url: url,
      ingredients: ingredientsWithNutrition,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Import fehlgeschlagen: " + (error instanceof Error ? error.message : "Unbekannter Fehler") },
      { status: 500 }
    );
  }
}
