"use client";

import { cn } from "@/lib/utils";
import type { MacroGoals } from "@/components/log/macro-progress";
import { effectiveMacroGoals } from "@/components/log/macro-progress";

type DayMacros = {
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  calories: number;
};

interface WeekMacroSummaryProps {
  /** day_of_week (1=Mo) → aggregated macros */
  macrosByDay: Record<number, DayMacros>;
  macroGoals: MacroGoals;
  calorieGoal: number | null;
}

const MACROS = [
  { key: "protein_g" as keyof DayMacros, label: "P", color: "bg-blue-500",   overColor: "bg-orange-400" },
  { key: "fat_g"     as keyof DayMacros, label: "F", color: "bg-yellow-500", overColor: "bg-orange-400" },
  { key: "carbs_g"   as keyof DayMacros, label: "K", color: "bg-green-500",  overColor: "bg-orange-400" },
];

const DAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export function WeekMacroSummary({ macrosByDay, macroGoals, calorieGoal }: WeekMacroSummaryProps) {
  const goals = effectiveMacroGoals(macroGoals, calorieGoal);
  if (!goals) return null;

  const hasSomeData = Object.keys(macrosByDay).length > 0;
  if (!hasSomeData) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Makros je Tag</p>
      <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-x-2 gap-y-1 items-center text-xs">
        {/* Header row */}
        <div />
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-muted-foreground font-medium">{d}</div>
        ))}

        {/* One row per macro */}
        {MACROS.map(({ key, label, color, overColor }) => {
          const goal = goals[`${key.replace("_g", "")}_goal_g` as keyof MacroGoals] as number | null;
          if (!goal) return null;

          return (
            <div key={key} className="contents">
              <div className="text-muted-foreground text-right pr-1">{label}</div>
              {Array.from({ length: 7 }, (_, i) => {
                const day = i + 1;
                const dayData = macrosByDay[day];
                const val = dayData ? (dayData[key] as number) : null;

                if (val === null) {
                  return <div key={day} className="h-1.5 rounded-full bg-muted/30" />;
                }

                const pct = Math.min((val / goal) * 100, 100);
                const isOver = val > goal;
                return (
                  <div key={day} className="h-1.5 rounded-full bg-muted overflow-hidden" title={`${Math.round(val)}/${goal}g`}>
                    <div
                      className={cn("h-full rounded-full", isOver ? overColor : color)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
