"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ChevronLeft, ChevronRight, Plus, X, Loader2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type MealTime = "breakfast" | "lunch" | "dinner" | "snack";

interface PlanRecipe {
  id: string;
  title: string;
  image_url: string | null;
  category_slugs: string[];
}

interface PlanEntry {
  id: string;
  meal_plan_id: string;
  recipe_id: string;
  day_of_week: number;
  meal_time: MealTime;
  servings: number;
  recipes: { id: string; title: string; image_url: string | null };
}

interface CategoryOption {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  type: string;
}

interface WeekPlanProps {
  recipes: PlanRecipe[];
  categories: CategoryOption[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = [
  { label: "Montag", short: "Mo" },
  { label: "Dienstag", short: "Di" },
  { label: "Mittwoch", short: "Mi" },
  { label: "Donnerstag", short: "Do" },
  { label: "Freitag", short: "Fr" },
  { label: "Samstag", short: "Sa" },
  { label: "Sonntag", short: "So" },
];

const MEAL_TIMES: { key: MealTime; label: string }[] = [
  { key: "breakfast", label: "Frühstück" },
  { key: "lunch", label: "Mittag" },
  { key: "dinner", label: "Abend" },
  { key: "snack", label: "Snack" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatShortDate(date: Date, offset: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + offset);
  return `${d.getDate()}.${d.getMonth() + 1}.`;
}

function getCalendarWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function slotId(day: number, mealTime: MealTime) {
  return `${day}-${mealTime}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DraggableEntry({
  entry,
  onRemove,
  isDragActive,
}: {
  entry: PlanEntry;
  onRemove: (id: string) => void;
  isDragActive: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: entry.id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ opacity: isDragging ? 0 : 1 }}
      className="relative group h-full rounded-lg border bg-card p-2 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow select-none"
    >
      {entry.recipes.image_url && (
        <div className="w-full aspect-video rounded overflow-hidden mb-1.5">
          <img
            src={entry.recipes.image_url}
            alt={entry.recipes.title}
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>
      )}
      <p className="text-xs font-medium leading-tight line-clamp-2">{entry.recipes.title}</p>
      {!isDragActive && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onRemove(entry.id); }}
          className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground items-center justify-center hidden group-hover:flex z-10"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

function DroppableSlot({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[80px] rounded-lg transition-all ${isOver ? "ring-2 ring-primary ring-offset-1 bg-primary/5" : ""}`}
    >
      {children}
    </div>
  );
}

function EntryOverlay({ entry }: { entry: PlanEntry }) {
  return (
    <div className="rounded-lg border bg-card p-2 shadow-2xl cursor-grabbing w-36 opacity-95">
      {entry.recipes.image_url && (
        <div className="w-full aspect-video rounded overflow-hidden mb-1.5">
          <img
            src={entry.recipes.image_url}
            alt={entry.recipes.title}
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>
      )}
      <p className="text-xs font-medium leading-tight line-clamp-2">{entry.recipes.title}</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function WeekPlan({ recipes, categories }: WeekPlanProps) {
  const supabase = createClient();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [mealPlanId, setMealPlanId] = useState<string | null>(null);
  const [entries, setEntries] = useState<PlanEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeEntry, setActiveEntry] = useState<PlanEntry | null>(null);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: number; mealTime: MealTime } | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    loadWeekPlan();
  }, [weekStart]);

  async function loadWeekPlan() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: plan } = await supabase
      .from("meal_plans")
      .select("id")
      .eq("user_id", user.id)
      .eq("week_start", formatDate(weekStart))
      .maybeSingle();

    if (plan) {
      setMealPlanId(plan.id);
      const { data: planEntries } = await supabase
        .from("meal_plan_entries")
        .select("*, recipes(id, title, image_url)")
        .eq("meal_plan_id", plan.id);
      setEntries((planEntries ?? []) as PlanEntry[]);
    } else {
      setMealPlanId(null);
      setEntries([]);
    }
    setLoading(false);
  }

  function openPicker(day: number, mealTime: MealTime) {
    setSelectedSlot({ day, mealTime });
    setSearch("");
    setActiveCategory(null);
    setPickerOpen(true);
  }

  async function addEntry(recipeId: string) {
    if (!selectedSlot) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    let planId = mealPlanId;
    if (!planId) {
      const { data: plan } = await supabase
        .from("meal_plans")
        .upsert(
          { user_id: user.id, week_start: formatDate(weekStart) },
          { onConflict: "user_id,week_start" }
        )
        .select("id")
        .single();
      planId = plan?.id ?? null;
      setMealPlanId(planId);
    }
    if (!planId) { setSaving(false); return; }

    const existing = entries.find(
      (e) => e.day_of_week === selectedSlot.day && e.meal_time === selectedSlot.mealTime
    );
    if (existing) {
      await supabase.from("meal_plan_entries").delete().eq("id", existing.id);
    }

    const { data: entry } = await supabase
      .from("meal_plan_entries")
      .insert({
        meal_plan_id: planId,
        recipe_id: recipeId,
        day_of_week: selectedSlot.day,
        meal_time: selectedSlot.mealTime,
        servings: 1,
      })
      .select("*, recipes(id, title, image_url)")
      .single();

    if (entry) {
      setEntries((prev) => [
        ...prev.filter(
          (e) => !(e.day_of_week === selectedSlot.day && e.meal_time === selectedSlot.mealTime)
        ),
        entry as PlanEntry,
      ]);
    }
    setSaving(false);
    setPickerOpen(false);
  }

  async function removeEntry(entryId: string) {
    await supabase.from("meal_plan_entries").delete().eq("id", entryId);
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
  }

  function handleDragStart(event: DragStartEvent) {
    const entry = entries.find((e) => e.id === event.active.id);
    setActiveEntry(entry ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveEntry(null);
    const { active, over } = event;
    if (!over) return;

    const dragged = entries.find((e) => e.id === active.id);
    if (!dragged) return;

    const [dayStr, mealTime] = (over.id as string).split("-");
    const targetDay = parseInt(dayStr);
    const targetMealTime = mealTime as MealTime;

    if (dragged.day_of_week === targetDay && dragged.meal_time === targetMealTime) return;

    const targetEntry = entries.find(
      (e) => e.day_of_week === targetDay && e.meal_time === targetMealTime
    );

    // Optimistic update
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id === dragged.id) return { ...e, day_of_week: targetDay, meal_time: targetMealTime };
        if (targetEntry && e.id === targetEntry.id)
          return { ...e, day_of_week: dragged.day_of_week, meal_time: dragged.meal_time };
        return e;
      })
    );

    // DB update
    await supabase
      .from("meal_plan_entries")
      .update({ day_of_week: targetDay, meal_time: targetMealTime })
      .eq("id", dragged.id);

    if (targetEntry) {
      await supabase
        .from("meal_plan_entries")
        .update({ day_of_week: dragged.day_of_week, meal_time: dragged.meal_time })
        .eq("id", targetEntry.id);
    }
  }

  const getEntry = (day: number, mealTime: MealTime) =>
    entries.find((e) => e.day_of_week === day && e.meal_time === mealTime);

  const filteredRecipes = recipes.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || r.category_slugs.includes(activeCategory);
    return matchesSearch && matchesCategory;
  });

  const kw = getCalendarWeek(weekStart);
  const mealTimes = categories.filter((c) => c.type === "meal_time");
  const diets = categories.filter((c) => c.type === "diet");

  return (
    <div className="space-y-4">
      {/* Wochennavigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setWeekStart((d) => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; })}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-[180px] text-center">
          <div className="font-semibold">KW {kw}</div>
          <div className="text-xs text-muted-foreground">
            {formatShortDate(weekStart, 0)} – {formatShortDate(weekStart, 6)}
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setWeekStart((d) => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; })}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground text-xs"
          onClick={() => setWeekStart(getMonday(new Date()))}
        >
          Heute
        </Button>
      </div>

      {/* Raster */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              {/* Header */}
              <div className="grid grid-cols-[90px_1fr_1fr_1fr_1fr] gap-2 mb-2 px-1">
                <div />
                {MEAL_TIMES.map((mt) => (
                  <div key={mt.key} className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide py-1">
                    {mt.label}
                  </div>
                ))}
              </div>

              {/* Tage */}
              <div className="space-y-2">
                {DAYS.map((day, idx) => {
                  const dayNum = idx + 1;
                  return (
                    <div key={dayNum} className="grid grid-cols-[90px_1fr_1fr_1fr_1fr] gap-2 items-stretch">
                      <div className="flex flex-col justify-center px-1 py-2 text-sm">
                        <span className="font-semibold">{day.short}</span>
                        <span className="text-xs text-muted-foreground">{formatShortDate(weekStart, idx)}</span>
                      </div>

                      {MEAL_TIMES.map((mt) => {
                        const entry = getEntry(dayNum, mt.key);
                        const sid = slotId(dayNum, mt.key);
                        return (
                          <DroppableSlot key={mt.key} id={sid}>
                            {entry ? (
                              <DraggableEntry
                                entry={entry}
                                onRemove={removeEntry}
                                isDragActive={!!activeEntry}
                              />
                            ) : (
                              <button
                                onClick={() => openPicker(dayNum, mt.key)}
                                className="w-full h-full min-h-[80px] rounded-lg border border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/20 transition-colors flex items-center justify-center text-muted-foreground/30 hover:text-primary"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            )}
                          </DroppableSlot>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DragOverlay dropAnimation={null}>
            {activeEntry ? <EntryOverlay entry={activeEntry} /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Rezept-Picker */}
      <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-sm flex flex-col gap-0 p-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle>Rezept auswählen</SheetTitle>
          </SheetHeader>

          <div className="px-4 pt-4 space-y-3 border-b pb-3">
            <Input
              placeholder="Rezept suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            {/* Kategorie-Filter */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap gap-1.5">
                <Badge
                  variant={activeCategory === null ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => setActiveCategory(null)}
                >
                  Alle
                </Badge>
                {mealTimes.map((cat) => (
                  <Badge
                    key={cat.id}
                    variant={activeCategory === cat.slug ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                    onClick={() => setActiveCategory(activeCategory === cat.slug ? null : cat.slug)}
                  >
                    {cat.icon} {cat.name}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {diets.map((cat) => (
                  <Badge
                    key={cat.id}
                    variant={activeCategory === cat.slug ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                    onClick={() => setActiveCategory(activeCategory === cat.slug ? null : cat.slug)}
                  >
                    {cat.icon} {cat.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
            {saving ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : filteredRecipes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">
                Keine Rezepte gefunden
              </p>
            ) : (
              filteredRecipes.map((recipe) => (
                <button
                  key={recipe.id}
                  onClick={() => addEntry(recipe.id)}
                  disabled={saving}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  {recipe.image_url ? (
                    <img
                      src={recipe.image_url}
                      alt={recipe.title}
                      className="h-12 w-16 rounded object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-12 w-16 rounded bg-muted flex items-center justify-center text-xl shrink-0">
                      🍽
                    </div>
                  )}
                  <span className="text-sm font-medium line-clamp-2">{recipe.title}</span>
                </button>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
