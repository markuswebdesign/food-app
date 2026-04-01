import { cn } from "@/lib/utils";

export type MacroGoals = {
  protein_goal_g: number | null;
  fat_goal_g: number | null;
  carbs_goal_g: number | null;
};

export type MacroTotals = {
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  hasData: boolean; // true if at least one entry had macro data
};

interface MacroProgressProps {
  totals: MacroTotals;
  goals: MacroGoals;
}

type MacroDef = {
  label: string;
  key: keyof MacroTotals;
  goalKey: keyof MacroGoals;
  color: string;
  overColor: string;
};

const MACROS: MacroDef[] = [
  { label: "Protein", key: "protein_g", goalKey: "protein_goal_g", color: "bg-blue-500",  overColor: "bg-orange-400" },
  { label: "Fett",    key: "fat_g",     goalKey: "fat_goal_g",     color: "bg-yellow-500", overColor: "bg-orange-400" },
  { label: "Kohlenhydrate", key: "carbs_g", goalKey: "carbs_goal_g", color: "bg-green-500", overColor: "bg-orange-400" },
];

export function MacroProgress({ totals, goals }: MacroProgressProps) {
  if (!totals.hasData) return null;

  return (
    <div className="space-y-2">
      {MACROS.map(({ label, key, goalKey, color, overColor }) => {
        const consumed = totals[key] as number;
        const goal = goals[goalKey] as number | null;

        if (goal === null) return null;

        const pct = Math.min(Math.round((consumed / goal) * 100), 100);
        const isOver = consumed > goal;
        const barColor = isOver ? overColor : color;

        return (
          <div key={label} className="space-y-0.5">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-medium text-muted-foreground">{label}</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {Math.round(consumed)}
                <span className="text-muted-foreground/60"> / {goal} g</span>
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", barColor)}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Aggregates macro totals from log entries */
export function sumMacros(entries: { protein_g: number | null; fat_g: number | null; carbs_g: number | null }[]): MacroTotals {
  let protein = 0, fat = 0, carbs = 0, hasData = false;
  for (const e of entries) {
    if (e.protein_g != null) { protein += e.protein_g; hasData = true; }
    if (e.fat_g != null)     { fat     += e.fat_g;     hasData = true; }
    if (e.carbs_g != null)   { carbs   += e.carbs_g;   hasData = true; }
  }
  return { protein_g: protein, fat_g: fat, carbs_g: carbs, hasData };
}

/** Computes default macro goals from calorie target (30/30/40 split) */
export function defaultMacroGoals(calorieGoal: number): MacroGoals {
  return {
    protein_goal_g: Math.round(calorieGoal * 0.30 / 4),
    fat_goal_g:     Math.round(calorieGoal * 0.30 / 9),
    carbs_goal_g:   Math.round(calorieGoal * 0.40 / 4),
  };
}

/** Returns effective macro goals: manual if set, otherwise default from calories */
export function effectiveMacroGoals(
  manual: MacroGoals,
  calorieGoal: number | null
): MacroGoals | null {
  if (manual.protein_goal_g && manual.fat_goal_g && manual.carbs_goal_g) return manual;
  if (calorieGoal) return defaultMacroGoals(calorieGoal);
  return null;
}
