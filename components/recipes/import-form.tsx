"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, Loader2, ArrowLeft, Camera, X } from "lucide-react";
import type { Category } from "@/lib/types";

interface IngredientRow {
  name: string;
  amount: string;
  unit: string;
  calories_per_100g?: number | null;
  protein_per_100g?: number | null;
  fat_per_100g?: number | null;
  carbs_per_100g?: number | null;
  fiber_per_100g?: number | null;
}

function parseIngredient(raw: string): IngredientRow {
  const match = raw.match(
    /^(\d+(?:[,.]\d+)?)\s*(g|kg|ml|l|EL|TL|Stück|Stk|Prise|Bund|Zweig|Zehe|Dose|Pck|Pkg|Becher|Glas|Tasse)?\s*(.+)$/i
  );
  if (match) {
    return {
      amount: match[1].replace(",", "."),
      unit: match[2] ?? "",
      name: match[3].trim(),
    };
  }
  return { name: raw.trim(), amount: "", unit: "" };
}

interface ImportFormProps {
  categories: Category[];
}

export function ImportForm({ categories }: ImportFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<"input" | "preview">("input");
  const [url, setUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vorschau-Felder
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [servings, setServings] = useState("2");
  const [workTime, setWorkTime] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<IngredientRow[]>([]);

  const mealTimes = categories.filter((c) => c.type === "meal_time");
  const diets = categories.filter((c) => c.type === "diet");

  function detectCategories(categoryStr: string | null | undefined): string[] {
    if (!categoryStr) return [];
    const lower = categoryStr.toLowerCase();
    const detected: string[] = [];

    if (lower.includes("vegan")) {
      const cat = categories.find((c) => c.slug === "vegan");
      if (cat) detected.push(cat.id);
    } else if (lower.includes("vegetar")) {
      const cat = categories.find((c) => c.slug === "vegetarian");
      if (cat) detected.push(cat.id);
    }

    if (lower.includes("frühstück") || lower.includes("breakfast") || lower.includes("frühstuck")) {
      const cat = categories.find((c) => c.slug === "breakfast");
      if (cat) detected.push(cat.id);
    } else if (lower.includes("mittag") || lower.includes("lunch")) {
      const cat = categories.find((c) => c.slug === "lunch");
      if (cat) detected.push(cat.id);
    } else if (lower.includes("abend") || lower.includes("dinner") || lower.includes("hauptgericht")) {
      const cat = categories.find((c) => c.slug === "dinner");
      if (cat) detected.push(cat.id);
    } else if (lower.includes("snack") || lower.includes("dessert") || lower.includes("kuchen") || lower.includes("gebäck")) {
      const cat = categories.find((c) => c.slug === "snack");
      if (cat) detected.push(cat.id);
    }

    return detected;
  }

  function toggleCategory(id: string) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function addIngredient() {
    setIngredients((prev) => [...prev, { name: "", amount: "", unit: "" }]);
  }

  function removeIngredient(idx: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateIngredient(idx: number, field: keyof IngredientRow, value: string) {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === idx ? { ...ing, [field]: value } : ing))
    );
  }

  async function handleImportClick() {
    if (!url.trim().startsWith("http")) {
      setError("Bitte eine gültige URL eingeben (beginnt mit http/https)");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/recipes/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import fehlgeschlagen");

      setTitle(data.title ?? "");
      setDescription(data.description ?? "");
      setInstructions(data.instructions ?? "");
      setImageUrl(data.image_url ?? "");
      const totalTime = (data.prep_time_minutes ?? 0) + (data.cook_time_minutes ?? 0);
      setWorkTime(totalTime > 0 ? String(totalTime) : "");
      setSelectedCategories(detectCategories(data.category));
      setIngredients(
        data.ingredients?.length
          ? data.ingredients.map((i: any) =>
              typeof i === "string"
                ? parseIngredient(i)
                : {
                    name: i.name ?? "",
                    amount: i.amount != null ? String(i.amount) : "",
                    unit: i.unit ?? "",
                    calories_per_100g: i.calories_per_100g ?? null,
                    protein_per_100g: i.protein_per_100g ?? null,
                    fat_per_100g: i.fat_per_100g ?? null,
                    carbs_per_100g: i.carbs_per_100g ?? null,
                    fiber_per_100g: i.fiber_per_100g ?? null,
                  }
            )
          : [{ name: "", amount: "", unit: "" }]
      );
      setStep("preview");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Import fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    // Reset so the same file can be re-selected after clearing
    e.target.value = "";
    if (!file) { setImageFile(null); setImagePreview(null); return; }

    // Resize/compress to stay under Claude's 5MB base64 limit (~3.75MB raw)
    const MAX_PX = 1600;
    const MAX_BYTES = 3.5 * 1024 * 1024;

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > MAX_PX || height > MAX_PX) {
        const ratio = Math.min(MAX_PX / width, MAX_PX / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);

      // Try quality 0.85 first, drop to 0.7 if still too large
      let dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      const approxBytes = (dataUrl.length * 3) / 4;
      if (approxBytes > MAX_BYTES) {
        dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      }

      // Convert dataUrl back to File for FormData
      const byteString = atob(dataUrl.split(",")[1]);
      const ab = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) ab[i] = byteString.charCodeAt(i);
      const compressed = new File([ab], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });

      setImageFile(compressed);
      setImagePreview(dataUrl);
    };
    img.onerror = () => {
      // Fallback: use original file if canvas fails
      URL.revokeObjectURL(objectUrl);
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    };
    img.src = objectUrl;
  }

  async function handleImageImportClick() {
    if (!imageFile) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const res = await fetch("/api/recipes/import", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import fehlgeschlagen");

      setTitle(data.title ?? "");
      setDescription(data.description ?? "");
      setInstructions(data.instructions ?? "");
      // Use the uploaded image as preview (no remote URL from Claude for image mode)
      setImageUrl(""); // data: URLs can't be stored in DB; user can add a URL in preview
      const totalTime = (data.prep_time_minutes ?? 0) + (data.cook_time_minutes ?? 0);
      setWorkTime(totalTime > 0 ? String(totalTime) : "");
      setSelectedCategories(detectCategories(data.category));
      setIngredients(
        data.ingredients?.length
          ? data.ingredients.map((i: any) =>
              typeof i === "string"
                ? parseIngredient(i)
                : {
                    name: i.name ?? "",
                    amount: i.amount != null ? String(i.amount) : "",
                    unit: i.unit ?? "",
                    calories_per_100g: i.calories_per_100g ?? null,
                    protein_per_100g: i.protein_per_100g ?? null,
                    fat_per_100g: i.fat_per_100g ?? null,
                    carbs_per_100g: i.carbs_per_100g ?? null,
                    fiber_per_100g: i.fiber_per_100g ?? null,
                  }
            )
          : [{ name: "", amount: "", unit: "" }]
      );
      setStep("preview");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Import fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Nicht angemeldet"); setSaving(false); return; }

    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .insert({
        user_id: user.id,
        title,
        description: description || null,
        instructions: instructions || "Keine Zubereitung angegeben.",
        servings: parseInt(servings),
        prep_time_minutes: null,
        cook_time_minutes: workTime ? parseInt(workTime) : null,
        image_url: imageUrl || null,
        source_url: url || null,
        is_public: true,
      })
      .select("id")
      .single();

    if (recipeError) { setError(recipeError.message); setSaving(false); return; }

    if (selectedCategories.length > 0) {
      await supabase.from("recipe_categories").insert(
        selectedCategories.map((cid) => ({ recipe_id: recipe.id, category_id: cid }))
      );
    }

    const validIngredients = ingredients.filter((i) => i.name.trim());
    if (validIngredients.length > 0) {
      await supabase.from("ingredients").insert(
        validIngredients.map((i) => ({
          recipe_id: recipe.id,
          name: i.name.trim(),
          amount: i.amount ? parseFloat(i.amount) : null,
          unit: i.unit || null,
          calories_per_100g: i.calories_per_100g ?? null,
          protein_per_100g: i.protein_per_100g ?? null,
          fat_per_100g: i.fat_per_100g ?? null,
          carbs_per_100g: i.carbs_per_100g ?? null,
        }))
      );

      // Nährwerte berechnen & speichern
      const hasNutrition = validIngredients.some((i) => i.calories_per_100g != null);
      if (hasNutrition) {
        let calories = 0, protein = 0, fat = 0, carbs = 0, fiber = 0;
        for (const i of validIngredients) {
          const factor = (parseFloat(i.amount) || 0) / 100;
          calories += (i.calories_per_100g ?? 0) * factor;
          protein  += (i.protein_per_100g  ?? 0) * factor;
          fat      += (i.fat_per_100g      ?? 0) * factor;
          carbs    += (i.carbs_per_100g    ?? 0) * factor;
          fiber    += (i.fiber_per_100g    ?? 0) * factor;
        }
        const { error: nutritionError } = await supabase.from("recipe_nutrition").upsert({
          recipe_id: recipe.id,
          calories: Math.round(calories),
          protein_g: Math.round(protein * 10) / 10,
          fat_g: Math.round(fat * 10) / 10,
          carbohydrates_g: Math.round(carbs * 10) / 10,
          fiber_g: Math.round(fiber * 10) / 10,
          calculated_at: new Date().toISOString(),
        });
        if (nutritionError) console.error("Nährwerte konnten nicht gespeichert werden:", nutritionError);
      }
    }

    router.push(`/recipes/${recipe.id}`);
  }

  if (step === "input") {
    const isImageMode = !!imageFile;

    return (
      <div className="space-y-4">
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>
        )}

        {/* Image preview — shown above the input when a file is selected */}
        {imagePreview && (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Vorschau"
              className="w-full rounded-xl object-cover max-h-56"
            />
            <button
              type="button"
              onClick={() => { setImageFile(null); setImagePreview(null); }}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80"
              aria-label="Bild entfernen"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-3 text-xs text-white/80 bg-black/40 rounded px-2 py-0.5">
              {imageFile?.name}
            </div>
          </div>
        )}

        {/* No <form> — avoids iOS Safari pattern-validation on URL fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url-input">Rezept importieren</Label>

            <div className="flex gap-2">
              <Input
                id="url-input"
                type="text"
                value={isImageMode ? (imageFile?.name ?? "") : url}
                onChange={(e) => { if (!isImageMode) setUrl(e.target.value); }}
                onKeyDown={(e) => { if (e.key === "Enter" && !isImageMode) handleImportClick(); }}
                readOnly={isImageMode}
                placeholder="https://www.chefkoch.de/rezepte/..."
                className={`text-base flex-1 ${isImageMode ? "text-muted-foreground" : ""}`}
              />

              {/* Camera label wrapping input — most compatible on iOS Chrome.
                  No capture, no programmatic .click(), just a native label+input. */}
              <label
                className="flex items-center justify-center h-10 w-10 shrink-0 rounded-md border border-input bg-background hover:bg-muted cursor-pointer transition-colors"
                aria-label="Foto auswählen oder aufnehmen"
                title="Foto"
              >
                <Camera className="h-4 w-4 text-muted-foreground" />
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            <p className="text-xs text-muted-foreground">
              {isImageMode
                ? "Foto ausgewählt · Claude liest Zutaten und Anleitung aus dem Bild"
                : "Rezept-Website, Instagram, TikTok · oder Foto aus Galerie / Kamera"}
            </p>
          </div>

          <Button
            type="button"
            disabled={loading || (!isImageMode && !url.trim())}
            className="w-full"
            onClick={isImageMode ? handleImageImportClick : handleImportClick}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isImageMode ? "Rezept wird erkannt..." : "Rezept wird geladen..."}
              </>
            ) : (
              isImageMode ? "Rezept erkennen" : "Rezept importieren"
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>
      )}

      <button
        onClick={() => setStep("input")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Neu importieren
      </button>

      {/* Vorschau-Bild */}
      {imageUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-xl">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Grunddaten */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Titel *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Rezeptname"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Kurzbeschreibung</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Kurze Beschreibung"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="workTime">Arbeitszeit (Min)</Label>
            <Input
              id="workTime"
              type="number"
              min="0"
              value={workTime}
              onChange={(e) => setWorkTime(e.target.value)}
              placeholder="45"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="servings">Portionen</Label>
            <Input
              id="servings"
              type="number"
              min="1"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Bild-URL</Label>
            <Input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
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

      {/* Zutaten */}
      <div className="space-y-3">
        <Label>Zutaten</Label>
        {ingredients.length === 0 ? (
          <Card>
            <CardContent className="py-4 text-sm text-muted-foreground text-center">
              Keine Zutaten gefunden — bitte manuell ergänzen
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="flex gap-2">
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
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeIngredient(idx)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
          <Plus className="h-4 w-4 mr-1" /> Zutat hinzufügen
        </Button>
      </div>

      <Separator />

      {/* Nährwert-Vorschau */}
      {(() => {
        const valid = ingredients.filter((i) => i.name.trim() && i.calories_per_100g != null);
        if (valid.length === 0) return null;
        const s = Math.max(1, parseInt(servings) || 1);
        let cal = 0, pro = 0, fat = 0, carb = 0;
        for (const i of valid) {
          const f = (parseFloat(i.amount) || 0) / 100;
          cal  += (i.calories_per_100g ?? 0) * f;
          pro  += (i.protein_per_100g  ?? 0) * f;
          fat  += (i.fat_per_100g      ?? 0) * f;
          carb += (i.carbs_per_100g    ?? 0) * f;
        }
        return (
          <div className="space-y-2">
            <Label>Nährwerte yoyo pro Portion</Label>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Energie", value: `${Math.round(cal / s)} kcal` },
                { label: "Eiweiß",  value: `${(pro  / s).toFixed(1)} g` },
                { label: "Fett",    value: `${(fat  / s).toFixed(1)} g` },
                { label: "Kohlenhydrate", value: `${(carb / s).toFixed(1)} g` },
              ].map((t) => (
                <div key={t.label} className="bg-muted/60 rounded-xl px-4 py-2 text-sm">
                  <p className="font-bold">{t.value}</p>
                  <p className="text-muted-foreground text-xs">{t.label}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      <Separator />

      {/* Zubereitung */}
      <div className="space-y-2">
        <Label htmlFor="instructions">Zubereitung</Label>
        <textarea
          id="instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={10}
          placeholder="Zubereitung..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
        />
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving || !title} className="flex-1">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Wird gespeichert...
            </>
          ) : (
            "Rezept speichern"
          )}
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          Abbrechen
        </Button>
      </div>
    </div>
  );
}
