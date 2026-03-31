import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecipeNutrition } from "@/lib/types";

function MacroBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{Math.round(value)} g</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function NutritionCard({
  nutrition,
  servings,
}: {
  nutrition: RecipeNutrition;
  servings: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Nährwerte</CardTitle>
        <p className="text-sm text-muted-foreground">Pro Portion ({servings} Portionen gesamt)</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {nutrition.calories && (
          <div className="text-center">
            <span className="text-3xl font-bold">{Math.round(nutrition.calories / servings)}</span>
            <span className="text-muted-foreground ml-1">kcal</span>
          </div>
        )}
        <div className="space-y-3">
          {nutrition.protein_g && (
            <MacroBar label="Eiweiß" value={nutrition.protein_g / servings} max={50} color="bg-blue-500" />
          )}
          {nutrition.carbohydrates_g && (
            <MacroBar label="Kohlenhydrate" value={nutrition.carbohydrates_g / servings} max={100} color="bg-yellow-500" />
          )}
          {nutrition.fat_g && (
            <MacroBar label="Fett" value={nutrition.fat_g / servings} max={50} color="bg-red-400" />
          )}
          {nutrition.fiber_g && (
            <MacroBar label="Ballaststoffe" value={nutrition.fiber_g / servings} max={30} color="bg-green-500" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
