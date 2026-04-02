"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronLeft, ChevronRight, Plus, Trash2, Loader2, Flame, UtensilsCrossed, Search, X } from "lucide-react";
import { toDateString, isToday, formatDate, scaleRecipeNutrition, sumCalories, calorieBalanceLabel } from "@/lib/utils/log";
import { MacroProgress, sumMacros, effectiveMacroGoals, type MacroGoals } from "@/components/log/macro-progress";

// ─── Types ────────────────────────────────────────────────────────────────────

export type LogEntry = {
  id: string;
  name: string;
  calories: number;
  protein_g: number | null;
  fat_g: number | null;
  carbs_g: number | null;
  servings: number;
  meal_time: string | null;
  recipe_id: string | null;
};

export type RecipeOption = {
  id: string;
  title: string;
  calories_per_serving: number | null;
  protein_per_serving: number | null;
  fat_per_serving: number | null;
  carbs_per_serving: number | null;
  servings: number;
};

type MealTime = "breakfast" | "lunch" | "dinner" | "snack";

type FoodLookupResult = {
  calories_per_100g: number;
  protein_per_100g: number;
  fat_per_100g: number;
  carbs_per_100g: number;
  source: "local" | "openfoodfacts";
};

const MEAL_LABELS: Record<MealTime, string> = {
  breakfast: "Frühstück",
  lunch: "Mittagessen",
  dinner: "Abendessen",
  snack: "Snack",
};

// ─── DayLog ──────────────────────────────────────────────────────────────────

interface DayLogProps {
  userId: string;
  initialEntries: LogEntry[];
  recipes: RecipeOption[];
  calorieGoal: number | null;
  macroGoals: MacroGoals;
}

export function DayLog({ userId, initialEntries, recipes, calorieGoal, macroGoals }: DayLogProps) {
  const supabase = createClient();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState<LogEntry[]>(initialEntries);
  const [loadingDate, setLoadingDate] = useState(false);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMealTime, setSheetMealTime] = useState<MealTime | "">("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // ─── Food search state ────────────────────────────────────────────────────
  const [foodQuery, setFoodQuery] = useState("");
  const [foodResult, setFoodResult] = useState<FoodLookupResult | null>(null);
  const [foodSearching, setFoodSearching] = useState(false);
  const [foodNotFound, setFoodNotFound] = useState(false);
  const [foodAmount, setFoodAmount] = useState("100");
  const [foodMealTime, setFoodMealTime] = useState<MealTime | "">("");
  const foodDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Recipe search state ──────────────────────────────────────────────────
  const [recipeSearch, setRecipeSearch] = useState("");
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [recipeServings, setRecipeServings] = useState("1");
  const [recipeMealTime, setRecipeMealTime] = useState<MealTime | "">("");

  // ─── Manual form state ────────────────────────────────────────────────────
  const [manualName, setManualName] = useState("");
  const [manualCals, setManualCals] = useState("");
  const [manualProtein, setManualProtein] = useState("");
  const [manualFat, setManualFat] = useState("");
  const [manualCarbs, setManualCarbs] = useState("");
  const [manualMealTime, setManualMealTime] = useState<MealTime | "">("");
  const [manualError, setManualError] = useState("");

  // ─── Date navigation ───────────────────────────────────────────────────────

  const loadEntriesForDate = useCallback(async (date: Date) => {
    setLoadingDate(true);
    const { data } = await supabase
      .from("food_log_entries")
      .select("id, name, calories, protein_g, fat_g, carbs_g, servings, meal_time, recipe_id")
      .eq("user_id", userId)
      .eq("date", toDateString(date))
      .order("created_at");
    setEntries((data as LogEntry[]) ?? []);
    setLoadingDate(false);
  }, [userId, supabase]);

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        loadEntriesForDate(currentDate);
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [currentDate, loadEntriesForDate]);

  function goToPrevDay() {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
    loadEntriesForDate(prev);
  }

  function goToNextDay() {
    if (isToday(currentDate)) return;
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
    loadEntriesForDate(next);
  }

  function goToToday() {
    const today = new Date();
    setCurrentDate(today);
    loadEntriesForDate(today);
  }

  // ─── Food search / lookup ─────────────────────────────────────────────────

  function handleFoodQueryChange(value: string) {
    setFoodQuery(value);
    setFoodResult(null);
    setFoodNotFound(false);

    if (foodDebounceRef.current) clearTimeout(foodDebounceRef.current);
    if (value.trim().length < 2) { setFoodSearching(false); return; }

    setFoodSearching(true);
    foodDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/nutrition/lookup?q=${encodeURIComponent(value.trim())}`);
        const data: FoodLookupResult | null = await res.json();
        if (data) {
          setFoodResult(data);
          setFoodNotFound(false);
        } else {
          setFoodNotFound(true);
        }
      } catch {
        setFoodNotFound(true);
      } finally {
        setFoodSearching(false);
      }
    }, 400);
  }

  const foodAmountNum = parseFloat(foodAmount) || 0;
  const foodFactor = foodAmountNum / 100;
  const calculatedFood = foodResult && foodAmountNum > 0 ? {
    calories: Math.round(foodResult.calories_per_100g * foodFactor),
    protein_g: Math.round(foodResult.protein_per_100g * foodFactor * 10) / 10,
    fat_g: Math.round(foodResult.fat_per_100g * foodFactor * 10) / 10,
    carbs_g: Math.round(foodResult.carbs_per_100g * foodFactor * 10) / 10,
  } : null;

  async function handleAddFood() {
    if (!foodResult || !calculatedFood) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("food_log_entries")
      .insert({
        user_id: userId,
        date: toDateString(currentDate),
        name: foodQuery.trim(),
        calories: calculatedFood.calories,
        protein_g: calculatedFood.protein_g,
        fat_g: calculatedFood.fat_g,
        carbs_g: calculatedFood.carbs_g,
        servings: 1,
        meal_time: foodMealTime || null,
        recipe_id: null,
      })
      .select()
      .single();
    setSaving(false);
    if (error) return;
    setEntries((prev) => [...prev, data as LogEntry]);
    resetFoodState();
    setSheetOpen(false);
  }

  function resetFoodState() {
    setFoodQuery(""); setFoodResult(null); setFoodNotFound(false);
    setFoodAmount("100"); setFoodMealTime(""); setFoodSearching(false);
  }

  // ─── Add recipe ───────────────────────────────────────────────────────────

  async function handleAddRecipe() {
    const recipe = recipes.find((r) => r.id === selectedRecipeId);
    if (!recipe) return;
    const srv = parseFloat(recipeServings);
    if (!srv || srv <= 0) return;
    const scaled = scaleRecipeNutrition(recipe, srv);
    setSaving(true);
    const { data, error } = await supabase
      .from("food_log_entries")
      .insert({
        user_id: userId,
        date: toDateString(currentDate),
        name: recipe.title,
        calories: scaled.calories,
        protein_g: scaled.protein_g,
        fat_g: scaled.fat_g,
        carbs_g: scaled.carbs_g,
        servings: srv,
        meal_time: recipeMealTime || null,
        recipe_id: recipe.id,
      })
      .select()
      .single();
    setSaving(false);
    if (error) return;
    setEntries((prev) => [...prev, data as LogEntry]);
    setSelectedRecipeId(null); setRecipeServings("1"); setRecipeMealTime(""); setRecipeSearch("");
    setSheetOpen(false);
  }

  // ─── Add manual ───────────────────────────────────────────────────────────

  async function handleAddManual() {
    setManualError("");
    if (!manualName.trim()) { setManualError("Name ist erforderlich"); return; }
    if (manualCals === "") { setManualError("Kalorien sind erforderlich"); return; }
    setSaving(true);
    const { data, error } = await supabase
      .from("food_log_entries")
      .insert({
        user_id: userId,
        date: toDateString(currentDate),
        name: manualName.trim(),
        calories: parseFloat(manualCals),
        protein_g: manualProtein ? parseFloat(manualProtein) : null,
        fat_g: manualFat ? parseFloat(manualFat) : null,
        carbs_g: manualCarbs ? parseFloat(manualCarbs) : null,
        servings: 1,
        meal_time: manualMealTime || null,
        recipe_id: null,
      })
      .select()
      .single();
    setSaving(false);
    if (error) { setManualError("Fehler beim Speichern"); return; }
    setEntries((prev) => [...prev, data as LogEntry]);
    setManualName(""); setManualCals(""); setManualProtein("");
    setManualFat(""); setManualCarbs(""); setManualMealTime("");
    setSheetOpen(false);
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  async function handleDelete(id: string) {
    await supabase.from("food_log_entries").delete().eq("id", id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setDeleteId(null);
  }

  function openSheet(mealTime: MealTime | "" = "") {
    setSheetMealTime(mealTime);
    setFoodMealTime(mealTime);
    setRecipeMealTime(mealTime);
    setManualMealTime(mealTime);
    resetFoodState();
    setSelectedRecipeId(null); setRecipeServings("1"); setRecipeSearch("");
    setManualName(""); setManualCals(""); setManualProtein(""); setManualFat(""); setManualCarbs(""); setManualError("");
    setSheetOpen(true);
  }

  // ─── Computed ─────────────────────────────────────────────────────────────

  const totalCals = sumCalories(entries);
  const macroTotals = sumMacros(entries);
  const effectiveGoals = effectiveMacroGoals(macroGoals, calorieGoal);
  const filteredRecipes = recipes.filter((r) =>
    r.title.toLowerCase().includes(recipeSearch.toLowerCase())
  );
  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId) ?? null;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Day Navigator */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={goToPrevDay}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <p className="font-semibold text-base">{formatDate(currentDate)}</p>
          {!isToday(currentDate) && (
            <button onClick={goToToday} className="text-xs text-primary underline mt-0.5">
              Heute
            </button>
          )}
        </div>
        <Button variant="outline" size="icon" onClick={goToNextDay} disabled={isToday(currentDate)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calorie Summary */}
      <Card className={totalCals > 0 ? "border-primary/20 bg-primary/5" : ""}>
        <CardContent className="py-3 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="font-semibold text-lg">{Math.round(totalCals).toLocaleString("de-DE")} kcal</span>
            {calorieGoal && (
              <span className="text-sm text-muted-foreground">/ {calorieGoal.toLocaleString("de-DE")} Ziel</span>
            )}
          </div>
          <Badge variant={calorieGoal && totalCals <= calorieGoal ? "default" : "secondary"}>
            {calorieGoal
              ? calorieBalanceLabel(totalCals, calorieGoal).label
              : `${entries.length} Einträge`}
          </Badge>
        </CardContent>
      </Card>

      {/* Macro Progress */}
      {effectiveGoals && macroTotals.hasData && (
        <div className="px-4 py-3 rounded-lg border bg-card">
          <MacroProgress totals={macroTotals} goals={effectiveGoals} />
        </div>
      )}

      {/* Entry List grouped by meal time */}
      {loadingDate ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground gap-2">
          <UtensilsCrossed className="h-10 w-10 opacity-30" />
          <p className="text-sm">Noch nichts geloggt</p>
          <p className="text-xs">Füge deine erste Mahlzeit hinzu</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(["breakfast", "lunch", "dinner", "snack"] as MealTime[]).map((mealTime) => {
            const group = entries.filter((e) => e.meal_time === mealTime);
            if (group.length === 0) return null;
            const groupCals = group.reduce((s, e) => s + e.calories, 0);
            return (
              <div key={mealTime}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {MEAL_LABELS[mealTime]}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {Math.round(groupCals)} kcal
                    </p>
                    <button
                      onClick={() => openSheet(mealTime)}
                      className="h-5 w-5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {group.map((entry) => (
                    <Card key={entry.id}>
                      <CardContent className="py-2.5 px-4 flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{entry.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {Math.round(entry.calories)} kcal
                            {entry.servings !== 1 && ` · ${entry.servings} Port.`}
                            {entry.protein_g != null && ` · ${Math.round(entry.protein_g)}g P`}
                            {entry.fat_g != null && ` · ${Math.round(entry.fat_g)}g F`}
                            {entry.carbs_g != null && ` · ${Math.round(entry.carbs_g)}g K`}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteId(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
          {/* Entries without meal_time */}
          {(() => {
            const ungrouped = entries.filter((e) => !e.meal_time);
            if (ungrouped.length === 0) return null;
            return (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Sonstige
                </p>
                <div className="space-y-1.5">
                  {ungrouped.map((entry) => (
                    <Card key={entry.id}>
                      <CardContent className="py-2.5 px-4 flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{entry.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {Math.round(entry.calories)} kcal
                            {entry.protein_g != null && ` · ${Math.round(entry.protein_g)}g P`}
                            {entry.fat_g != null && ` · ${Math.round(entry.fat_g)}g F`}
                            {entry.carbs_g != null && ` · ${Math.round(entry.carbs_g)}g K`}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteId(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Add Button */}
      <Button className="w-full" onClick={() => openSheet()}>
        <Plus className="h-4 w-4 mr-2" /> Mahlzeit hinzufügen
      </Button>

      {/* Add Entry Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-sm flex flex-col gap-0 p-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle>Mahlzeit hinzufügen</SheetTitle>
          </SheetHeader>

          <Tabs defaultValue="food" className="flex flex-col flex-1 min-h-0">
            <TabsList className="mx-4 mt-3 mb-0 shrink-0">
              <TabsTrigger value="food" className="flex-1 text-xs">Lebensmittel</TabsTrigger>
              <TabsTrigger value="recipe" className="flex-1 text-xs">Rezept</TabsTrigger>
              <TabsTrigger value="manual" className="flex-1 text-xs">Manuell</TabsTrigger>
            </TabsList>

            {/* ── Lebensmittel Tab ─────────────────────────────────────────── */}
            <TabsContent value="food" className="flex flex-col flex-1 min-h-0 mt-0">
              <div className="px-4 pt-4 pb-3 border-b space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9 pr-9"
                    placeholder="z.B. Apfel, Snickers, Proteinshake..."
                    value={foodQuery}
                    onChange={(e) => handleFoodQueryChange(e.target.value)}
                    autoFocus
                  />
                  {foodQuery && (
                    <button
                      onClick={() => { setFoodQuery(""); setFoodResult(null); setFoodNotFound(false); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {/* Searching indicator */}
                {foodSearching && (
                  <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Suche Nährwerte...</span>
                  </div>
                )}

                {/* Not found */}
                {!foodSearching && foodNotFound && (
                  <div className="text-center py-6 text-muted-foreground text-sm space-y-1">
                    <p>Keine Nährwerte für &quot;{foodQuery}&quot; gefunden.</p>
                    <p className="text-xs">Versuche eine andere Schreibweise oder nutze &quot;Manuell&quot;.</p>
                  </div>
                )}

                {/* Result card */}
                {!foodSearching && foodResult && (
                  <div className="space-y-4">
                    {/* Nutrition per 100g info */}
                    <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm capitalize">{foodQuery}</p>
                        <Badge variant="outline" className="text-xs">
                          {foodResult.source === "local" ? "Datenbank" : "OpenFoodFacts"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Pro 100g: {foodResult.calories_per_100g} kcal · {foodResult.protein_per_100g}g P · {foodResult.fat_per_100g}g F · {foodResult.carbs_per_100g}g K
                      </p>
                    </div>

                    {/* Amount input */}
                    <div className="space-y-1.5">
                      <Label>Menge (g)</Label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="h-9 w-9 rounded-full border flex items-center justify-center text-lg font-medium hover:bg-muted disabled:opacity-40 shrink-0"
                          onClick={() => setFoodAmount((v) => String(Math.max(5, (parseFloat(v) || 100) - 10)))}
                        >−</button>
                        <Input
                          type="number"
                          min="1"
                          className="text-center font-semibold"
                          value={foodAmount}
                          onChange={(e) => setFoodAmount(e.target.value)}
                        />
                        <button
                          type="button"
                          className="h-9 w-9 rounded-full border flex items-center justify-center text-lg font-medium hover:bg-muted shrink-0"
                          onClick={() => setFoodAmount((v) => String((parseFloat(v) || 100) + 10))}
                        >+</button>
                      </div>
                    </div>

                    {/* Calculated macros preview */}
                    {calculatedFood && (
                      <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3">
                        <p className="text-xs text-muted-foreground mb-1">Berechnete Nährwerte</p>
                        <p className="font-semibold text-base">{calculatedFood.calories} kcal</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {calculatedFood.protein_g}g Protein · {calculatedFood.fat_g}g Fett · {calculatedFood.carbs_g}g Kohlenhydrate
                        </p>
                      </div>
                    )}

                    {/* Meal time */}
                    <div className="space-y-1.5">
                      <Label>Mahlzeit</Label>
                      <Select value={foodMealTime} onValueChange={(v) => setFoodMealTime(v as MealTime)}>
                        <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                        <SelectContent>
                          {(Object.keys(MEAL_LABELS) as MealTime[]).map((k) => (
                            <SelectItem key={k} value={k}>{MEAL_LABELS[k]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {!foodSearching && !foodResult && !foodNotFound && (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground gap-2">
                    <Search className="h-8 w-8 opacity-20" />
                    <p className="text-sm">Lebensmittel suchen</p>
                    <p className="text-xs">Nährwerte werden automatisch berechnet</p>
                  </div>
                )}
              </div>

              {/* Add button pinned to bottom */}
              {foodResult && calculatedFood && (
                <div className="px-4 py-4 border-t">
                  <Button className="w-full" onClick={handleAddFood} disabled={saving || foodAmountNum <= 0}>
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Hinzufügen · {calculatedFood.calories} kcal
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* ── Rezept Tab ───────────────────────────────────────────────── */}
            <TabsContent value="recipe" className="flex flex-col flex-1 min-h-0 mt-0">
              <div className="px-4 pt-4 pb-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Rezept suchen..."
                    value={recipeSearch}
                    onChange={(e) => setRecipeSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
                {filteredRecipes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-10">Keine Rezepte gefunden</p>
                ) : (
                  filteredRecipes.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => { setSelectedRecipeId(r.id); setRecipeServings("1"); }}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left ${
                        selectedRecipeId === r.id ? "bg-primary/10 ring-1 ring-primary/30" : ""
                      }`}
                    >
                      <div className="h-10 w-14 rounded bg-muted flex items-center justify-center text-lg shrink-0">
                        🍽
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{r.title}</p>
                        {r.calories_per_serving != null && (
                          <p className="text-xs text-muted-foreground">{Math.round(r.calories_per_serving)} kcal/Port.</p>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>

              {selectedRecipe && (
                <div className="px-4 py-4 border-t space-y-3">
                  <div className="flex items-center gap-3">
                    <Label className="shrink-0 text-sm">Portionen</Label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="h-8 w-8 rounded-full border flex items-center justify-center text-lg font-medium hover:bg-muted disabled:opacity-40"
                        onClick={() => setRecipeServings((v) => String(Math.max(0.5, parseFloat(v) - 0.5)))}
                        disabled={parseFloat(recipeServings) <= 0.5}
                      >−</button>
                      <span className="w-8 text-center text-sm font-semibold">{recipeServings}</span>
                      <button
                        type="button"
                        className="h-8 w-8 rounded-full border flex items-center justify-center text-lg font-medium hover:bg-muted"
                        onClick={() => setRecipeServings((v) => String(parseFloat(v) + 0.5))}
                      >+</button>
                    </div>
                    {selectedRecipe.calories_per_serving != null && (
                      <span className="text-xs text-muted-foreground ml-auto">
                        {Math.round(selectedRecipe.calories_per_serving * parseFloat(recipeServings))} kcal
                      </span>
                    )}
                  </div>
                  <Select value={recipeMealTime} onValueChange={(v) => setRecipeMealTime(v as MealTime)}>
                    <SelectTrigger><SelectValue placeholder="Mahlzeit (optional)" /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(MEAL_LABELS) as MealTime[]).map((k) => (
                        <SelectItem key={k} value={k}>{MEAL_LABELS[k]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button className="w-full" onClick={handleAddRecipe} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Hinzufügen
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* ── Manuell Tab ──────────────────────────────────────────────── */}
            <TabsContent value="manual" className="flex-1 overflow-y-auto px-4 py-4 space-y-4 mt-0">
              <div className="space-y-1.5">
                <Label htmlFor="manual-name">Name *</Label>
                <Input
                  id="manual-name"
                  placeholder="z.B. Apfel, Kaffee mit Milch..."
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="manual-cals">Kalorien (kcal) *</Label>
                  <Input
                    id="manual-cals"
                    type="number"
                    min="0"
                    placeholder="200"
                    value={manualCals}
                    onChange={(e) => setManualCals(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Mahlzeit</Label>
                  <Select value={manualMealTime} onValueChange={(v) => setManualMealTime(v as MealTime)}>
                    <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(MEAL_LABELS) as MealTime[]).map((k) => (
                        <SelectItem key={k} value={k}>{MEAL_LABELS[k]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="manual-protein">Protein (g)</Label>
                  <Input id="manual-protein" type="number" min="0" placeholder="opt." value={manualProtein} onChange={(e) => setManualProtein(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="manual-fat">Fett (g)</Label>
                  <Input id="manual-fat" type="number" min="0" placeholder="opt." value={manualFat} onChange={(e) => setManualFat(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="manual-carbs">KH (g)</Label>
                  <Input id="manual-carbs" type="number" min="0" placeholder="opt." value={manualCarbs} onChange={(e) => setManualCarbs(e.target.value)} />
                </div>
              </div>

              {manualError && <p className="text-xs text-destructive">{manualError}</p>}

              <Button className="w-full" onClick={handleAddManual} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Hinzufügen
              </Button>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eintrag löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Dieser Logeintrag wird dauerhaft gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
