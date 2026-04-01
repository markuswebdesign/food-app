import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { Flame, UtensilsCrossed } from "lucide-react";

interface CalorieTodayCardProps {
  consumed: number;
  goal: number;
  goalType: "lose" | "maintain";
}

export function CalorieTodayCard({ consumed, goal, goalType }: CalorieTodayCardProps) {
  const remaining = goal - consumed;
  const percent = Math.min(Math.round((consumed / goal) * 100), 100);
  const isDeficit = remaining >= 0;
  const isNeutralGoal = goalType === "maintain";

  // Colour logic
  const neutralThreshold = 100;
  let statusLabel: string;
  let statusVariant: "default" | "secondary" | "destructive";
  let progressColor: string;

  if (isNeutralGoal && Math.abs(remaining) <= neutralThreshold) {
    statusLabel = "Ausgeglichen";
    statusVariant = "secondary";
    progressColor = "bg-muted-foreground";
  } else if (isDeficit) {
    statusLabel = `−${Math.abs(remaining).toLocaleString("de-DE")} kcal`;
    statusVariant = "default";
    progressColor = "bg-green-500";
  } else {
    statusLabel = `+${Math.abs(remaining).toLocaleString("de-DE")} kcal`;
    statusVariant = "destructive";
    progressColor = "bg-red-500";
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Flame className="h-5 w-5 text-orange-500" />
          Heute
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {consumed === 0 ? (
          <div className="flex flex-col items-center py-4 text-center text-muted-foreground gap-2">
            <UtensilsCrossed className="h-8 w-8 opacity-30" />
            <p className="text-sm">Noch nichts geloggt</p>
            <Link href="/log" className="text-xs text-primary underline">
              Zum Logbuch
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold">
                  {Math.round(consumed).toLocaleString("de-DE")}
                  <span className="text-base font-normal text-muted-foreground ml-1">kcal</span>
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  von {goal.toLocaleString("de-DE")} kcal Ziel
                </p>
              </div>
              <Badge variant={statusVariant}>{statusLabel}</Badge>
            </div>

            <div className="space-y-1">
              <Progress value={percent} className="gap-0">
                <ProgressTrack className="h-3">
                  <ProgressIndicator className={progressColor} />
                </ProgressTrack>
              </Progress>
              <p className="text-xs text-muted-foreground text-right">{percent}%</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
