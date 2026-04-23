import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://ovrxmevrymefgzgmudpw.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_ROLE_KEY) { console.error("❌ SUPABASE_SERVICE_ROLE_KEY fehlt"); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function translateToEnglish(title) {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 30,
    messages: [{
      role: "user",
      content: `Translate this German recipe title to 1-3 English keywords for searching a recipe database: "${title}". Reply with ONLY the English keywords, nothing else.`
    }],
  });
  return response.content[0].text.trim();
}

async function searchTheMealDB(query) {
  const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.meals?.length > 0) {
    return data.meals[0].strMealThumb;
  }
  return null;
}

async function searchTheMealDBByIngredient(ingredient) {
  const url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.meals?.length > 0) {
    const mealId = data.meals[0].idMeal;
    const detailRes = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
    const detailData = await detailRes.json();
    return detailData.meals?.[0]?.strMealThumb ?? null;
  }
  return null;
}

// Map German keywords to TheMealDB categories
const CATEGORY_MAP = [
  { keywords: ["hähnchen", "hühnchen", "hühnerbrust", "putenbrust", "putenschnitzel", "puten"], category: "Chicken" },
  { keywords: ["rindfleisch", "rind", "beef"], category: "Beef" },
  { keywords: ["lachs", "forelle", "seelachs", "fisch", "fish"], category: "Seafood" },
  { keywords: ["haferflocken", "müsli", "granola", "joghurt", "toast", "pfannkuchen", "ei", "eier"], category: "Breakfast" },
  { keywords: ["linsen", "kichererbsen", "quinoa", "hirse", "barley", "veggie", "gemüse"], category: "Vegetarian" },
  { keywords: ["chips", "riegel", "snack", "nuss", "quark"], category: "Miscellaneous" },
  { keywords: ["smoothie", "bowl", "beeren"], category: "Dessert" },
  { keywords: ["suppe", "eintopf"], category: "Beef" },
];

async function searchTheMealDBByCategory(category) {
  const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.meals?.length > 0) {
    // Pick a random meal from the category for variety
    const idx = Math.floor(Math.random() * Math.min(data.meals.length, 10));
    return data.meals[idx].strMealThumb;
  }
  return null;
}

function getCategoryForTitle(title) {
  const lower = title.toLowerCase();
  for (const { keywords, category } of CATEGORY_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }
  return "Vegetarian";
}

async function getImageForRecipe(title) {
  const englishQuery = await translateToEnglish(title);
  console.log(`   "${title}" → "${englishQuery}"`);

  // 1. Full title search
  let imageUrl = await searchTheMealDB(englishQuery);
  if (imageUrl) return { imageUrl, source: "title" };

  // 2. First keyword as ingredient
  const mainIngredient = englishQuery.split(/[\s,]+/)[0];
  imageUrl = await searchTheMealDBByIngredient(mainIngredient);
  if (imageUrl) return { imageUrl, source: "ingredient" };

  // 3. Category fallback
  const category = getCategoryForTitle(title);
  imageUrl = await searchTheMealDBByCategory(category);
  if (imageUrl) return { imageUrl, source: `category:${category}` };

  return { imageUrl: null, source: null };
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY fehlt");
    process.exit(1);
  }

  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("id, title")
    .eq("is_global", true)
    .or("image_url.is.null,image_url.eq.")
    .order("title");

  if (error) {
    console.error("❌ DB-Fehler:", error.message);
    process.exit(1);
  }

  console.log(`🖼  ${recipes.length} Rezepte ohne Titelbild gefunden\n`);

  let updated = 0;
  let notFound = 0;

  for (const recipe of recipes) {
    const { imageUrl, source } = await getImageForRecipe(recipe.title);

    if (imageUrl) {
      const { error: updateError } = await supabase
        .from("recipes")
        .update({ image_url: imageUrl })
        .eq("id", recipe.id);

      if (updateError) {
        console.log(`   ❌ Update-Fehler: ${updateError.message}`);
      } else {
        console.log(`   ✅ [${source}] ${recipe.title}`);
        updated++;
      }
    } else {
      console.log(`   ⚠️  Kein Bild gefunden: ${recipe.title}`);
      notFound++;
    }

    // TheMealDB Rate-Limit respektieren
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`\n✅ Fertig: ${updated} aktualisiert, ${notFound} ohne Bild`);
}

main().catch((err) => {
  console.error("❌ Fehler:", err);
  process.exit(1);
});
