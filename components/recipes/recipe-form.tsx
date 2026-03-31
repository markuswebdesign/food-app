"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Loader2, CheckCircle2 } from "lucide-react";
import { calculateRecipeNutrition } from "@/lib/utils/nutrition";
import type { Category, Recipe } from "@/lib/types";

interface IngredientRow {
  name: string;
  amount: string;
  unit: string;
  calories_per_100g: number | null;
  protein_per_100g: number | null;
  fat_per_100g: number | null;
  carbs_per_100g: number | null;
  fiber_per_100g: number | null;
  nutritionStatus: "idle" | "loading" | "found" | "not_found";
}

const emptyIngredient = (): IngredientRow => ({
  name: "",
  amount: "",
  unit: "",
  calories_per_100g: null,
  protein_per_100g: null,
  fat_per_100g: null,
  carbs_per_100g: null,
  fiber_per_100g: null,
  nutritionStatus: "idle",
});

interface RecipeFormProps {
  categories: Category[];
  recipe?: Recipe;
}

export function RecipeForm({ categories, recipe }: RecipeFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState(recipe?.title ?? "");
  const [description, setDescription] = useState(recipe?.description ?? "");
  const [instructions, setInstructions] = useState(recipe?.instructions ?? "");
  const [servings, setServings] = useState(String(recipe?.servings ?? 2));
  const [workTime, setWorkTime] = useState(
    String((recipe?.prep_time_minutes ?? 0) + (recipe?.cook_time_minutes ?? 0)) || ""
  );
  const [imageUrl, setImageUrl] = useState(recipe?.image_url ?? "");
  const [sourceUrl, setSourceUrl] = useState(recipe?.source_url ?? "");
  const [isPublic, setIsPublic] = useState(recipe?.is_public ?? true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    recipe?.categories?.map((c) => c.id) ?? []
  );
  const [ingredients, setIngredients] = useState<IngredientRow[]>(
    recipe?.ingredients?.map((i) => ({
      name: i.name,
      amount: String(i.amount ?? ""),
      unit: i.unit ?? "",
      calories_per_100g: i.calories_per_100g,
      protein_per_100g: i.protein_per_100g,
      fat_per_100g: i.fat_per_100g,
      carbs_per_100g: i.carbs_per_100g,
      fiber_per_100g: null,
      nutritionStatus: i.calories_per_100g != null ? "found" : "idle",
    })) ?? [emptyIngredient()]
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const mealTimes = categories.filter((c) => c.type === "meal_time");
  const diets = categories.filter((c) => c.type === "diet");

  function toggleCategory(id: string) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function addIngredient() {
    setIngredients((prev) => [...prev, emptyIngredient()]);
  }

  function removeIngredient(idx: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateIngredient(idx: number, field: "name" | "amount" | "unit", value: string) {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === idx ? { ...ing, [field]: value } : ing))
    );
  }

  async function lookupNutrition(idx: number, name: string) {
    if (name.trim().length < 3) return;

    setIngredients((prev) =>
      prev.map((ing, i) => (i === idx ? { ...ing, nutritionStatus: "loading" } : ing))
    );

    try {
      const res = await fetch(`/api/nutrition/lookup?q=${encodeURIComponent(name.trim())}`);
      const data = await res.json();

      if (data) {
        setIngredients((prev) =>
          prev.map((ing, i) =>
            i === idx
              ? {
                  ...ing,
                  calories_per_100g: data.calories_per_100g,
                  protein_per_100g: data.protein_per_100g,
                  fat_per_100g: data.fat_per_100g,
                  carbs_per_100g: data.carbs_per_100g,
                  fiber_per_100g: data.fiber_per_100g,
                  nutritionStatus: "found",
                }
              : ing
          )
        );
      } else {
        setIngredients((prev) =>
          prev.map((ing, i) => (i === idx ? { ...ing, nutritionStatus: "not_found" } : ing))
        );
      }
    } catch {
      setIngredients((prev) =>
        prev.map((ing, i) => (i === idx ? { ...ing, nutritionStatus: "not_found" } : ing))
      );
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Nicht angemeldet"); setLoading(false); return; }

    const recipeData = {
      user_id: user.id,
      title,
      description: description || null,
      instructions,
      servings: parseInt(servings),
      prep_time_minutes: null,
      cook_time_minutes: workTime ? parseInt(workTime) : null,
      image_url: imageUrl || null,
      source_url: sourceUrl || null,
      is_public: isPublic,
    };

    let recipeId = recipe?.id;

    if (recipe?.id) {
      const { error } = await supabase.from("recipes").update(recipeData).eq("id", recipe.id);
      if (error) { setError(error.message); setLoading(false); return; }
    } else {
      const { data, error } = await supabase.from("recipes").insert(recipeData).select("id").single();
      if (error) { setError(error.message); setLoading(false); return; }
      recipeId = data.id;
    }

    // Kategorien
    await supabase.from("recipe_categories").delete().eq("recipe_id", recipeId!);
    if (selectedCategories.length > 0) {
      await supabase.from("recipe_categories").insert(
        selectedCategories.map((cid) => ({ recipe_id: recipeId!, category_id: cid }))
      );
    }

    // Zutaten
    await supabase.from("ingredients").delete().eq("recipe_id", recipeId!);
    const validIngredients = ingredients.filter((i) => i.name.trim());
    if (validIngredients.length > 0) {
      await supabase.from("ingredients").insert(
        validIngredients.map((i) => ({
          recipe_id: recipeId!,
          name: i.name.trim(),
          amount: i.amount ? parseFloat(i.amount) : null,
          unit: i.unit || null,
          calories_per_100g: i.calories_per_100g,
          protein_per_100g: i.protein_per_100g,
          fat_per_100g: i.fat_per_100g,
          carbs_per_100g: i.carbs_per_100g,
        }))
      );
    }

    // Nährwerte berechnen & speichern
    const hasNutrition = validIngredients.some((i) => i.calories_per_100g != null);
    if (hasNutrition) {
      const nutrition = calculateRecipeNutrition(
        validIngredients.map((i) => ({
          amount: parseFloat(i.amount) || 0,
          calories_per_100g: i.calories_per_100g,
          protein_per_100g: i.protein_per_100g,
          fat_per_100g: i.fat_per_100g,
          carbs_per_100g: i.carbs_per_100g,
          fiber_per_100g: i.fiber_per_100g,
        }))
      );
      await supabase.from("recipe_nutrition").upsert({
        recipe_id: recipeId!,
        calories: nutrition.calories,
        protein_g: nutrition.protein_g,
        fat_g: nutrition.fat_g,
        carbohydrates_g: nutrition.carbohydrates_g,
        fiber_g: nutrition.fiber_g,
        calculated_at: new Date().toISOString(),
      });
    }

    router.push(`/recipes/${recipeId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>
      )}

      {/* Grunddaten */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Titel *</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="z.B. Spaghetti Carbonara" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Kurzbeschreibung</Label>
          <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Kurze Beschreibung des Rezepts" />
        </div>
      </div>

      <Separator />

      {/* Kategorien */}
      <div className="space-y-3">
        <Label>Kategorien</Label>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Mahlzeit</p>
          <div className="flex flex-wrap gap-2">
            {mealTimes.map((cat) => (
              <Badge
                key={cat.id}
                variant={selectedCategories.includes(cat.id) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleCategory(cat.id)}
              >
                {cat.icon} {cat.name}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Ernährungsweise</p>
          <div className="flex flex-wrap gap-2">
            {diets.map((cat) => (
              <Badge
                key={cat.id}
                variant={selectedCategories.includes(cat.id) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleCategory(cat.id)}
              >
                {cat.icon} {cat.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      {/* Zeit & Portionen */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="workTime">Arbeitszeit (Min)</Label>
          <Input id="workTime" type="number" min="0" value={workTime} onChange={(e) => setWorkTime(e.target.value)} placeholder="45" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="servings">Portionen</Label>
          <Input id="servings" type="number" min="1" value={servings} onChange={(e) => setServings(e.target.value)} required />
        </div>
      </div>

      <Separator />

      {/* Zutaten */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Zutaten</Label>
          <span className="text-xs text-muted-foreground">Nährwerte werden automatisch gesucht</span>
        </div>
        <div className="space-y-2">
          {ingredients.map((ing, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                placeholder="Menge"
                value={ing.amount}
                onChange={(e) => updateIngredient(idx, "amount", e.target.value)}
                className="w-24"
                type="number"
                min="0"
                step="any"
              />
              <Input
                placeholder="Einheit"
                value={ing.unit}
                onChange={(e) => updateIngredient(idx, "unit", e.target.value)}
                className="w-24"
              />
              <Input
                placeholder="Zutat"
                value={ing.name}
                onChange={(e) => updateIngredient(idx, "name", e.target.value)}
                onBlur={(e) => lookupNutrition(idx, e.target.value)}
                className="flex-1"
              />
              <div className="w-5 shrink-0 flex items-center justify-center">
                {ing.nutritionStatus === "loading" && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                )}
                {ing.nutritionStatus === "found" && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeIngredient(idx)}
                disabled={ingredients.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
          <Plus className="h-4 w-4 mr-1" /> Zutat hinzufügen
        </Button>
      </div>

      <Separator />

      {/* Zubereitung */}
      <div className="space-y-2">
        <Label htmlFor="instructions">Zubereitung *</Label>
        <textarea
          id="instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          required
          rows={8}
          placeholder="Schritt für Schritt Anleitung..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
        />
      </div>

      <Separator />

      {/* Optional */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Bild-URL</Label>
          <Input id="imageUrl" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sourceUrl">Quell-URL (Instagram, Website etc.)</Label>
          <Input id="sourceUrl" type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://..." />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="isPublic"
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          <Label htmlFor="isPublic">Rezept öffentlich sichtbar</Label>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Speichern..." : recipe ? "Änderungen speichern" : "Rezept erstellen"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
