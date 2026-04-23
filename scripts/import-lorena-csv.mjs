import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://ovrxmevrymefgzgmudpw.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_ROLE_KEY) { console.error("❌ SUPABASE_SERVICE_ROLE_KEY fehlt"); process.exit(1); }
const USER_ID = "ad2ce8af-0a6f-4b8e-9659-a981461ce01e"; // m.westenhuber@gmail.com

const CATEGORY_IDS = {
  vegan: "c5ab7612-cccf-4998-a47e-8e016ef2417f",
  dinner: "2d77840f-bc28-4b83-8013-5afa64327236",
};

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Simple CSV parser that handles quoted fields with commas/newlines
function parseCSV(text) {
  const rows = [];
  let i = 0;
  while (i < text.length) {
    const row = [];
    while (i < text.length && text[i] !== "\n") {
      if (text[i] === '"') {
        // Quoted field
        i++; // skip opening quote
        let field = "";
        while (i < text.length) {
          if (text[i] === '"' && text[i + 1] === '"') {
            field += '"';
            i += 2;
          } else if (text[i] === '"') {
            i++; // skip closing quote
            break;
          } else {
            field += text[i++];
          }
        }
        row.push(field);
      } else {
        // Unquoted field
        let field = "";
        while (i < text.length && text[i] !== "," && text[i] !== "\n") {
          field += text[i++];
        }
        row.push(field);
      }
      if (text[i] === ",") i++; // skip comma separator
    }
    if (text[i] === "\n") i++; // skip newline
    if (row.length > 0 && !(row.length === 1 && row[0] === "")) {
      rows.push(row);
    }
  }
  return rows;
}

const csv = readFileSync(
  "/Users/markuswestenhuber/Desktop/lorenapalombo_rezepte_komplett.csv",
  "utf-8"
);
const rows = parseCSV(csv);
const header = rows[0];
console.log("Columns:", header);

// Group rows by recipe_title
const recipeMap = new Map();
for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  const obj = {};
  header.forEach((col, j) => (obj[col] = row[j] ?? ""));

  const title = obj.recipe_title;
  if (!title) continue;

  if (!recipeMap.has(title)) {
    recipeMap.set(title, {
      title,
      description: obj.description || null,
      servings: parseInt(obj.servings) || 2,
      prep_time_minutes: parseInt(obj.prep_time_minutes) || null,
      cook_time_minutes: parseInt(obj.cook_time_minutes) || null,
      category: obj.category || null,
      instructions: obj.instructions || null,
      source_url: obj.source_url || null,
      image_url: obj.image_url || null,
      ingredients: [],
    });
  }

  if (obj.ingredient_name) {
    recipeMap.get(title).ingredients.push({
      name: obj.ingredient_name.trim(),
      amount: obj.amount || null,
      unit: obj.unit || null,
    });
  }
}

const recipes = Array.from(recipeMap.values());
console.log(`\nGefundene Rezepte: ${recipes.length}`);
recipes.forEach((r) => console.log(` - ${r.title} (${r.ingredients.length} Zutaten)`));

// Format instructions: replace " | " with newline
function formatInstructions(raw) {
  if (!raw) return "Keine Zubereitung angegeben.";
  return raw.split(" | ").join("\n");
}

// Bereits importierte source_urls laden
const { data: existing } = await supabase
  .from("recipes")
  .select("source_url")
  .not("source_url", "is", null);
const existingUrls = new Set((existing ?? []).map((r) => r.source_url));

// Import each recipe
let successCount = 0;
let errorCount = 0;
let skippedCount = 0;

for (const recipe of recipes) {
  if (existingUrls.has(recipe.source_url)) {
    console.log(`Übersprungen (bereits vorhanden): ${recipe.title}`);
    skippedCount++;
    continue;
  }
  console.log(`\nImportiere: ${recipe.title}`);

  const instructions = formatInstructions(recipe.instructions);

  const { data: inserted, error: recipeError } = await supabase
    .from("recipes")
    .insert({
      user_id: USER_ID,
      title: recipe.title,
      description: recipe.description,
      instructions,
      servings: recipe.servings,
      prep_time_minutes: recipe.prep_time_minutes,
      cook_time_minutes: recipe.cook_time_minutes,
      image_url: recipe.image_url || null,
      source_url: recipe.source_url || null,
      is_public: true,
    })
    .select("id")
    .single();

  if (recipeError) {
    console.error(`  Fehler: ${recipeError.message}`);
    errorCount++;
    continue;
  }

  const recipeId = inserted.id;
  console.log(`  Rezept gespeichert: ${recipeId}`);

  // Categories: all are vegan + dinner
  await supabase.from("recipe_categories").insert([
    { recipe_id: recipeId, category_id: CATEGORY_IDS.vegan },
    { recipe_id: recipeId, category_id: CATEGORY_IDS.dinner },
  ]);

  // Ingredients
  const validIngredients = recipe.ingredients.filter((i) => i.name);
  if (validIngredients.length > 0) {
    const { error: ingError } = await supabase.from("ingredients").insert(
      validIngredients.map((ing) => {
        // Parse amount: handle fractions like "1/2" and ranges like "2-3"
        let amount = null;
        if (ing.amount) {
          if (ing.amount.includes("/")) {
            const [num, den] = ing.amount.split("/");
            amount = parseFloat(num) / parseFloat(den);
          } else if (ing.amount.includes("-")) {
            // Take the average of a range
            const [lo, hi] = ing.amount.split("-");
            amount = (parseFloat(lo) + parseFloat(hi)) / 2;
          } else {
            amount = parseFloat(ing.amount) || null;
          }
        }
        return {
          recipe_id: recipeId,
          name: ing.name,
          amount,
          unit: ing.unit || null,
        };
      })
    );
    if (ingError) {
      console.error(`  Zutaten-Fehler: ${ingError.message}`);
    } else {
      console.log(`  ${validIngredients.length} Zutaten gespeichert`);
    }
  }

  successCount++;
}

console.log(`\n--- Import abgeschlossen ---`);
console.log(`Erfolgreich: ${successCount} | Übersprungen: ${skippedCount} | Fehler: ${errorCount}`);
