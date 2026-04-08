import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { lookupLocalIngredient } from "@/lib/nutrition/local-ingredients";

export const maxDuration = 60;

// ─── Types ────────────────────────────────────────────────────────────────────

interface CsvRow {
  recipe_title?: string;
  description?: string;
  servings?: string;
  prep_time_minutes?: string;
  cook_time_minutes?: string;
  category?: string;
  instructions?: string;
  source_url?: string;
  image_url?: string;
  ingredient_name?: string;
  amount?: string;
  unit?: string;
}

interface Ingredient {
  name: string;
  amount: number | null;
  unit: string | null;
  calories_per_100g: number | null;
  protein_per_100g: number | null;
  fat_per_100g: number | null;
  carbs_per_100g: number | null;
  fiber_per_100g: number | null;
}

interface RecipeGroup {
  title: string;
  description: string | null;
  servings: number;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  category: string | null;
  instructions: string;
  source_url: string | null;
  image_url: string | null;
  ingredients: Ingredient[];
}

// ─── CSV Parser ───────────────────────────────────────────────────────────────

function parseCsv(text: string): CsvRow[] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());

  return lines
    .slice(1)
    .filter((l) => l.trim())
    .map((line) => {
      const values = parseCsvLine(line);
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = (values[i] ?? "").trim(); });
      return row as CsvRow;
    })
    .filter((row) => !!row.recipe_title);
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// ─── Group CSV rows into recipes ──────────────────────────────────────────────

function groupRows(rows: CsvRow[]): RecipeGroup[] {
  const map = new Map<string, RecipeGroup>();

  for (const row of rows) {
    const title = (row.recipe_title ?? "").trim();
    if (!map.has(title)) {
      map.set(title, {
        title,
        description: row.description || null,
        servings: parseInt(row.servings ?? "") || 2,
        prep_time_minutes: parseInt(row.prep_time_minutes ?? "") || null,
        cook_time_minutes: parseInt(row.cook_time_minutes ?? "") || null,
        category: row.category || null,
        instructions: row.instructions || "Keine Zubereitung angegeben.",
        source_url: row.source_url || null,
        image_url: row.image_url || null,
        ingredients: [],
      });
    }

    const ingredientName = row.ingredient_name?.trim();
    if (ingredientName) {
      map.get(title)!.ingredients.push({
        name: ingredientName,
        amount: parseFloat(row.amount ?? "") || null,
        unit: row.unit || null,
        calories_per_100g: null,
        protein_per_100g: null,
        fat_per_100g: null,
        carbs_per_100g: null,
        fiber_per_100g: null,
      });
    }
  }

  return Array.from(map.values());
}

// ─── Nutrition lookup (local DB → OpenFoodFacts DE) ──────────────────────────

async function lookupNutrition(name: string) {
  // Layer 1: local ingredient database
  const local = lookupLocalIngredient(name);
  if (local) return local;

  // Layer 2: OpenFoodFacts with German locale
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(name)}&json=1&page_size=5&fields=product_name,nutriments&lc=de`;
    const res = await fetch(url, {
      headers: { "User-Agent": "food-app/1.0 (nutrition lookup)" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;

    const data = await res.json();
    for (const product of data?.products ?? []) {
      const n = product?.nutriments;
      if (!n) continue;
      const calories = n["energy-kcal_100g"] ?? n["energy-kcal"] ?? null;
      const protein  = n["proteins_100g"]    ?? n["proteins"]     ?? null;
      const fat      = n["fat_100g"]          ?? n["fat"]          ?? null;
      const carbs    = n["carbohydrates_100g"] ?? n["carbohydrates"] ?? null;
      const fiber    = n["fiber_100g"]         ?? n["fiber"]        ?? 0;
      if (calories == null || protein == null || fat == null || carbs == null) continue;
      return {
        calories_per_100g: Math.round(calories),
        protein_per_100g:  Math.round(protein * 10) / 10,
        fat_per_100g:      Math.round(fat * 10) / 10,
        carbs_per_100g:    Math.round(carbs * 10) / 10,
        fiber_per_100g:    Math.round(fiber * 10) / 10,
      };
    }
  } catch {
    // ignore timeout / network errors
  }
  return null;
}

// ─── Save one recipe to DB ────────────────────────────────────────────────────

async function saveRecipe(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  recipe: RecipeGroup
): Promise<{ title: string; ok: boolean; error?: string }> {
  try {
    const enriched = await Promise.all(
      recipe.ingredients.map(async (ing) => {
        const nutrition = await lookupNutrition(ing.name);
        return { ...ing, ...nutrition };
      })
    );

    const { data: saved, error: recipeErr } = await supabase
      .from("recipes")
      .insert({
        user_id: userId,
        title: recipe.title,
        description: recipe.description,
        instructions: recipe.instructions,
        servings: recipe.servings,
        prep_time_minutes: recipe.prep_time_minutes,
        cook_time_minutes: recipe.cook_time_minutes,
        image_url: recipe.image_url,
        source_url: recipe.source_url,
        is_public: true,
      })
      .select("id")
      .single();

    if (recipeErr || !saved) return { title: recipe.title, ok: false, error: recipeErr?.message };

    if (enriched.length > 0) {
      await supabase.from("ingredients").insert(
        enriched.map((i) => ({
          recipe_id: saved.id,
          name: i.name,
          amount: i.amount,
          unit: i.unit,
          calories_per_100g: i.calories_per_100g ?? null,
          protein_per_100g: i.protein_per_100g ?? null,
          fat_per_100g: i.fat_per_100g ?? null,
          carbs_per_100g: i.carbs_per_100g ?? null,
        }))
      );

      const hasNutrition = enriched.some((i) => i.calories_per_100g != null);
      if (hasNutrition) {
        let calories = 0, protein = 0, fat = 0, carbs = 0, fiber = 0;
        for (const i of enriched) {
          const factor = (i.amount ?? 0) / 100;
          calories += (i.calories_per_100g ?? 0) * factor;
          protein  += (i.protein_per_100g  ?? 0) * factor;
          fat      += (i.fat_per_100g      ?? 0) * factor;
          carbs    += (i.carbs_per_100g    ?? 0) * factor;
          fiber    += (i.fiber_per_100g    ?? 0) * factor;
        }
        await supabase.from("recipe_nutrition").upsert({
          recipe_id: saved.id,
          calories: Math.round(calories),
          protein_g: Math.round(protein * 10) / 10,
          fat_g: Math.round(fat * 10) / 10,
          carbohydrates_g: Math.round(carbs * 10) / 10,
          fiber_g: Math.round(fiber * 10) / 10,
          calculated_at: new Date().toISOString(),
        });
      }
    }

    return { title: recipe.title, ok: true };
  } catch (e) {
    return { title: recipe.title, ok: false, error: e instanceof Error ? e.message : "Unbekannter Fehler" };
  }
}

// ─── API Route (streaming SSE) ────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Keine Datei hochgeladen" }, { status: 400 });

  const text = await file.text();
  const rows = parseCsv(text);
  if (rows.length === 0) {
    return NextResponse.json({ error: "CSV leer oder ungültiges Format" }, { status: 400 });
  }

  const recipes = groupRows(rows);
  const total = recipes.length;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      send({ type: "total", total });

      for (let i = 0; i < recipes.length; i++) {
        const result = await saveRecipe(supabase, user.id, recipes[i]);
        send({ type: "progress", index: i + 1, total, result });
      }

      send({ type: "done", total });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
