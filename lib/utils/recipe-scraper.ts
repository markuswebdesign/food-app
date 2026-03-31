import * as cheerio from "cheerio";

export interface ScrapedRecipe {
  title?: string;
  description?: string;
  instructions?: string;
  ingredients?: string[];
  image_url?: string;
  source_url: string;
  prep_time_minutes?: number | null;
  cook_time_minutes?: number | null;
  category?: string | null;
}

type UrlSource = "instagram" | "tiktok" | "generic";

function detectSource(url: string): UrlSource {
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("tiktok.com")) return "tiktok";
  return "generic";
}

function parseIsoDuration(iso: string | undefined): number | null {
  if (!iso) return null;
  const hours = parseInt(iso.match(/(\d+)H/)?.[1] ?? "0");
  const minutes = parseInt(iso.match(/(\d+)M/)?.[1] ?? "0");
  const total = hours * 60 + minutes;
  return total > 0 ? total : null;
}

function formatInstructions(raw: unknown): string | undefined {
  if (Array.isArray(raw)) {
    const steps = raw
      .map((s: { text?: string; itemListElement?: unknown[] } | string) => {
        if (typeof s === "string") return s.trim();
        if (s.itemListElement) {
          // HowToSection with sub-steps
          return (s.itemListElement as { text?: string }[])
            .map((sub) => sub.text ?? "")
            .join(" ");
        }
        return s.text?.trim() ?? "";
      })
      .filter(Boolean);
    return steps.map((text, i) => `${i + 1}. ${text}`).join("\n\n");
  }
  if (typeof raw === "string") return raw.trim() || undefined;
  return undefined;
}

async function scrapeGeneric(url: string): Promise<ScrapedRecipe> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; RecipeBot/1.0)" },
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  let recipe: ScrapedRecipe = { source_url: url };

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() ?? "");
      const schemaRecipe =
        data["@type"] === "Recipe"
          ? data
          : Array.isArray(data["@graph"])
          ? data["@graph"].find((g: { "@type": string }) => g["@type"] === "Recipe")
          : null;

      if (schemaRecipe) {
        recipe.title = schemaRecipe.name;
        recipe.description = schemaRecipe.description;
        recipe.image_url = Array.isArray(schemaRecipe.image)
          ? schemaRecipe.image[0]
          : schemaRecipe.image?.url ?? schemaRecipe.image;
        recipe.ingredients = schemaRecipe.recipeIngredient;
        recipe.instructions = formatInstructions(schemaRecipe.recipeInstructions);
        recipe.prep_time_minutes = parseIsoDuration(schemaRecipe.prepTime);
        recipe.cook_time_minutes = parseIsoDuration(schemaRecipe.cookTime);
        recipe.category = Array.isArray(schemaRecipe.recipeCategory)
          ? schemaRecipe.recipeCategory.join(" ")
          : schemaRecipe.recipeCategory ?? null;
      }
    } catch {
      // ignore malformed JSON-LD
    }
  });

  // Fallback: og tags
  if (!recipe.title) {
    recipe.title = $('meta[property="og:title"]').attr("content") ?? $("title").text();
    recipe.description = $('meta[property="og:description"]').attr("content");
    recipe.image_url = $('meta[property="og:image"]').attr("content");
  }

  return recipe;
}

async function scrapeOEmbed(url: string, endpoint: string): Promise<ScrapedRecipe> {
  const oembedUrl = `${endpoint}?url=${encodeURIComponent(url)}`;
  const res = await fetch(oembedUrl);
  const data = await res.json();
  return {
    source_url: url,
    title: data.title,
    description: data.author_name ? `Via ${data.author_name}` : undefined,
    image_url: data.thumbnail_url,
  };
}

export async function scrapeRecipeFromUrl(url: string): Promise<ScrapedRecipe> {
  const source = detectSource(url);

  switch (source) {
    case "instagram":
      return scrapeOEmbed(url, "https://api.instagram.com/oembed");
    case "tiktok":
      return scrapeOEmbed(url, "https://www.tiktok.com/oembed");
    default:
      return scrapeGeneric(url);
  }
}
