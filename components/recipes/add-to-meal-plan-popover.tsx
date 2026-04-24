"use client";

import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createClient } from "@/lib/supabase/client";

type MealTime = "breakfast" | "lunch" | "dinner" | "snack";

const DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MEAL_TIMES: { key: MealTime; label: string }[] = [
  { key: "breakfast", label: "Frühstück" },
  { key: "lunch", label: "Mittagessen" },
  { key: "dinner", label: "Abendessen" },
  { key: "snack", label: "Snack" },
];

const CATEGORY_TO_MEAL: Record<string, MealTime> = {
  breakfast: "breakfast",
  lunch: "lunch",
  dinner: "dinner",
};

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function dateForDay(weekStart: Date, dayIndex: number): string {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + dayIndex);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface AddToMealPlanPopoverProps {
  recipeId: string;
  categorySlugs?: string[];
  onAdded?: () => void;
  onRemoved?: () => void;
  inMealPlan?: boolean;
}

export function AddToMealPlanPopover({ recipeId, categorySlugs = [], onAdded, onRemoved, inMealPlan = false }: AddToMealPlanPopoverProps) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedMeal, setSelectedMeal] = useState<MealTime>(() => {
    for (const slug of categorySlugs) {
      if (CATEGORY_TO_MEAL[slug]) return CATEGORY_TO_MEAL[slug];
    }
    return "lunch";
  });
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleAdd() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const weekStart = getMonday(new Date());
    const weekStartStr = weekStart.toISOString().split("T")[0];
    const entryDate = dateForDay(weekStart, selectedDay);

    const { data: plan } = await supabase
      .from("meal_plans")
      .upsert({ user_id: user.id, week_start: weekStartStr }, { onConflict: "user_id,week_start" })
      .select("id")
      .single();

    if (!plan) { setSaving(false); return; }

    const [{ data: recipe }, { data: nutrition }] = await Promise.all([
      supabase.from("recipes").select("title, servings").eq("id", recipeId).single(),
      supabase.from("recipe_nutrition").select("calories, protein_g, fat_g, carbohydrates_g").eq("recipe_id", recipeId).maybeSingle(),
    ]);

    const { data: logEntry } = await supabase
      .from("food_log_entries")
      .insert({
        user_id: user.id,
        date: entryDate,
        name: recipe?.title ?? "Rezept",
        calories: nutrition?.calories ?? 0,
        protein_g: nutrition?.protein_g ?? null,
        fat_g: nutrition?.fat_g ?? null,
        carbs_g: nutrition?.carbohydrates_g ?? null,
        servings: 1,
        meal_time: selectedMeal,
        recipe_id: recipeId,
      })
      .select("id")
      .single();

    await supabase.from("meal_plan_entries").insert({
      meal_plan_id: plan.id,
      recipe_id: recipeId,
      day_of_week: selectedDay + 1,
      meal_time: selectedMeal,
      servings: 1,
      food_log_entry_id: logEntry?.id ?? null,
    });

    setSaving(false);
    setSuccess(true);
    onAdded?.();
    setTimeout(() => { setSuccess(false); setOpen(false); }, 1500);
  }

  async function handleRemove() {
    setRemoving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setRemoving(false); return; }

    const today = new Date();
    const sixDaysAgo = new Date(today);
    sixDaysAgo.setDate(today.getDate() - 6);

    const { data: plan } = await supabase
      .from("meal_plans")
      .select("id")
      .eq("user_id", user.id)
      .gte("week_start", sixDaysAgo.toISOString().split("T")[0])
      .lte("week_start", today.toISOString().split("T")[0])
      .order("week_start", { ascending: false })
      .limit(1)
      .single();

    if (!plan) { setRemoving(false); return; }

    const { data: entries } = await supabase
      .from("meal_plan_entries")
      .select("id, food_log_entry_id")
      .eq("meal_plan_id", plan.id)
      .eq("recipe_id", recipeId);

    for (const entry of entries ?? []) {
      if (entry.food_log_entry_id) {
        await supabase.from("food_log_entries").delete().eq("id", entry.food_log_entry_id);
      }
      await supabase.from("meal_plan_entries").delete().eq("id", entry.id);
    }

    setRemoving(false);
    onRemoved?.();
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        onClick={(e) => { e.preventDefault(); setOpen((v) => !v); }}
        className={`h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors ${inMealPlan ? "border-2 border-green-600" : "border"}`}
        aria-label={inMealPlan ? "Diese Woche im Wochenplan" : "Zum Wochenplan hinzufügen"}
        title={inMealPlan ? "Diese Woche im Wochenplan" : "Zum Wochenplan hinzufügen"}
        render={
          <button type="button" />
        }
      >
        <CalendarPlus className={`h-4 w-4 transition-colors ${inMealPlan ? "text-green-600" : ""}`} />
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="end">
        {success ? (
          <p className="text-sm text-center text-green-600 font-medium py-2">
            ✓ Zum Wochenplan hinzugefügt
          </p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-semibold">Zum Wochenplan hinzufügen</p>

            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Wochentag</p>
              <div className="flex gap-1 flex-wrap">
                {DAYS.map((day, i) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(i)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      selectedDay === i
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Mahlzeit</p>
              <div className="flex gap-1 flex-wrap">
                {MEAL_TIMES.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedMeal(key)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      selectedMeal === key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <Button size="sm" className="w-full" onClick={handleAdd} disabled={saving || removing}>
              {saving ? "Wird hinzugefügt…" : "Hinzufügen"}
            </Button>
            {inMealPlan && (
              <Button size="sm" variant="outline" className="w-full text-destructive hover:text-destructive" onClick={handleRemove} disabled={removing || saving}>
                {removing ? "Wird entfernt…" : "Aus Wochenplan entfernen"}
              </Button>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
