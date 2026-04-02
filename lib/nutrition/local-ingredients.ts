/**
 * PROJ-11: Lokale Nährwert-Tabelle für häufige deutsche Grundzutaten.
 * Werte pro 100g, Quelle: USDA FoodData Central + BLS (Bundeslebensmittelschlüssel).
 */

export type NutritionPer100g = {
  calories_per_100g: number;
  protein_per_100g: number;
  fat_per_100g: number;
  carbs_per_100g: number;
  fiber_per_100g: number;
};

type LocalIngredient = NutritionPer100g & {
  aliases: string[]; // deutsch, lowercase
};

const LOCAL_INGREDIENTS: LocalIngredient[] = [
  // ── Mehl & Getreide ──────────────────────────────────────────────
  {
    aliases: ["mehl", "weizenmehl", "weizenmehl type 405", "weizenmehl type 550", "weißmehl"],
    calories_per_100g: 340, protein_per_100g: 10, fat_per_100g: 1, carbs_per_100g: 71, fiber_per_100g: 3,
  },
  {
    aliases: ["vollkornmehl", "vollkornweizenmehl", "dinkelmehl"],
    calories_per_100g: 325, protein_per_100g: 12, fat_per_100g: 2, carbs_per_100g: 63, fiber_per_100g: 9,
  },
  {
    aliases: ["reis", "weißer reis", "langkornreis", "basmati", "jasminreis"],
    calories_per_100g: 360, protein_per_100g: 7, fat_per_100g: 1, carbs_per_100g: 78, fiber_per_100g: 1,
  },
  {
    aliases: ["nudeln", "pasta", "spaghetti", "penne", "fusilli", "tagliatelle", "makkaroni"],
    calories_per_100g: 352, protein_per_100g: 12, fat_per_100g: 2, carbs_per_100g: 71, fiber_per_100g: 3,
  },
  {
    aliases: ["haferflocken", "hafer", "oats", "müsli"],
    calories_per_100g: 366, protein_per_100g: 13, fat_per_100g: 7, carbs_per_100g: 59, fiber_per_100g: 10,
  },
  {
    aliases: ["brot", "weißbrot", "toastbrot", "toast"],
    calories_per_100g: 265, protein_per_100g: 8, fat_per_100g: 3, carbs_per_100g: 50, fiber_per_100g: 3,
  },
  {
    aliases: ["vollkornbrot", "schwarzbrot", "roggenbrot"],
    calories_per_100g: 247, protein_per_100g: 9, fat_per_100g: 3, carbs_per_100g: 45, fiber_per_100g: 7,
  },
  {
    aliases: ["paniermehl", "semmelbrösel", "breadcrumbs"],
    calories_per_100g: 395, protein_per_100g: 11, fat_per_100g: 4, carbs_per_100g: 79, fiber_per_100g: 3,
  },

  // ── Milchprodukte ─────────────────────────────────────────────────
  {
    aliases: ["butter"],
    calories_per_100g: 741, protein_per_100g: 1, fat_per_100g: 82, carbs_per_100g: 1, fiber_per_100g: 0,
  },
  {
    aliases: ["milch", "vollmilch", "kuhmilch", "h-milch"],
    calories_per_100g: 64, protein_per_100g: 3, fat_per_100g: 4, carbs_per_100g: 5, fiber_per_100g: 0,
  },
  {
    aliases: ["sahne", "schlagsahne", "schlagsahne 30%", "sahne 30%", "cream"],
    calories_per_100g: 292, protein_per_100g: 2, fat_per_100g: 30, carbs_per_100g: 4, fiber_per_100g: 0,
  },
  {
    aliases: ["crème fraîche", "creme fraiche", "schmand"],
    calories_per_100g: 247, protein_per_100g: 3, fat_per_100g: 24, carbs_per_100g: 4, fiber_per_100g: 0,
  },
  {
    aliases: ["joghurt", "naturjoghurt", "griechischer joghurt", "joghurt 3.5%"],
    calories_per_100g: 62, protein_per_100g: 4, fat_per_100g: 4, carbs_per_100g: 5, fiber_per_100g: 0,
  },
  {
    aliases: ["magerquark", "quark", "topfen"],
    calories_per_100g: 67, protein_per_100g: 12, fat_per_100g: 0, carbs_per_100g: 4, fiber_per_100g: 0,
  },
  {
    aliases: ["gouda", "käse", "schnittkäse"],
    calories_per_100g: 356, protein_per_100g: 25, fat_per_100g: 27, carbs_per_100g: 2, fiber_per_100g: 0,
  },
  {
    aliases: ["parmesan", "parmigiano"],
    calories_per_100g: 431, protein_per_100g: 38, fat_per_100g: 29, carbs_per_100g: 3, fiber_per_100g: 0,
  },
  {
    aliases: ["mozzarella"],
    calories_per_100g: 280, protein_per_100g: 18, fat_per_100g: 22, carbs_per_100g: 2, fiber_per_100g: 0,
  },
  {
    aliases: ["ei", "eier", "hühnerei", "hühnereier"],
    calories_per_100g: 155, protein_per_100g: 13, fat_per_100g: 11, carbs_per_100g: 1, fiber_per_100g: 0,
  },

  // ── Öle & Fette ───────────────────────────────────────────────────
  {
    aliases: ["olivenöl", "olive oil"],
    calories_per_100g: 884, protein_per_100g: 0, fat_per_100g: 100, carbs_per_100g: 0, fiber_per_100g: 0,
  },
  {
    aliases: ["sonnenblumenöl", "pflanzenöl", "öl", "rapsöl", "neutrales öl"],
    calories_per_100g: 884, protein_per_100g: 0, fat_per_100g: 100, carbs_per_100g: 0, fiber_per_100g: 0,
  },

  // ── Gemüse ────────────────────────────────────────────────────────
  {
    aliases: ["zwiebel", "zwiebeln", "gemüsezwiebel"],
    calories_per_100g: 40, protein_per_100g: 1, fat_per_100g: 0, carbs_per_100g: 9, fiber_per_100g: 2,
  },
  {
    aliases: ["knoblauch", "knoblauchzehe", "knoblauchzehen"],
    calories_per_100g: 149, protein_per_100g: 6, fat_per_100g: 1, carbs_per_100g: 33, fiber_per_100g: 2,
  },
  {
    aliases: ["karotte", "karotten", "möhre", "möhren", "gelbe rübe"],
    calories_per_100g: 41, protein_per_100g: 1, fat_per_100g: 0, carbs_per_100g: 10, fiber_per_100g: 3,
  },
  {
    aliases: ["kartoffel", "kartoffeln"],
    calories_per_100g: 86, protein_per_100g: 2, fat_per_100g: 0, carbs_per_100g: 20, fiber_per_100g: 2,
  },
  {
    aliases: ["tomate", "tomaten"],
    calories_per_100g: 18, protein_per_100g: 1, fat_per_100g: 0, carbs_per_100g: 4, fiber_per_100g: 1,
  },
  {
    aliases: ["paprika", "paprikaschote", "rote paprika", "gelbe paprika", "grüne paprika"],
    calories_per_100g: 31, protein_per_100g: 1, fat_per_100g: 0, carbs_per_100g: 6, fiber_per_100g: 2,
  },
  {
    aliases: ["zucchini"],
    calories_per_100g: 17, protein_per_100g: 1, fat_per_100g: 0, carbs_per_100g: 3, fiber_per_100g: 1,
  },
  {
    aliases: ["spinat", "blattspinat"],
    calories_per_100g: 23, protein_per_100g: 3, fat_per_100g: 0, carbs_per_100g: 4, fiber_per_100g: 2,
  },
  {
    aliases: ["brokkoli", "broccoli"],
    calories_per_100g: 34, protein_per_100g: 3, fat_per_100g: 0, carbs_per_100g: 7, fiber_per_100g: 3,
  },
  {
    aliases: ["champignon", "champignons", "pilze"],
    calories_per_100g: 22, protein_per_100g: 3, fat_per_100g: 0, carbs_per_100g: 3, fiber_per_100g: 1,
  },
  {
    aliases: ["lauch", "porree", "lauchstange"],
    calories_per_100g: 31, protein_per_100g: 2, fat_per_100g: 0, carbs_per_100g: 7, fiber_per_100g: 2,
  },
  {
    aliases: ["sellerie", "staudensellerie", "knollensellerie"],
    calories_per_100g: 16, protein_per_100g: 1, fat_per_100g: 0, carbs_per_100g: 4, fiber_per_100g: 2,
  },
  {
    aliases: ["erbsen", "tiefkühlerbsen"],
    calories_per_100g: 81, protein_per_100g: 5, fat_per_100g: 0, carbs_per_100g: 14, fiber_per_100g: 5,
  },
  {
    aliases: ["mais", "maiskörner", "zuckermais"],
    calories_per_100g: 86, protein_per_100g: 3, fat_per_100g: 1, carbs_per_100g: 19, fiber_per_100g: 2,
  },

  // ── Fleisch & Fisch ───────────────────────────────────────────────
  {
    aliases: ["hähnchenbrust", "hühnerbrust", "hähnchen", "hühnchen", "chicken"],
    calories_per_100g: 105, protein_per_100g: 23, fat_per_100g: 1, carbs_per_100g: 0, fiber_per_100g: 0,
  },
  {
    aliases: ["hackfleisch", "gemischtes hackfleisch", "rinderhackfleisch", "hack"],
    calories_per_100g: 207, protein_per_100g: 17, fat_per_100g: 15, carbs_per_100g: 0, fiber_per_100g: 0,
  },
  {
    aliases: ["rindfleisch", "rind", "rindersteak", "rinderhüfte"],
    calories_per_100g: 189, protein_per_100g: 21, fat_per_100g: 11, carbs_per_100g: 0, fiber_per_100g: 0,
  },
  {
    aliases: ["schweinefleisch", "schwein", "schweinefilet", "schweineschnitzel"],
    calories_per_100g: 180, protein_per_100g: 20, fat_per_100g: 11, carbs_per_100g: 0, fiber_per_100g: 0,
  },
  {
    aliases: ["lachs", "lachsfilet", "lachs filet"],
    calories_per_100g: 208, protein_per_100g: 20, fat_per_100g: 13, carbs_per_100g: 0, fiber_per_100g: 0,
  },
  {
    aliases: ["thunfisch", "thunfisch dose", "thunfisch in wasser"],
    calories_per_100g: 116, protein_per_100g: 26, fat_per_100g: 1, carbs_per_100g: 0, fiber_per_100g: 0,
  },

  // ── Hülsenfrüchte ─────────────────────────────────────────────────
  {
    aliases: ["linsen", "rote linsen", "grüne linsen", "beluga linsen"],
    calories_per_100g: 352, protein_per_100g: 25, fat_per_100g: 1, carbs_per_100g: 60, fiber_per_100g: 11,
  },
  {
    aliases: ["kichererbsen", "kichererbsen dose"],
    calories_per_100g: 119, protein_per_100g: 8, fat_per_100g: 3, carbs_per_100g: 18, fiber_per_100g: 5,
  },
  {
    aliases: ["bohnen", "weiße bohnen", "kidney bohnen", "kidneybohnen"],
    calories_per_100g: 127, protein_per_100g: 9, fat_per_100g: 1, carbs_per_100g: 23, fiber_per_100g: 7,
  },

  // ── Süßungsmittel ─────────────────────────────────────────────────
  {
    aliases: ["zucker", "weißer zucker", "haushaltszucker"],
    calories_per_100g: 387, protein_per_100g: 0, fat_per_100g: 0, carbs_per_100g: 100, fiber_per_100g: 0,
  },
  {
    aliases: ["honig"],
    calories_per_100g: 304, protein_per_100g: 0, fat_per_100g: 0, carbs_per_100g: 82, fiber_per_100g: 0,
  },
  {
    aliases: ["brauner zucker", "rohrzucker"],
    calories_per_100g: 380, protein_per_100g: 0, fat_per_100g: 0, carbs_per_100g: 98, fiber_per_100g: 0,
  },

  // ── Gewürze & Sonstiges ───────────────────────────────────────────
  {
    aliases: ["salz", "meersalz", "kochsalz"],
    calories_per_100g: 0, protein_per_100g: 0, fat_per_100g: 0, carbs_per_100g: 0, fiber_per_100g: 0,
  },
  {
    aliases: ["senf", "mittelscharfer senf", "dijonsenf"],
    calories_per_100g: 66, protein_per_100g: 4, fat_per_100g: 3, carbs_per_100g: 6, fiber_per_100g: 3,
  },
  {
    aliases: ["tomatenmark", "tomatenpüree"],
    calories_per_100g: 82, protein_per_100g: 4, fat_per_100g: 0, carbs_per_100g: 17, fiber_per_100g: 4,
  },
  {
    aliases: ["tomaten dose", "dosentomaten", "gehackte tomaten", "passierte tomaten"],
    calories_per_100g: 24, protein_per_100g: 1, fat_per_100g: 0, carbs_per_100g: 5, fiber_per_100g: 1,
  },
  {
    aliases: ["kokosmilch"],
    calories_per_100g: 197, protein_per_100g: 2, fat_per_100g: 21, carbs_per_100g: 3, fiber_per_100g: 0,
  },
  {
    aliases: ["sojasoße", "sojasauce"],
    calories_per_100g: 53, protein_per_100g: 8, fat_per_100g: 0, carbs_per_100g: 5, fiber_per_100g: 0,
  },

  // ── Nüsse & Samen ─────────────────────────────────────────────────
  {
    aliases: ["walnüsse", "walnuss"],
    calories_per_100g: 654, protein_per_100g: 15, fat_per_100g: 65, carbs_per_100g: 14, fiber_per_100g: 7,
  },
  {
    aliases: ["mandeln"],
    calories_per_100g: 579, protein_per_100g: 21, fat_per_100g: 50, carbs_per_100g: 22, fiber_per_100g: 13,
  },
];

/**
 * Sucht Nährwerte in der lokalen Tabelle.
 * Gibt null zurück wenn kein Match gefunden.
 */
export function lookupLocalIngredient(query: string): NutritionPer100g | null {
  const normalized = query.toLowerCase().trim();

  for (const ingredient of LOCAL_INGREDIENTS) {
    for (const alias of ingredient.aliases) {
      if (normalized === alias || normalized.includes(alias) || alias.includes(normalized)) {
        const { aliases: _, ...nutrition } = ingredient;
        return nutrition;
      }
    }
  }

  return null;
}
