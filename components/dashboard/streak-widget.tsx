import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";
import type { StreakData } from "@/lib/utils/streak";

interface StreakWidgetProps {
  streak: StreakData;
}

export function StreakWidget({ streak }: StreakWidgetProps) {
  const { currentStreak, longestStreak, motivationText } = streak;
  const isActive = currentStreak > 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Flame className={`h-5 w-5 ${isActive ? "text-orange-500" : "text-muted-foreground"}`} />
          Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="flex items-end justify-between">
          <p className="text-3xl font-bold">
            {currentStreak}
            <span className="text-base font-normal text-muted-foreground ml-1">
              {currentStreak === 1 ? "Tag" : "Tage"}
            </span>
          </p>
          {longestStreak > 0 && (
            <p className="text-xs text-muted-foreground">
              Rekord: {longestStreak} {longestStreak === 1 ? "Tag" : "Tage"}
            </p>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{motivationText}</p>
      </CardContent>
    </Card>
  );
}
