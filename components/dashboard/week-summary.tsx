import { TrendingDown, TrendingUp, Minus } from "lucide-react";

interface WeekSummaryProps {
  balance: number; // positive = deficit, negative = surplus
  goalType: "lose" | "maintain";
}

export function WeekSummary({ balance, goalType }: WeekSummaryProps) {
  const neutralThreshold = 100;
  const isNeutral = goalType === "maintain" && Math.abs(balance) <= neutralThreshold;
  const isDeficit = balance > 0;

  let icon: React.ReactNode;
  let label: string;
  let color: string;

  if (isNeutral) {
    icon = <Minus className="h-5 w-5 text-muted-foreground" />;
    label = "Ausgeglichen diese Woche";
    color = "text-foreground";
  } else if (isDeficit) {
    icon = <TrendingDown className="h-5 w-5 text-green-500" />;
    label = `${Math.abs(Math.round(balance)).toLocaleString("de-DE")} kcal Defizit diese Woche`;
    color = "text-green-600";
  } else {
    icon = <TrendingUp className="h-5 w-5 text-red-500" />;
    label = `${Math.abs(Math.round(balance)).toLocaleString("de-DE")} kcal Überschuss diese Woche`;
    color = "text-red-500";
  }

  return (
    <div className="flex items-center gap-2 px-1">
      {icon}
      <span className={`text-sm font-medium ${color}`}>{label}</span>
    </div>
  );
}
