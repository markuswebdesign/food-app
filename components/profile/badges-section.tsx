import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Lock } from "lucide-react";

interface BadgesSectionProps {
  earnedBadges: number[]; // e.g. [7, 14]
}

const ALL_BADGES = [
  { days: 7, label: "7-Tage-Streak" },
  { days: 14, label: "14-Tage-Streak" },
  { days: 30, label: "30-Tage-Streak" },
];

export function BadgesSection({ earnedBadges }: BadgesSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Abzeichen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {ALL_BADGES.map(({ days, label }) => {
            const earned = earnedBadges.includes(days);
            return (
              <div key={days} className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                    earned
                      ? "border-orange-400 bg-orange-50 dark:bg-orange-950/30"
                      : "border-muted bg-muted/30"
                  }`}
                >
                  {earned ? (
                    <Flame className="h-6 w-6 text-orange-500" />
                  ) : (
                    <Lock className="h-5 w-5 text-muted-foreground/40" />
                  )}
                </div>
                <p
                  className={`text-xs text-center ${
                    earned ? "text-foreground font-medium" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
