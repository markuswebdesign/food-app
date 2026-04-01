import { cn } from "@/lib/utils";
import type { WeekDayData } from "@/lib/utils/dashboard";

interface WeekChartProps {
  days: WeekDayData[];
}

export function WeekChart({ days }: WeekChartProps) {
  const maxConsumed = Math.max(...days.map((d) => d.consumed ?? 0), ...days.map((d) => d.goal));

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Diese Woche
      </h3>
      <div className="flex items-end gap-1.5 h-32">
        {days.map((day) => {
          const isFuture = !day.isToday && !day.isPast;
          const hasData = day.consumed !== null;
          const isDeficit = hasData && day.consumed! <= day.goal;

          const goalHeight = Math.round((day.goal / maxConsumed) * 100);
          const consumedHeight = hasData
            ? Math.round((day.consumed! / maxConsumed) * 100)
            : 0;

          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1 h-full">
              {/* Bar area */}
              <div className="flex-1 w-full flex items-end relative">
                {/* Goal line (subtle) */}
                <div
                  className="absolute w-full border-t border-dashed border-muted-foreground/30"
                  style={{ bottom: `${goalHeight}%` }}
                />

                {/* Consumed bar */}
                <div
                  className={cn(
                    "w-full rounded-t-sm transition-all",
                    isFuture
                      ? "bg-muted/30"
                      : hasData
                      ? isDeficit
                        ? "bg-green-500"
                        : "bg-red-400"
                      : "bg-muted/50",
                    day.isToday && "ring-2 ring-primary ring-offset-1"
                  )}
                  style={{ height: isFuture ? "4px" : `${Math.max(consumedHeight, 4)}%` }}
                  title={
                    hasData
                      ? `${Math.round(day.consumed!)} / ${day.goal} kcal`
                      : isFuture
                      ? "Zukunft"
                      : "Keine Einträge"
                  }
                />
              </div>

              {/* Day label */}
              <span
                className={cn(
                  "text-xs",
                  day.isToday ? "font-bold text-primary" : "text-muted-foreground"
                )}
              >
                {day.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-green-500" />
          Defizit
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-400" />
          Überschuss
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm border border-dashed border-muted-foreground/50" />
          Ziel
        </span>
      </div>
    </div>
  );
}
