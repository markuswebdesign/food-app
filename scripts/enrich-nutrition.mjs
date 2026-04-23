import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://ovrxmevrymefgzgmudpw.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_ROLE_KEY) { console.error("❌ SUPABASE_SERVICE_ROLE_KEY fehlt"); process.exit(1); }
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Inline local nutrition table (subset of lib/nutrition/local-ingredients.ts)
const LOCAL = [
  { a: ["mehl","weizenmehl","dinkelmehl","vollkornmehl"], cal:325,pro:12,fat:2,carb:63,fib:9 },
  { a: ["reis","weißer reis","langkornreis","basmati","jasminreis"], cal:360,pro:7,fat:1,carb:78,fib:1 },
  { a: ["haferflocken","hafer"], cal:366,pro:13,fat:7,carb:59,fib:10 },
  { a: ["quinoa"], cal:368,pro:14,fat:6,carb:64,fib:7 },
  { a: ["linsen","rote linsen","beluga linsen","linsen (trocken)"], cal:352,pro:25,fat:1,carb:60,fib:11 },
  { a: ["kichererbsen","kichererbsen (dose)","kichererbsen (glas)"], cal:164,pro:9,fat:3,carb:27,fib:8 },
  { a: ["bohnen","schwarze bohnen","grüne bohnen","bohnen (dose)"], cal:127,pro:9,fat:1,carb:23,fib:7 },
  { a: ["kartoffeln","kartoffel"], cal:77,pro:2,fat:0,carb:17,fib:2 },
  { a: ["süßkartoffel","süßkartoffeln"], cal:86,pro:2,fat:0,carb:20,fib:3 },
  { a: ["karotten","karotte","möhren"], cal:41,pro:1,fat:0,carb:10,fib:3 },
  { a: ["brokkoli"], cal:34,pro:3,fat:0,carb:7,fib:3 },
  { a: ["blumenkohl"], cal:25,pro:2,fat:0,carb:5,fib:2 },
  { a: ["spinat","spinatblätter","frischer spinat"], cal:23,pro:3,fat:0,carb:4,fib:2 },
  { a: ["tomate","tomaten","cherrytomaten","cocktailtomaten"], cal:18,pro:1,fat:0,carb:4,fib:1 },
  { a: ["paprika","rote paprika","grüne paprika"], cal:31,pro:1,fat:0,carb:6,fib:2 },
  { a: ["zwiebel","zwiebeln","rote zwiebel","schalotten"], cal:40,pro:1,fat:0,carb:9,fib:2 },
  { a: ["knoblauch","knoblauchzehen"], cal:149,pro:6,fat:1,carb:33,fib:2 },
  { a: ["ingwer"], cal:80,pro:2,fat:1,carb:18,fib:2 },
  { a: ["avocado"], cal:160,pro:2,fat:15,carb:9,fib:7 },
  { a: ["champignons","pilze"], cal:22,pro:3,fat:0,carb:3,fib:1 },
  { a: ["pfifferlinge"], cal:25,pro:2,fat:1,carb:4,fib:4 },
  { a: ["ananas"], cal:50,pro:1,fat:0,carb:13,fib:1 },
  { a: ["banane"], cal:89,pro:1,fat:0,carb:23,fib:3 },
  { a: ["apfel"], cal:52,pro:0,fat:0,carb:14,fib:2 },
  { a: ["kokosmilch"], cal:230,pro:2,fat:24,carb:6,fib:0 },
  { a: ["olivenöl"], cal:884,pro:0,fat:100,carb:0,fib:0 },
  { a: ["kokosöl","kokosfett"], cal:862,pro:0,fat:100,carb:0,fib:0 },
  { a: ["rapsöl"], cal:884,pro:0,fat:100,carb:0,fib:0 },
  { a: ["sesamöl"], cal:884,pro:0,fat:100,carb:0,fib:0 },
  { a: ["cashews","cashewnüsse"], cal:553,pro:18,fat:44,carb:30,fib:3 },
  { a: ["mandeln","braune mandeln"], cal:579,pro:21,fat:50,carb:22,fib:13 },
  { a: ["erdnüsse","erdnussmus"], cal:567,pro:26,fat:49,carb:16,fib:9 },
  { a: ["walnüsse"], cal:654,pro:15,fat:65,carb:14,fib:7 },
  { a: ["sesam","schwarzer sesam"], cal:573,pro:18,fat:50,carb:23,fib:12 },
  { a: ["tahini"], cal:595,pro:17,fat:54,carb:21,fib:9 },
  { a: ["tempeh","natur tempeh","marinierter tempeh"], cal:193,pro:19,fat:11,carb:9,fib:0 },
  { a: ["tofu","räuchertofu","fester tofu"], cal:144,pro:17,fat:9,carb:2,fib:0 },
  { a: ["seitan"], cal:143,pro:25,fat:2,carb:9,fib:2 },
  { a: ["sojasauce"], cal:53,pro:8,fat:0,carb:5,fib:1 },
  { a: ["maronen","kastanien"], cal:245,pro:3,fat:3,carb:53,fib:7 },
  { a: ["rote bete","rote beete","rote bete (roh)"], cal:43,pro:2,fat:0,carb:10,fib:3 },
  { a: ["lauch","porree"], cal:31,pro:2,fat:0,carb:7,fib:2 },
  { a: ["sellerie"], cal:16,pro:1,fat:0,carb:3,fib:2 },
  { a: ["zucchini"], cal:17,pro:1,fat:0,carb:3,fib:1 },
  { a: ["rosenkohl"], cal:43,pro:3,fat:0,carb:9,fib:4 },
  { a: ["grünkohl","grünkohlblätter"], cal:49,pro:4,fat:1,carb:10,fib:4 },
  { a: ["pflanzensahne","hafersahne"], cal:150,pro:1,fat:14,carb:6,fib:0 },
  { a: ["hafermilch","pflanzenmilch"], cal:47,pro:1,fat:1,carb:9,fib:1 },
  { a: ["margarine","vegane margarine"], cal:720,pro:0,fat:80,carb:1,fib:0 },
  { a: ["brauner zucker","zucker"], cal:380,pro:0,fat:0,carb:98,fib:0 },
  { a: ["agavendicksaft","agavensirup"], cal:310,pro:0,fat:0,carb:76,fib:0 },
  { a: ["tomatenmark"], cal:82,pro:4,fat:0,carb:18,fib:4 },
  { a: ["hefeflocken"], cal:325,pro:45,fat:5,carb:32,fib:20 },
  { a: ["kichererbsenmehl"], cal:387,pro:22,fat:6,carb:58,fib:11 },
];

function lookupLocal(name) {
  const q = name.toLowerCase().trim();
  for (const entry of LOCAL) {
    if (entry.a.some(a => q.includes(a) || a.includes(q))) {
      return { calories_per_100g: entry.cal, protein_per_100g: entry.pro, fat_per_100g: entry.fat, carbs_per_100g: entry.carb, fiber_per_100g: entry.fib };
    }
  }
  return null;
}

async function lookupOFF(name) {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(name)}&json=1&page_size=5&fields=nutriments&lc=de`;
    const res = await fetch(url, { headers: { "User-Agent": "food-app/1.0" }, signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const data = await res.json();
    for (const p of data?.products ?? []) {
      const n = p?.nutriments;
      if (!n) continue;
      const cal = n["energy-kcal_100g"] ?? n["energy-kcal"] ?? null;
      const pro = n["proteins_100g"] ?? null;
      const fat = n["fat_100g"] ?? null;
      const carb = n["carbohydrates_100g"] ?? null;
      if (cal == null || pro == null || fat == null || carb == null) continue;
      // Plausibilitäts-Check: Öle haben max ~900 kcal/100g
      if (cal > 900 || pro > 100 || fat > 100 || carb > 100) continue;
      if (pro + fat + carb > 110) continue; // Makros dürfen nicht > 110g/100g sein
      return { calories_per_100g: Math.round(cal), protein_per_100g: Math.round(pro*10)/10, fat_per_100g: Math.round(fat*10)/10, carbs_per_100g: Math.round(carb*10)/10, fiber_per_100g: Math.round((n["fiber_100g"]??0)*10)/10 };
    }
  } catch {}
  return null;
}

// Alle Rezepte ohne recipe_nutrition holen
const { data: recipes } = await supabase
  .from("recipes")
  .select("id, title, servings")
  .eq("user_id", "ad2ce8af-0a6f-4b8e-9659-a981461ce01e")
  .not("source_url", "is", null);

const { data: existingNutrition } = await supabase.from("recipe_nutrition").select("recipe_id");
const withNutrition = new Set((existingNutrition ?? []).map(r => r.recipe_id));

const toProcess = (recipes ?? []).filter(r => !withNutrition.has(r.id));
console.log(`${toProcess.length} Rezepte ohne Nährwerte gefunden\n`);

for (const recipe of toProcess) {
  console.log(`Verarbeite: ${recipe.title}`);
  const { data: ingredients } = await supabase
    .from("ingredients")
    .select("id, name, amount, unit")
    .eq("recipe_id", recipe.id);

  if (!ingredients?.length) { console.log("  keine Zutaten\n"); continue; }

  let enrichedCount = 0;
  let totalCal = 0, totalPro = 0, totalFat = 0, totalCarb = 0, totalFib = 0;
  let hasAny = false;

  for (const ing of ingredients) {
    // Zutaten ohne sinnvolle Mengenangabe (Gewürze, "nach Geschmack") überspringen
    if (!ing.amount || ing.amount <= 0) continue;

    let nutrition = lookupLocal(ing.name);
    if (!nutrition) {
      nutrition = await lookupOFF(ing.name);
      if (nutrition) process.stdout.write(`  OFF: ${ing.name}\n`);
    }
    if (!nutrition) continue;

    // Nährwerte in Ingredient speichern
    await supabase.from("ingredients").update({
      calories_per_100g: nutrition.calories_per_100g,
      protein_per_100g: nutrition.protein_per_100g,
      fat_per_100g: nutrition.fat_per_100g,
      carbs_per_100g: nutrition.carbs_per_100g,
      fiber_per_100g: nutrition.fiber_per_100g,
    }).eq("id", ing.id);

    // Für Gesamtberechnung: amount in Gramm/ml schätzen
    let grams = ing.amount;
    const unit = (ing.unit ?? "").toLowerCase();
    if (unit === "el") grams = ing.amount * 15;
    else if (unit === "tl") grams = ing.amount * 5;
    else if (unit === "tasse") grams = ing.amount * 200;
    else if (unit === "dose") grams = ing.amount * 400;
    else if (unit === "glas") grams = ing.amount * 400;
    else if (unit === "becher") grams = ing.amount * 200;
    else if (unit === "handvoll") grams = ing.amount * 30;
    else if (unit === "prise" || unit === "prisen") grams = ing.amount * 1;
    else if (unit === "l") grams = ing.amount * 1000;
    else if (unit === "kg") grams = ing.amount * 1000;
    // g, ml, cm, Stück etc. → Wert direkt nutzen wenn sinnvoll
    else if (["stück","stk","klein","groß","mittelgroß",""].includes(unit)) {
      // Typische Gramm-Gewichte pro Stück
      const STUECK_G = {
        "zwiebel": 100, "zwiebeln": 100, "rote zwiebel": 100, "schalotten": 20,
        "knoblauchzehen": 5, "knoblauchzehe": 5,
        "karotten": 80, "karotte": 80,
        "kartoffeln": 150, "kartoffel": 150,
        "süßkartoffel": 200, "süßkartoffeln": 200,
        "tomate": 100, "tomaten": 100,
        "paprika": 150, "rote paprika": 150, "grüne paprika": 150,
        "zucchini": 200,
        "blumenkohl": 600,
        "brokkoli": 300,
        "lauch": 150,
        "avocado": 150,
        "apfel": 150,
        "banane": 120,
        "ei": 55,
        "limette": 60, "zitrone": 80,
        "grüner salat": 200,
        "rote bete": 150, "rote beete": 150,
        "pflaumen": 40,
        "datteln": 8,
        "walnüsse": 5,
        "grünkohlblätter": 20,
        "hokkaido oder butternut-kürbis": 800,
        "hokkaido-kürbis": 800,
        "papaya": 400,
        "chili": 15, "chili rot und grün": 15,
        "pak choi": 200,
        "champignons": 20,
      };
      const nameKey = ing.name.toLowerCase().trim();
      const stueckG = STUECK_G[nameKey];
      if (!stueckG) { enrichedCount++; hasAny = true; continue; }
      grams = ing.amount * stueckG;
    }

    // Plausibilitäts-Check: max 1500g pro Einzelzutat
    if (grams > 1500) continue;

    const factor = grams / 100;
    totalCal  += nutrition.calories_per_100g * factor;
    totalPro  += nutrition.protein_per_100g  * factor;
    totalFat  += nutrition.fat_per_100g      * factor;
    totalCarb += nutrition.carbs_per_100g    * factor;
    totalFib  += nutrition.fiber_per_100g    * factor;
    enrichedCount++;
    hasAny = true;
  }

  console.log(`  ${enrichedCount}/${ingredients.length} Zutaten mit Nährwerten`);

  if (hasAny && totalCal > 0) {
    const s = Math.max(1, recipe.servings ?? 1);
    await supabase.from("recipe_nutrition").upsert({
      recipe_id: recipe.id,
      calories: Math.round(totalCal / s),
      protein_g: Math.round(totalPro / s * 10) / 10,
      fat_g: Math.round(totalFat / s * 10) / 10,
      carbohydrates_g: Math.round(totalCarb / s * 10) / 10,
      fiber_g: Math.round(totalFib / s * 10) / 10,
      calculated_at: new Date().toISOString(),
    });
    console.log(`  → ${Math.round(totalCal/s)} kcal | ${(totalPro/s).toFixed(1)}g Protein | ${(totalFat/s).toFixed(1)}g Fett | ${(totalCarb/s).toFixed(1)}g KH pro Portion\n`);
  } else {
    console.log(`  → Keine Gesamtberechnung möglich\n`);
  }
}

console.log("Fertig.");
