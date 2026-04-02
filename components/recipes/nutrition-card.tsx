import { Flame, Egg, Droplets, Wheat, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RecipeNutrition } from "@/lib/types";

type MacroTileProps = {
  icon: React.ReactNode;
  value: string;
  label: string;
};

function MacroTile({ icon, value, label }: MacroTileProps) {
  return (
    <div className="flex items-center gap-3 bg-muted/60 rounded-xl px-4 py-3 flex-1 min-w-[120px]">
      <div className="text-muted-foreground shrink-0">{icon}</div>
      <div>
        <p className="font-bold text-base leading-tight">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function NutritionCard({
  nutrition,
}: {
  nutrition: RecipeNutrition;
  servings?: number; // nur noch für Rückwärtskompatibilität, wird nicht mehr verwendet
}) {
  const tiles = [
    nutrition.calories != null && {
      icon: <Flame className="h-5 w-5" />,
      value: `${Math.round(nutrition.calories)} kcal`,
      label: "Energie",
    },
    nutrition.protein_g != null && {
      icon: <Egg className="h-5 w-5" />,
      value: `${nutrition.protein_g.toFixed(1)} g`,
      label: "Eiweiß",
    },
    nutrition.fat_g != null && {
      icon: <Droplets className="h-5 w-5" />,
      value: `${nutrition.fat_g.toFixed(1)} g`,
      label: "Fett",
    },
    nutrition.carbohydrates_g != null && {
      icon: <Wheat className="h-5 w-5" />,
      value: `${nutrition.carbohydrates_g.toFixed(1)} g`,
      label: "Kohlenhydrate",
    },
  ].filter(Boolean) as MacroTileProps[];

  if (tiles.length === 0) return null;

  const isManual = nutrition.nutrition_source === "manual";
  const unknownIngredients = nutrition.unknown_ingredients?.filter(Boolean) ?? [];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold">Nährwerte pro Portion</h2>
        <Badge variant={isManual ? "outline" : "secondary"} className="text-xs">
          {isManual ? "Manuell" : "Berechnet"}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-3">
        {tiles.map((tile) => (
          <MacroTile key={tile.label} {...tile} />
        ))}
      </div>

      {nutrition.fiber_g != null && (
        <p className="text-sm text-muted-foreground">
          Ballaststoffe: {nutrition.fiber_g.toFixed(1)} g
        </p>
      )}

      {unknownIngredients.length > 0 && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
          <span>
            Nicht in Datenbank gefunden (nicht berücksichtigt):{" "}
            <span className="text-foreground">{unknownIngredients.join(", ")}</span>
          </span>
        </div>
      )}
    </div>
  );
}
