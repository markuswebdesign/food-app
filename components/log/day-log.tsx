"use client";

import { useState, useCallback, useEffect } from "react";
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
import { ChevronLeft, ChevronRight, Plus, Trash2, Loader2, Flame, UtensilsCrossed } from "lucide-react";
import { toDateString, isToday, formatDate, scaleRecipeNutrition, sumCalories, calorieBalanceLabel } from "@/lib/utils/log";

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
}

export function DayLog({ userId, initialEntries, recipes, calorieGoal }: DayLogProps) {
  const supabase = createClient();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState<LogEntry[]>(initialEntries);
  const [loadingDate, setLoadingDate] = useState(false);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Manual entry form state
  const [manualName, setManualName] = useState("");
  const [manualCals, setManualCals] = useState("");
  const [manualProtein, setManualProtein] = useState("");
  const [manualFat, setManualFat] = useState("");
  const [manualCarbs, setManualCarbs] = useState("");
  const [manualMealTime, setManualMealTime] = useState<MealTime | "">("");
  const [manualError, setManualError] = useState("");

  // Recipe entry form state
  const [selectedRecipeId, setSelectedRecipeId] = useState("");
  const [recipeServings, setRecipeServings] = useState("1");
  const [recipeMealTime, setRecipeMealTime] = useState<MealTime | "">("");
  const [recipeSearch, setRecipeSearch] = useState("");
  const [recipeError, setRecipeError] = useState("");

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

  // Refresh when window/tab becomes visible again (picks up Wochenplan changes)
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

  // ─── Add manual entry ─────────────────────────────────────────────────────

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

  // ─── Add recipe entry ─────────────────────────────────────────────────────

  async function handleAddRecipe() {
    setRecipeError("");
    const recipe = recipes.find((r) => r.id === selectedRecipeId);
    if (!recipe) { setRecipeError("Bitte ein Rezept auswählen"); return; }
    const srv = parseFloat(recipeServings);
    if (!srv || srv <= 0) { setRecipeError("Portionen müssen > 0 sein"); return; }

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
    if (error) { setRecipeError("Fehler beim Speichern"); return; }

    setEntries((prev) => [...prev, data as LogEntry]);
    setSelectedRecipeId(""); setRecipeServings("1"); setRecipeMealTime(""); setRecipeSearch("");
    setSheetOpen(false);
  }

  // ─── Delete entry ─────────────────────────────────────────────────────────

  async function handleDelete(id: string) {
    await supabase.from("food_log_entries").delete().eq("id", id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setDeleteId(null);
  }

  // ─── Computed totals ──────────────────────────────────────────────────────

  const totalCals = sumCalories(entries);
  const filteredRecipes = recipes.filter((r) =>
    r.title.toLowerCase().includes(recipeSearch.toLowerCase())
  );

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

      {/* Entry List */}
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
        <div className="space-y-2">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="py-3 px-4 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm truncate">{entry.name}</p>
                    {entry.meal_time && (
                      <Badge variant="outline" className="text-xs shrink-0">
                        {MEAL_LABELS[entry.meal_time as MealTime] ?? entry.meal_time}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {Math.round(entry.calories)} kcal
                    {entry.servings !== 1 && ` · ${entry.servings} Portionen`}
                    {entry.protein_g != null && ` · ${entry.protein_g}g P`}
                    {entry.fat_g != null && ` · ${entry.fat_g}g F`}
                    {entry.carbs_g != null && ` · ${entry.carbs_g}g K`}
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
      )}

      {/* Add Button */}
      <Button className="w-full" onClick={() => setSheetOpen(true)}>
        <Plus className="h-4 w-4 mr-2" /> Mahlzeit hinzufügen
      </Button>

      {/* Add Entry Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader className="pb-2">
            <SheetTitle>Mahlzeit hinzufügen</SheetTitle>
          </SheetHeader>

          <Tabs defaultValue="recipe" className="mt-2">
            <TabsList className="w-full">
              <TabsTrigger value="recipe" className="flex-1">Rezept wählen</TabsTrigger>
              <TabsTrigger value="manual" className="flex-1">Manuell eingeben</TabsTrigger>
            </TabsList>

            {/* Recipe Tab */}
            <TabsContent value="recipe" className="space-y-4 pt-3">
              <div className="space-y-1.5">
                <Label>Rezept suchen</Label>
                <Input
                  placeholder="Rezeptname..."
                  value={recipeSearch}
                  onChange={(e) => setRecipeSearch(e.target.value)}
                />
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto border rounded-lg">
                {filteredRecipes.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-3 text-center">Keine Rezepte gefunden</p>
                ) : (
                  filteredRecipes.map((r) => (
                    <button
                      key={r.id}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                        selectedRecipeId === r.id ? "bg-primary/10 font-medium" : ""
                      }`}
                      onClick={() => setSelectedRecipeId(r.id)}
                    >
                      <span>{r.title}</span>
                      {r.calories_per_serving != null && (
                        <span className="text-muted-foreground ml-2">
                          ({Math.round(r.calories_per_serving)} kcal/Port.)
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="recipe-servings">Portionen</Label>
                  <Input
                    id="recipe-servings"
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={recipeServings}
                    onChange={(e) => setRecipeServings(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Mahlzeit</Label>
                  <Select value={recipeMealTime} onValueChange={(v) => setRecipeMealTime(v as MealTime)}>
                    <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(MEAL_LABELS) as MealTime[]).map((k) => (
                        <SelectItem key={k} value={k}>{MEAL_LABELS[k]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {recipeError && <p className="text-xs text-destructive">{recipeError}</p>}

              <Button className="w-full" onClick={handleAddRecipe} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Hinzufügen
              </Button>
            </TabsContent>

            {/* Manual Tab */}
            <TabsContent value="manual" className="space-y-4 pt-3">
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
                    placeholder="z.B. 200"
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
                  <Label htmlFor="manual-carbs">Kohlenhydrate (g)</Label>
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
