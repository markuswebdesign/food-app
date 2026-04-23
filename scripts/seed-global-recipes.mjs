import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://ovrxmevrymefgzgmudpw.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_ROLE_KEY) { console.error("❌ SUPABASE_SERVICE_ROLE_KEY fehlt"); process.exit(1); }
const ADMIN_USER_ID = "ad2ce8af-0a6f-4b8e-9659-a981461ce01e";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CATEGORIES = [
  { slug: "breakfast", label: "Frühstück", emoji: "🍳", context: "gesundes Frühstück, energiereich, schnell zuzubereiten" },
  { slug: "snack",     label: "Snack",     emoji: "🍎", context: "gesunder Snack, wenig Kalorien, sättigend" },
  { slug: "lunch",     label: "Mittagessen", emoji: "🥗", context: "ausgewogenes Mittagessen, sättigend, nahrhaft" },
  { slug: "dinner",    label: "Abendessen",  emoji: "🍽", context: "leichtes Abendessen, proteinreich, leicht verdaulich" },
];

function calculateNutrition(ingredients, servings) {
  let calories = 0, protein = 0, fat = 0, carbs = 0, fiber = 0;
  for (const ing of ingredients) {
    if (ing.amount && ing.calories_per_100g != null) {
      const factor = ing.amount / 100;
      calories += (ing.calories_per_100g || 0) * factor;
      protein  += (ing.protein_per_100g  || 0) * factor;
      fat      += (ing.fat_per_100g      || 0) * factor;
      carbs    += (ing.carbs_per_100g    || 0) * factor;
      fiber    += (ing.fiber_per_100g    || 0) * factor;
    }
  }
  const s = servings || 1;
  return {
    calories:        Math.round((calories / s) * 10) / 10,
    protein_g:       Math.round((protein  / s) * 10) / 10,
    fat_g:           Math.round((fat      / s) * 10) / 10,
    carbohydrates_g: Math.round((carbs    / s) * 10) / 10,
    fiber_g:         Math.round((fiber    / s) * 10) / 10,
  };
}

async function generateRecipesBatch(category, batchIndex) {
  const prompt = `Du bist ein Ernährungsexperte und Kochbuchautor. Erstelle genau 5 einfache, gesunde deutsche Rezepte für die Kategorie "${category.label}" (${category.context}). Dies ist Batch ${batchIndex + 1} von 2 — erstelle 5 andere Rezepte als in Batch ${batchIndex}.

Anforderungen:
- Auf Deutsch (Titel, Beschreibung, Zutaten, Anleitung)
- Einfach zuzubereiten (maximal 8 Zutaten, maximal 40 Minuten gesamt)
- Gesund und ausgewogen (keine Fertigprodukte, echte Lebensmittel)
- Realistische Nährwerte pro 100g basierend auf USDA/DGE-Daten
- Portionsangabe: 2 Portionen (außer bei Snacks: 1 Portion)
- Anleitung: maximal 5 kurze Schritte

Antworte NUR mit einem validen JSON-Array ohne Markdown-Codeblöcke:

[
  {
    "title": "Rezeptname",
    "description": "Kurze appetitliche Beschreibung (1-2 Sätze)",
    "servings": 2,
    "prep_time_minutes": 10,
    "cook_time_minutes": 15,
    "instructions": "1. Schritt eins.\\n2. Schritt zwei.\\n3. Schritt drei.",
    "ingredients": [
      {
        "name": "Zutat",
        "amount": 200,
        "unit": "g",
        "calories_per_100g": 89,
        "protein_per_100g": 1.1,
        "fat_per_100g": 0.3,
        "carbs_per_100g": 23,
        "fiber_per_100g": 2.6
      }
    ]
  }
]`;

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 6000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].text.trim();
  const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  return JSON.parse(cleaned);
}

async function generateRecipes(category) {
  const batch1 = await generateRecipesBatch(category, 0);
  const batch2 = await generateRecipesBatch(category, 1);
  return [...batch1, ...batch2];
}

async function importCategory(category, categoryId) {
  console.log(`\n${category.emoji} Generiere ${category.label}-Rezepte...`);
  const recipes = await generateRecipes(category);
  console.log(`   ${recipes.length} Rezepte generiert, importiere...`);

  let imported = 0;
  for (const recipe of recipes) {
    // Duplikat-Schutz
    const { data: existing } = await supabase
      .from("recipes")
      .select("id")
      .eq("title", recipe.title)
      .eq("is_global", true)
      .maybeSingle();

    if (existing) {
      console.log(`   ⏭  Übersprungen (existiert bereits): ${recipe.title}`);
      continue;
    }

    // 1. Rezept einfügen
    const { data: insertedRecipe, error: recipeError } = await supabase
      .from("recipes")
      .insert({
        user_id: ADMIN_USER_ID,
        title: recipe.title,
        description: recipe.description || null,
        instructions: recipe.instructions,
        servings: recipe.servings || 2,
        prep_time_minutes: recipe.prep_time_minutes || null,
        cook_time_minutes: recipe.cook_time_minutes || null,
        is_public: true,
        is_global: true,
      })
      .select("id")
      .single();

    if (recipeError) {
      console.error(`   ❌ Fehler bei Rezept "${recipe.title}": ${recipeError.message}`);
      continue;
    }

    const recipeId = insertedRecipe.id;

    // 2. Zutaten einfügen
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      const ingredientsToInsert = recipe.ingredients.map((ing) => ({
        recipe_id: recipeId,
        name: ing.name,
        amount: ing.amount ?? null,
        unit: ing.unit ?? null,
        calories_per_100g: ing.calories_per_100g ?? null,
        protein_per_100g: ing.protein_per_100g ?? null,
        fat_per_100g: ing.fat_per_100g ?? null,
        carbs_per_100g: ing.carbs_per_100g ?? null,
        fiber_per_100g: ing.fiber_per_100g ?? null,
      }));

      const { error: ingError } = await supabase.from("ingredients").insert(ingredientsToInsert);
      if (ingError) {
        console.error(`   ⚠️  Zutaten-Fehler bei "${recipe.title}": ${ingError.message}`);
      }
    }

    // 3. Nährwerte berechnen und einfügen
    const nutrition = calculateNutrition(recipe.ingredients || [], recipe.servings || 2);
    const { error: nutError } = await supabase.from("recipe_nutrition").insert({
      recipe_id: recipeId,
      ...nutrition,
      nutrition_source: "calculated",
      calculated_at: new Date().toISOString(),
    });
    if (nutError) {
      console.error(`   ⚠️  Nährwert-Fehler bei "${recipe.title}": ${nutError.message}`);
    }

    // 4. Kategorie zuweisen
    const { error: catError } = await supabase.from("recipe_categories").insert({
      recipe_id: recipeId,
      category_id: categoryId,
    });
    if (catError) {
      console.error(`   ⚠️  Kategorie-Fehler bei "${recipe.title}": ${catError.message}`);
    }

    console.log(`   ✅ ${recipe.title}`);
    imported++;
  }

  console.log(`${category.emoji} ${category.label}: ${imported}/${recipes.length} Rezepte importiert`);
  return imported;
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY Umgebungsvariable fehlt.");
    process.exit(1);
  }

  console.log("🌱 Starte Rezept-Seed...\n");

  // Kategorie-IDs aus Supabase laden
  const { data: cats, error: catLookupError } = await supabase
    .from("categories")
    .select("id, slug")
    .in("slug", ["breakfast", "snack", "lunch", "dinner"]);

  if (catLookupError || !cats) {
    console.error("❌ Kategorien konnten nicht geladen werden:", catLookupError?.message);
    process.exit(1);
  }

  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c.id]));
  console.log("Kategorien geladen:", Object.keys(catMap).join(", "));

  let total = 0;
  for (const category of CATEGORIES) {
    const categoryId = catMap[category.slug];
    if (!categoryId) {
      console.warn(`⚠️  Kategorie-ID für "${category.slug}" nicht gefunden, überspringe.`);
      continue;
    }
    const count = await importCategory(category, categoryId);
    total += count;
  }

  console.log(`\n✅ Fertig! ${total} globale Rezepte importiert.`);
}

main().catch((err) => {
  console.error("❌ Unerwarteter Fehler:", err);
  process.exit(1);
});
