import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import * as cheerio from "cheerio";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

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

  if (res.status === 403 || res.status === 401) {
    throw new Error(
      "Diese Website blockiert automatische Anfragen (HTTP " + res.status + "). " +
      "Bitte kopiere die Zutaten und Zubereitung manuell in ein neues Rezept."
    );
  }
  if (!res.ok) {
    throw new Error(
      "Die Website konnte nicht geladen werden (HTTP " + res.status + "). " +
      "Bitte prüfe die URL und versuche es erneut."
    );
  }

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

// ─── Instagram Helpers ────────────────────────────────────────────────────────

function cleanInstagramUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname.replace(/\/$/, "")}`;
  } catch {
    return url.split("?")[0];
  }
}

function extractInstagramShortcode(url: string): string | null {
  const match = url.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
  return match?.[1] ?? null;
}

async function fetchInstagramGraphQL(shortcode: string): Promise<{ text: string; imageUrl: string | null } | null> {
  const xIgAppId = process.env.INSTAGRAM_APP_ID ?? "936619743392459";
  const docId = process.env.INSTAGRAM_DOC_ID ?? "10015901848480474";

  const graphqlUrl = new URL("https://www.instagram.com/api/graphql");
  graphqlUrl.searchParams.set("variables", JSON.stringify({ shortcode }));
  graphqlUrl.searchParams.set("doc_id", docId);

  const res = await fetch(graphqlUrl.toString(), {
    method: "POST",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "X-IG-App-ID": xIgAppId,
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "*/*",
      "Origin": "https://www.instagram.com",
      "Referer": "https://www.instagram.com/",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) return null;

  const data = await res.json();
  const media = data?.data?.xdt_shortcode_media ?? data?.data?.shortcode_media;
  if (!media) return null;

  const caption = media.edge_media_to_caption?.edges?.[0]?.node?.text ?? media.caption ?? "";
  const imageUrl = media.display_url ?? media.thumbnail_src ?? null;
  const owner = media.owner?.username ?? "unbekannt";

  if (!caption && !imageUrl) return null;

  const text = `Instagram Rezept von @${owner}\n\nBeschreibung: ${caption}`;
  return { text: text.slice(0, 10000), imageUrl };
}

async function fetchInstagramText(url: string): Promise<{ text: string; imageUrl: string | null }> {
  const cleanUrl = cleanInstagramUrl(url);
  const shortcode = extractInstagramShortcode(cleanUrl);

  // 1. Try GraphQL (only needs X-IG-App-ID, no session cookie)
  if (shortcode) {
    try {
      const result = await fetchInstagramGraphQL(shortcode);
      if (result) return result;
    } catch {}
  }

  // 2. HTML scraping fallback
  const res = await fetch(cleanUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "de-DE,de;q=0.9,en;q=0.8",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    signal: AbortSignal.timeout(15000),
  });

  const html = await res.text();
  const $ = cheerio.load(html);

  const imageUrl = $('meta[property="og:image"]').attr("content") ??
    $('meta[name="twitter:image"]').attr("content") ?? null;
  const caption = $('meta[property="og:description"]').attr("content") ??
    $('meta[name="description"]').attr("content") ?? "";
  const title = $('meta[property="og:title"]').attr("content") ?? $("title").text() ?? "";

  const lower = (caption + title).toLowerCase();
  if (caption.length < 20 || lower.includes("log in") || lower.includes("anmelden") || lower.includes("sign in")) {
    throw new Error("INSTAGRAM_BLOCKED");
  }

  const text = `Instagram Rezept\n\nTitel: ${title}\n\nBeschreibung: ${caption}`;
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

// ─── Thumbnail Download to Supabase Storage ──────────────────────────────────

async function downloadImageToStorage(
  imageUrl: string,
  supabase: ReturnType<typeof createClient>
): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (!imageUrl || imageUrl.includes(supabaseUrl)) return imageUrl;

  try {
    const res = await fetch(imageUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return imageUrl;

    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.some((t) => contentType.includes(t))) return imageUrl;

    const buffer = await res.arrayBuffer();
    if (buffer.byteLength > 10 * 1024 * 1024) return imageUrl;

    const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
    const path = `imported/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("recipe-images")
      .upload(path, Buffer.from(buffer), { contentType, upsert: false });

    if (error) return imageUrl;

    const { data: { publicUrl } } = supabase.storage.from("recipe-images").getPublicUrl(path);
    return publicUrl;
  } catch {
    return imageUrl;
  }
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

// ─── Claude Vision Extraction (image) ────────────────────────────────────────

async function extractRecipeFromImage(
  base64Data: string,
  mediaType: string
): Promise<ParsedRecipe> {
  const client = new Anthropic();

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 2048,
    system:
      "Du bist ein Rezept-Extraktions-Assistent. Extrahiere aus dem Bild ein strukturiertes Rezept auf Deutsch. Antworte NUR mit validem JSON, ohne Markdown-Codeblock. Übersetze ins Deutsche falls nötig. Mengenangaben ohne Zahl: amount null setzen. Zubereitungsschritte als nummerierte Liste. Schätze die Nährwerte pro 100g für jede Zutat basierend auf deinem Ernährungswissen.",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp", data: base64Data },
          },
          {
            type: "text",
            text: `Extrahiere das Rezept aus diesem Bild als JSON mit diesen Feldern:
{
  "title": "string",
  "description": "string oder null",
  "instructions": "nummerierte Schritte als string",
  "servings": number,
  "prep_time_minutes": number oder null,
  "cook_time_minutes": number oder null,
  "image_url": null,
  "category": "Frühstück|Mittagessen|Abendessen|Dessert|Snack oder null",
  "ingredients": [
    {
      "name": "string",
      "amount": number oder null,
      "unit": "string oder null",
      "calories_per_100g": number,
      "protein_per_100g": number,
      "fat_per_100g": number,
      "carbs_per_100g": number,
      "fiber_per_100g": number oder null
    }
  ]
}

Falls das Bild kein Rezept zeigt, gib trotzdem JSON zurück mit title "Unbekanntes Rezept" und leerer ingredients-Liste.`,
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Kein JSON in der Antwort gefunden");
  return JSON.parse(match[0]) as ParsedRecipe;
}

// ─── Shared: enrich ingredients with OpenFoodFacts ────────────────────────────

async function enrichIngredients(recipe: ParsedRecipe) {
  return Promise.all(
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
}

// ─── API Route ────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  // ── Image upload mode ──────────────────────────────────────────────────────
  if (contentType.includes("multipart/form-data")) {
    try {
      const formData = await request.formData();
      const file = formData.get("image") as File | null;
      if (!file) {
        return NextResponse.json({ error: "Kein Bild hochgeladen" }, { status: 400 });
      }

      const maxBytes = 5 * 1024 * 1024; // 5 MB
      if (file.size > maxBytes) {
        return NextResponse.json({ error: "Bild zu groß (max. 5 MB)" }, { status: 400 });
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      const mediaType = allowedTypes.includes(file.type) ? file.type : "image/jpeg";

      const arrayBuffer = await file.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString("base64");

      const recipe = await extractRecipeFromImage(base64Data, mediaType);
      const ingredientsWithNutrition = await enrichIngredients(recipe);

      return NextResponse.json({ ...recipe, source_url: null, ingredients: ingredientsWithNutrition });
    } catch (error) {
      console.error("Image import error:", error);
      return NextResponse.json(
        { error: "Import fehlgeschlagen: " + (error instanceof Error ? error.message : "Unbekannter Fehler") },
        { status: 500 }
      );
    }
  }

  // ── URL mode ───────────────────────────────────────────────────────────────
  const { url, manualText } = await request.json();

  if (!url && !manualText) {
    return NextResponse.json({ error: "URL fehlt" }, { status: 400 });
  }

  try {
    // Manual caption mode (Instagram fallback: user pasted the caption)
    if (manualText) {
      const recipe = await extractRecipeWithClaude(manualText, url ?? "");
      const ingredientsWithNutrition = await enrichIngredients(recipe);
      return NextResponse.json({ ...recipe, source_url: url ?? null, ingredients: ingredientsWithNutrition });
    }

    let fetched: { text: string; imageUrl: string | null };

    if (url.includes("tiktok.com")) {
      fetched = await fetchTikTokText(url);
    } else if (url.includes("instagram.com")) {
      fetched = await fetchInstagramText(url);
    } else {
      fetched = await fetchPageText(url);
    }

    if (fetched.text.length < 100) {
      return NextResponse.json(
        { error: "Seite konnte nicht geladen werden. Bitte prüfe die URL und versuche es erneut." },
        { status: 422 }
      );
    }

    const recipe = await extractRecipeWithClaude(fetched.text, url);
    if (!recipe.image_url && fetched.imageUrl) {
      recipe.image_url = fetched.imageUrl;
    }

    // Download thumbnail to Supabase Storage for social media imports
    if (recipe.image_url && (url.includes("tiktok.com") || url.includes("instagram.com"))) {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          recipe.image_url = await downloadImageToStorage(recipe.image_url, supabase);
        }
      } catch {}
    }

    const ingredientsWithNutrition = await enrichIngredients(recipe);

    return NextResponse.json({ ...recipe, source_url: url, ingredients: ingredientsWithNutrition });
  } catch (error) {
    if (error instanceof Error && error.message === "INSTAGRAM_BLOCKED") {
      return NextResponse.json(
        {
          error: "Instagram-Post konnte nicht automatisch geladen werden. Kopiere die Beschreibung aus dem Post und füge sie unten ein.",
          instagram_fallback: true,
        },
        { status: 422 }
      );
    }
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Import fehlgeschlagen: " + (error instanceof Error ? error.message : "Unbekannter Fehler") },
      { status: 500 }
    );
  }
}
