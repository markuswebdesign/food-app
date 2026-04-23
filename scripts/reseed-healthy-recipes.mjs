/**
 * reseed-healthy-recipes.mjs
 *
 * Strategie:
 * 1. TheMealDB-Rezepte holen (Bild stammt direkt aus der DB → passt immer)
 * 2. Proteinreiche, ballaststoffreiche, herzgesunde Kategorien bevorzugen
 * 3. Claude: Nährwerte pro Zutat + alles auf Deutsch übersetzen
 * 4. Alte 40 globalen Rezepte löschen, neue einsetzen
 */

import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://ovrxmevrymefgzgmudpw.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_ROLE_KEY) { console.error("❌ SUPABASE_SERVICE_ROLE_KEY fehlt"); process.exit(1); }
const ADMIN_USER_ID = "ad2ce8af-0a6f-4b8e-9659-a981461ce01e";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// TheMealDB-Kategorien → App-Mahlzeit-Kategorie + Anzahl Rezepte
// Herzgesund: Fisch (Omega-3), Hühnchen (mageres Protein), Hülsenfrüchte (Ballaststoffe)
const FETCH_PLAN = [
  { mealdbCategory: "Seafood",     appSlug: "dinner",    count: 10 },
  { mealdbCategory: "Chicken",     appSlug: "lunch",     count: 10 },
  { mealdbCategory: "Vegetarian",  appSlug: "dinner",    count:  8 },
  { mealdbCategory: "Breakfast",   appSlug: "breakfast", count:  7 },
  { mealdbCategory: "Side",        appSlug: "snack",     count:  5 },
];
// Total: 40 Rezepte

// ──────────────────────────────────────────────────────────────
// TheMealDB
// ──────────────────────────────────────────────────────────────

async function fetchMealsByCategory(category) {
  const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.meals || [];
}

async function fetchMealDetail(id) {
  const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.meals?.[0] || null;
}

function extractIngredients(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`]?.trim();
    const measure = meal[`strMeasure${i}`]?.trim();
    if (!name) break;
    ingredients.push({ name, measure: measure || "" });
  }
  return ingredients;
}

// ──────────────────────────────────────────────────────────────
// Claude: Nährwerte + Übersetzung in einem Schritt
// ──────────────────────────────────────────────────────────────

async function enrichAndTranslate(meal, ingredients) {
  const ingredientList = ingredients
    .map((i) => `- ${i.measure} ${i.name}`)
    .join("\n");

  const prompt = `Du bist ein Ernährungsexperte und Übersetzer. Verarbeite folgendes englisches Rezept:

TITEL (EN): ${meal.strMeal}
ANLEITUNG (EN):
${meal.strInstructions?.substring(0, 2000)}

ZUTATEN (EN):
${ingredientList}

Deine Aufgaben:
1. Übersetze Titel, Anleitung und Zutaten ins Deutsche
2. Kürze die Anleitung auf max. 6 Schritte (nummeriert, klar formuliert)
3. Gib für jede Zutat realistische Nährwerte pro 100g an (USDA/DGE-Daten)
4. Schätze Menge in Gramm pro Portion (Rezept für 2 Portionen, außer Frühstück/Snack = 1)
5. Schreibe eine kurze appetitliche Beschreibung auf Deutsch (1-2 Sätze)

Fokus: Das Rezept soll proteinreich, ballaststoffreich und herzgesund sein (erhöhtes Cholesterin).
Wenn das Originalrezept viel Butter/Sahne enthält, reduziere diese in der deutschen Version auf ein Minimum oder ersetze durch Olivenöl/pflanzliche Alternativen.

Antworte NUR mit einem validen JSON-Objekt (kein Markdown, keine Codeblöcke):

{
  "title_de": "Deutscher Titel",
  "description_de": "Kurze Beschreibung",
  "instructions_de": "1. Schritt\\n2. Schritt\\n3. Schritt",
  "servings": 2,
  "prep_time_minutes": 15,
  "cook_time_minutes": 20,
  "ingredients": [
    {
      "name_de": "Zutat auf Deutsch",
      "amount": 200,
      "unit": "g",
      "calories_per_100g": 165,
      "protein_per_100g": 31,
      "fat_per_100g": 3.6,
      "carbs_per_100g": 0,
      "fiber_per_100g": 0
    }
  ]
}`;

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].text.trim();
  const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  return JSON.parse(cleaned);
}

// ──────────────────────────────────────────────────────────────
// Nährwert-Berechnung aus Zutaten
// ──────────────────────────────────────────────────────────────

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

// ──────────────────────────────────────────────────────────────
// Alte globale Rezepte löschen (ohne Lorena-Rezepte)
// ──────────────────────────────────────────────────────────────

async function deleteOldGlobalRecipes() {
  console.log("🗑  Lösche alte globale Rezepte (ohne Lorena-Rezepte)...");

  // Nur Rezepte ohne source_url löschen (Lorena-Rezepte haben source_url)
  const { data: toDelete, error: fetchErr } = await supabase
    .from("recipes")
    .select("id, title")
    .eq("is_global", true)
    .is("source_url", null);

  if (fetchErr) {
    console.error("❌ Fehler beim Laden der alten Rezepte:", fetchErr.message);
    process.exit(1);
  }

  console.log(`   ${toDelete.length} Rezepte zum Löschen gefunden`);

  for (const recipe of toDelete) {
    // Kaskade: ingredients, recipe_nutrition, recipe_categories werden via FK CASCADE gelöscht
    const { error } = await supabase
      .from("recipes")
      .delete()
      .eq("id", recipe.id);

    if (error) {
      console.error(`   ❌ Fehler beim Löschen von "${recipe.title}": ${error.message}`);
    } else {
      console.log(`   🗑  Gelöscht: ${recipe.title}`);
    }
  }
  console.log(`✅ ${toDelete.length} alte Rezepte gelöscht\n`);
}

// ──────────────────────────────────────────────────────────────
// Einzelnes Rezept in Supabase einsetzen
// ──────────────────────────────────────────────────────────────

async function insertRecipe(enriched, imageUrl, categoryId) {
  // 1. Rezept
  const { data: inserted, error: recipeErr } = await supabase
    .from("recipes")
    .insert({
      user_id:            ADMIN_USER_ID,
      title:              enriched.title_de,
      description:        enriched.description_de || null,
      instructions:       enriched.instructions_de,
      servings:           enriched.servings || 2,
      prep_time_minutes:  enriched.prep_time_minutes || null,
      cook_time_minutes:  enriched.cook_time_minutes || null,
      image_url:          imageUrl,
      is_public:          true,
      is_global:          true,
    })
    .select("id")
    .single();

  if (recipeErr) throw new Error(`Rezept-Insert: ${recipeErr.message}`);
  const recipeId = inserted.id;

  // 2. Zutaten
  if (enriched.ingredients?.length > 0) {
    const rows = enriched.ingredients.map((ing) => ({
      recipe_id:          recipeId,
      name:               ing.name_de,
      amount:             ing.amount ?? null,
      unit:               ing.unit ?? null,
      calories_per_100g:  ing.calories_per_100g ?? null,
      protein_per_100g:   ing.protein_per_100g  ?? null,
      fat_per_100g:       ing.fat_per_100g       ?? null,
      carbs_per_100g:     ing.carbs_per_100g     ?? null,
      fiber_per_100g:     ing.fiber_per_100g     ?? null,
    }));
    const { error: ingErr } = await supabase.from("ingredients").insert(rows);
    if (ingErr) console.warn(`   ⚠️  Zutaten-Fehler: ${ingErr.message}`);
  }

  // 3. Nährwerte berechnen
  const nutrition = calculateNutrition(enriched.ingredients || [], enriched.servings || 2);
  const { error: nutErr } = await supabase.from("recipe_nutrition").insert({
    recipe_id:         recipeId,
    ...nutrition,
    nutrition_source:  "calculated",
    calculated_at:     new Date().toISOString(),
  });
  if (nutErr) console.warn(`   ⚠️  Nährwert-Fehler: ${nutErr.message}`);

  // 4. Kategorie
  const { error: catErr } = await supabase.from("recipe_categories").insert({
    recipe_id:   recipeId,
    category_id: categoryId,
  });
  if (catErr) console.warn(`   ⚠️  Kategorie-Fehler: ${catErr.message}`);

  return recipeId;
}

// ──────────────────────────────────────────────────────────────
// Hauptprozess
// ──────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY fehlt.");
    process.exit(1);
  }

  console.log("🥗 RezeptFit Healthy Recipe Reseed\n");
  console.log("Strategie: TheMealDB → passende Bilder → Claude übersetzt + Nährwerte\n");

  // Kategorien aus Supabase laden
  const { data: cats, error: catErr } = await supabase
    .from("categories")
    .select("id, slug")
    .in("slug", ["breakfast", "snack", "lunch", "dinner"]);

  if (catErr || !cats) {
    console.error("❌ Kategorien laden fehlgeschlagen:", catErr?.message);
    process.exit(1);
  }

  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c.id]));
  console.log("App-Kategorien geladen:", Object.keys(catMap).join(", "));

  // Schritt 1: Alte Rezepte löschen
  await deleteOldGlobalRecipes();

  // Schritt 2: TheMealDB-Rezepte sammeln
  console.log("📥 Lade Rezepte von TheMealDB...\n");
  const selectedMeals = []; // { meal (detail), appSlug }

  for (const plan of FETCH_PLAN) {
    console.log(`   Kategorie "${plan.mealdbCategory}" → ${plan.count} Rezepte für "${plan.appSlug}"`);
    const list = await fetchMealsByCategory(plan.mealdbCategory);

    // Shuffle für Abwechslung
    const shuffled = list.sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, plan.count);

    for (const item of picked) {
      await new Promise((r) => setTimeout(r, 200)); // Rate-Limit
      const detail = await fetchMealDetail(item.idMeal);
      if (detail) {
        selectedMeals.push({ meal: detail, appSlug: plan.appSlug });
        process.stdout.write(`   ✓ ${detail.strMeal}\n`);
      }
    }
  }

  console.log(`\n✅ ${selectedMeals.length} Rezepte von TheMealDB geladen\n`);

  // Schritt 3: Übersetzen, Nährwerte berechnen, einsetzen
  console.log("🤖 Übersetze + berechne Nährwerte (Claude)...\n");

  let imported = 0;
  let failed = 0;

  for (let i = 0; i < selectedMeals.length; i++) {
    const { meal, appSlug } = selectedMeals[i];
    const imageUrl = meal.strMealThumb; // Bild kommt direkt aus TheMealDB → passt immer

    process.stdout.write(`[${i + 1}/${selectedMeals.length}] ${meal.strMeal}... `);

    try {
      const ingredients = extractIngredients(meal);
      const enriched = await enrichAndTranslate(meal, ingredients);

      const categoryId = catMap[appSlug];
      if (!categoryId) throw new Error(`Keine Kategorie-ID für "${appSlug}"`);

      await insertRecipe(enriched, imageUrl, categoryId);
      console.log(`✅ → "${enriched.title_de}"`);
      imported++;
    } catch (err) {
      console.log(`❌ Fehler: ${err.message}`);
      failed++;
    }

    // Kurze Pause zwischen Anfragen
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n🎉 Fertig!`);
  console.log(`   ✅ ${imported} Rezepte erfolgreich importiert`);
  if (failed > 0) console.log(`   ❌ ${failed} fehlgeschlagen`);
  console.log(`\nAlle Bilder stammen direkt von TheMealDB und passen zu den Rezepten.`);
}

main().catch((err) => {
  console.error("❌ Unerwarteter Fehler:", err);
  process.exit(1);
});
