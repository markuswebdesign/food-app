import { Flame, Egg, Droplets, Wheat } from "lucide-react";
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
  servings,
}: {
  nutrition: RecipeNutrition;
  servings: number;
}) {
  const s = servings || 1;

  const tiles = [
    nutrition.calories != null && {
      icon: <Flame className="h-5 w-5" />,
      value: `${Math.round(nutrition.calories / s)} kcal`,
      label: "Energie",
    },
    nutrition.protein_g != null && {
      icon: <Egg className="h-5 w-5" />,
      value: `${(nutrition.protein_g / s).toFixed(1)} g`,
      label: "Eiweiß",
    },
    nutrition.fat_g != null && {
      icon: <Droplets className="h-5 w-5" />,
      value: `${(nutrition.fat_g / s).toFixed(1)} g`,
      label: "Fett",
    },
    nutrition.carbohydrates_g != null && {
      icon: <Wheat className="h-5 w-5" />,
      value: `${(nutrition.carbohydrates_g / s).toFixed(1)} g`,
      label: "Kohlenhydrate",
    },
  ].filter(Boolean) as MacroTileProps[];

  if (tiles.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Nährwerte pro Portion</h2>
      <div className="flex flex-wrap gap-3">
        {tiles.map((tile) => (
          <MacroTile key={tile.label} {...tile} />
        ))}
      </div>
      {nutrition.fiber_g != null && (
        <p className="text-sm text-muted-foreground">
          Ballaststoffe: {(nutrition.fiber_g / s).toFixed(1)} g
        </p>
      )}
    </div>
  );
}
