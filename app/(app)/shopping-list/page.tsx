"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { lookupCategory, CATEGORY_ORDER } from "@/lib/nutrition/local-ingredients";
import type { IngredientCategory } from "@/lib/nutrition/local-ingredients";
import { StapleItemsPanel } from "@/components/shopping-list/staple-items-panel";
import {
  Trash2,
  Printer,
  Plus,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Loader2,
  BookMarked,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ManualItem = {
  id: string;
  name: string;
  amount: string;
  unit: string;
};

type AggregatedItem = {
  key: string;
  name: string;
  amount: number | null;
  unit: string | null;
  sources: string[]; // recipe titles
  category: IngredientCategory;
};

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

function formatShortDate(date: Date, offset = 0): string {
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

const MANUAL_KEY = "shopping-list-manual";
const CHECKED_KEY = "shopping-list-checked";

// ─── Component ────────────────────────────────────────────────────────────────

export default function ShoppingListPage() {
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<"list" | "staple">("list");
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [recipeItems, setRecipeItems] = useState<AggregatedItem[]>([]);
  const [manualItems, setManualItems] = useState<ManualItem[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("");

  // Load manual items + checked state from localStorage
  useEffect(() => {
    try {
      const storedManual = localStorage.getItem(MANUAL_KEY);
      if (storedManual) setManualItems(JSON.parse(storedManual));
      const storedChecked = localStorage.getItem(CHECKED_KEY);
      if (storedChecked) setCheckedKeys(new Set(JSON.parse(storedChecked)));
    } catch {}
  }, []);

  // Persist manual items
  useEffect(() => {
    localStorage.setItem(MANUAL_KEY, JSON.stringify(manualItems));
  }, [manualItems]);

  // Persist checked state
  useEffect(() => {
    localStorage.setItem(CHECKED_KEY, JSON.stringify(Array.from(checkedKeys)));
  }, [checkedKeys]);

  // Load recipe ingredients from meal plan
  const loadMealPlanIngredients = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setRecipeItems([]);
      setLoading(false);
      return;
    }

    const { data: plan } = await supabase
      .from("meal_plans")
      .select(
        `id, meal_plan_entries(
          id, recipe_id,
          recipes(title, ingredients(id, name, amount, unit))
        )`
      )
      .eq("user_id", user.id)
      .eq("week_start", formatDate(weekStart))
      .maybeSingle();

    if (!plan) {
      setRecipeItems([]);
      setLoading(false);
      return;
    }

    // Aggregate ingredients: group by name+unit, sum amounts
    const aggregated = new Map<string, AggregatedItem>();

    for (const entry of (plan as any).meal_plan_entries ?? []) {
      const recipe = entry.recipes;
      if (!recipe) continue;
      const ingredients = recipe.ingredients ?? [];

      for (const ing of ingredients) {
        const key = `${ing.name.toLowerCase().trim()}__${(ing.unit ?? "").toLowerCase().trim()}`;
        const existing = aggregated.get(key);
        const parsedAmount = ing.amount !== null ? Number(ing.amount) : null;

        if (existing) {
          // Add amount if both are numeric
          if (existing.amount !== null && parsedAmount !== null) {
            existing.amount += parsedAmount;
          }
          if (!existing.sources.includes(recipe.title)) {
            existing.sources.push(recipe.title);
          }
        } else {
          aggregated.set(key, {
            key,
            name: ing.name,
            amount: parsedAmount,
            unit: ing.unit ?? null,
            sources: [recipe.title],
            category: lookupCategory(ing.name),
          });
        }
      }
    }

    setRecipeItems(Array.from(aggregated.values()));
    setLoading(false);
  }, [weekStart]);

  useEffect(() => {
    loadMealPlanIngredients();
  }, [loadMealPlanIngredients]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  function toggleChecked(key: string) {
    setCheckedKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function addManualItem() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setManualItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: trimmed, amount: amount.trim(), unit: unit.trim() },
    ]);
    setName("");
    setAmount("");
    setUnit("");
  }

  function deleteManualItem(id: string) {
    setManualItems((prev) => prev.filter((i) => i.id !== id));
    setCheckedKeys((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function clearChecked() {
    setCheckedKeys((prev) => {
      const next = new Set(prev);
      // Remove checked manual items
      manualItems.forEach((i) => { if (next.has(i.id)) { next.delete(i.id); setManualItems((m) => m.filter((x) => x.id !== i.id)); } });
      // Remove checked recipe keys
      recipeItems.forEach((i) => next.delete(i.key));
      return next;
    });
    // Clean up checked manual items separately
    setManualItems((prev) => prev.filter((i) => !checkedKeys.has(i.id)));
    setCheckedKeys((prev) => {
      const next = new Set(prev);
      recipeItems.forEach((i) => next.delete(i.key));
      return next;
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") addManualItem();
  }

  // ─── Derived ────────────────────────────────────────────────────────────────

  const kw = getCalendarWeek(weekStart);

  // Combine all items into a unified list with category
  type UnifiedItem =
    | { kind: "recipe"; item: AggregatedItem; id: string }
    | { kind: "manual"; item: ManualItem; id: string };

  const allItems: UnifiedItem[] = [
    ...recipeItems.map((item) => ({ kind: "recipe" as const, item, id: item.key })),
    ...manualItems.map((item) => ({ kind: "manual" as const, item, id: item.id })),
  ];

  const getCategory = (u: UnifiedItem): IngredientCategory =>
    u.kind === "recipe" ? u.item.category : lookupCategory(u.item.name);

  const uncheckedAll = allItems.filter((u) => !checkedKeys.has(u.id));
  const checkedAll = allItems.filter((u) => checkedKeys.has(u.id));
  const totalUnchecked = uncheckedAll.length;
  const totalChecked = checkedAll.length;

  // Group unchecked items by category in supermarket order
  const groupedUnchecked = CATEGORY_ORDER.reduce<Record<IngredientCategory, UnifiedItem[]>>(
    (acc, cat) => {
      acc[cat] = uncheckedAll.filter((u) => getCategory(u) === cat);
      return acc;
    },
    {} as Record<IngredientCategory, UnifiedItem[]>
  );

  // ─── Render helpers ──────────────────────────────────────────────────────────

  function RecipeItemRow({ item }: { item: AggregatedItem }) {
    const checked = checkedKeys.has(item.key);
    return (
      <li className="flex items-start gap-3 py-2 group">
        <Checkbox
          checked={checked}
          onCheckedChange={() => toggleChecked(item.key)}
          className="mt-0.5 print:hidden"
        />
        <span className="hidden print:inline w-4 h-4 border border-gray-400 rounded shrink-0 mt-0.5" />
        <div className={`flex-1 min-w-0 ${checked ? "opacity-50" : ""}`}>
          <p className={`text-sm ${checked ? "line-through text-muted-foreground" : ""}`}>
            {item.amount !== null && (
              <span className="font-medium mr-1">
                {Number.isInteger(item.amount) ? item.amount : item.amount.toFixed(1)}{" "}
                {item.unit}
              </span>
            )}
            {item.name}
          </p>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {item.sources.map((src) => (
              <span key={src} className="text-xs text-muted-foreground">
                {src}
              </span>
            ))}
          </div>
        </div>
      </li>
    );
  }

  function ManualItemRow({ item }: { item: ManualItem }) {
    const checked = checkedKeys.has(item.id);
    return (
      <li className="flex items-center gap-3 py-2 group">
        <Checkbox
          checked={checked}
          onCheckedChange={() => toggleChecked(item.id)}
          className="print:hidden"
        />
        <span className="hidden print:inline w-4 h-4 border border-gray-400 rounded shrink-0" />
        <span className={`flex-1 text-sm ${checked ? "line-through text-muted-foreground" : ""}`}>
          {item.amount && (
            <span className="font-medium mr-1">
              {item.amount} {item.unit}
            </span>
          )}
          {item.name}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
          onClick={() => deleteManualItem(item.id)}
        >
          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </li>
    );
  }

  function UnifiedItemRow({ unified }: { unified: UnifiedItem }) {
    return unified.kind === "recipe"
      ? <RecipeItemRow item={unified.item} />
      : <ManualItemRow item={unified.item} />;
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-7 w-7" />
            Einkaufsliste
          </h1>
          {activeTab === "list" && (
            <p className="text-muted-foreground mt-1">{totalUnchecked} Artikel übrig</p>
          )}
        </div>
        {activeTab === "list" && (
          <Button variant="outline" onClick={() => window.print()} className="gap-2">
            <Printer className="h-4 w-4" />
            Drucken
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b gap-0 print:hidden">
        <button
          onClick={() => setActiveTab("list")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === "list"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShoppingCart className="h-4 w-4" /> Einkaufsliste
        </button>
        <button
          onClick={() => setActiveTab("staple")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === "staple"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookMarked className="h-4 w-4" /> Stammprodukte
        </button>
      </div>

      {activeTab === "staple" && <StapleItemsPanel />}

      {activeTab === "list" && <>

      {/* Print title */}
      <div className="hidden print:block">
        <h1 className="text-2xl font-bold">Einkaufsliste – KW {kw}</h1>
      </div>

      {/* Week navigator */}
      <div className="flex items-center gap-2 print:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setWeekStart((d) => {
              const n = new Date(d);
              n.setDate(n.getDate() - 7);
              return n;
            })
          }
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center min-w-[160px]">
          <div className="font-semibold text-sm">KW {kw}</div>
          <div className="text-xs text-muted-foreground">
            {formatShortDate(weekStart)} – {formatShortDate(weekStart, 6)}
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setWeekStart((d) => {
              const n = new Date(d);
              n.setDate(n.getDate() + 7);
              return n;
            })
          }
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

      {/* Add manual item */}
      <div className="flex gap-2 print:hidden">
        <Input
          placeholder="Menge"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-20 shrink-0"
        />
        <Input
          placeholder="Einheit"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-24 shrink-0"
        />
        <Input
          placeholder="Zutat manuell hinzufügen..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button onClick={addManualItem} size="icon" disabled={!name.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12 print:hidden">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Empty state */}
          {allItems.length === 0 && (
            <div className="text-center py-16 text-muted-foreground print:hidden">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Keine Zutaten für KW {kw}.</p>
              <p className="text-sm mt-1">
                Füge Rezepte im Wochenplan hinzu oder trage Artikel manuell ein.
              </p>
            </div>
          )}

          {/* Grouped by category */}
          {allItems.length > 0 && (
            <div className="space-y-5">
              {CATEGORY_ORDER.map((cat) => {
                const items = groupedUnchecked[cat];
                if (items.length === 0) return null;
                return (
                  <div key={cat}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 print:text-black">
                      {cat}
                    </p>
                    <ul className="divide-y divide-border">
                      {items.map((u) => (
                        <UnifiedItemRow key={u.id} unified={u} />
                      ))}
                    </ul>
                  </div>
                );
              })}

              {/* Checked items at the bottom */}
              {checkedAll.length > 0 && (
                <div className="opacity-60 print:hidden">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Erledigt ({checkedAll.length})
                  </p>
                  <ul className="divide-y divide-border">
                    {checkedAll.map((u) => (
                      <UnifiedItemRow key={u.id} unified={u} />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Clear checked */}
          {totalChecked > 0 && (
            <div className="flex justify-end print:hidden">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={clearChecked}
              >
                Erledigte löschen ({totalChecked})
              </Button>
            </div>
          )}
        </>
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          nav,
          header,
          aside {
            display: none !important;
          }
        }
      `}</style>

      </>}
    </div>
  );
}
