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
  {
    aliases: ["erdnüsse", "erdnuss"],
    calories_per_100g: 567, protein_per_100g: 26, fat_per_100g: 49, carbs_per_100g: 16, fiber_per_100g: 9,
  },
  {
    aliases: ["cashews", "cashewkerne"],
    calories_per_100g: 553, protein_per_100g: 18, fat_per_100g: 44, carbs_per_100g: 30, fiber_per_100g: 3,
  },
  {
    aliases: ["erdnussbutter", "peanutbutter", "peanut butter"],
    calories_per_100g: 588, protein_per_100g: 25, fat_per_100g: 50, carbs_per_100g: 20, fiber_per_100g: 6,
  },

  // ── Obst ──────────────────────────────────────────────────────────
  {
    aliases: ["apfel", "äpfel"],
    calories_per_100g: 52, protein_per_100g: 0.3, fat_per_100g: 0.2, carbs_per_100g: 14, fiber_per_100g: 2,
  },
  {
    aliases: ["banane", "bananen"],
    calories_per_100g: 89, protein_per_100g: 1.1, fat_per_100g: 0.3, carbs_per_100g: 23, fiber_per_100g: 3,
  },
  {
    aliases: ["birne", "birnen"],
    calories_per_100g: 57, protein_per_100g: 0.4, fat_per_100g: 0.1, carbs_per_100g: 15, fiber_per_100g: 3,
  },
  {
    aliases: ["orange", "orangen", "mandarine", "mandarinen"],
    calories_per_100g: 47, protein_per_100g: 0.9, fat_per_100g: 0.1, carbs_per_100g: 12, fiber_per_100g: 2,
  },
  {
    aliases: ["erdbeere", "erdbeeren"],
    calories_per_100g: 32, protein_per_100g: 0.7, fat_per_100g: 0.3, carbs_per_100g: 8, fiber_per_100g: 2,
  },
  {
    aliases: ["weintrauben", "weintraube", "trauben", "traube"],
    calories_per_100g: 69, protein_per_100g: 0.7, fat_per_100g: 0.2, carbs_per_100g: 18, fiber_per_100g: 1,
  },
  {
    aliases: ["mango", "mangos"],
    calories_per_100g: 60, protein_per_100g: 0.8, fat_per_100g: 0.4, carbs_per_100g: 15, fiber_per_100g: 2,
  },
  {
    aliases: ["ananas"],
    calories_per_100g: 50, protein_per_100g: 0.5, fat_per_100g: 0.1, carbs_per_100g: 13, fiber_per_100g: 1,
  },
  {
    aliases: ["kiwi", "kiwis"],
    calories_per_100g: 61, protein_per_100g: 1.1, fat_per_100g: 0.5, carbs_per_100g: 15, fiber_per_100g: 3,
  },
  {
    aliases: ["zitrone", "zitronen"],
    calories_per_100g: 29, protein_per_100g: 1.1, fat_per_100g: 0.3, carbs_per_100g: 9, fiber_per_100g: 3,
  },
  {
    aliases: ["blaubeeren", "heidelbeeren"],
    calories_per_100g: 57, protein_per_100g: 0.7, fat_per_100g: 0.3, carbs_per_100g: 14, fiber_per_100g: 2,
  },
  {
    aliases: ["himbeeren"],
    calories_per_100g: 52, protein_per_100g: 1.2, fat_per_100g: 0.7, carbs_per_100g: 12, fiber_per_100g: 7,
  },
  {
    aliases: ["wassermelone", "melone"],
    calories_per_100g: 30, protein_per_100g: 0.6, fat_per_100g: 0.2, carbs_per_100g: 8, fiber_per_100g: 0.4,
  },
  {
    aliases: ["avocado", "avocados"],
    calories_per_100g: 160, protein_per_100g: 2, fat_per_100g: 15, carbs_per_100g: 9, fiber_per_100g: 7,
  },

  // ── Süßes & Snacks ────────────────────────────────────────────────
  {
    aliases: ["schokolade", "vollmilchschokolade", "zartbitterschokolade", "schokolade 70%"],
    calories_per_100g: 535, protein_per_100g: 7, fat_per_100g: 31, carbs_per_100g: 59, fiber_per_100g: 3,
  },
  {
    aliases: ["snickers"],
    calories_per_100g: 488, protein_per_100g: 4.9, fat_per_100g: 24, carbs_per_100g: 62, fiber_per_100g: 1,
  },
  {
    aliases: ["twix"],
    calories_per_100g: 495, protein_per_100g: 4.5, fat_per_100g: 23, carbs_per_100g: 66, fiber_per_100g: 1,
  },
  {
    aliases: ["kitkat", "kit kat"],
    calories_per_100g: 513, protein_per_100g: 6.5, fat_per_100g: 26, carbs_per_100g: 63, fiber_per_100g: 1,
  },
  {
    aliases: ["keks", "kekse", "butterkeks", "butterkekse"],
    calories_per_100g: 458, protein_per_100g: 7, fat_per_100g: 18, carbs_per_100g: 67, fiber_per_100g: 2,
  },
  {
    aliases: ["chips", "kartoffelchips"],
    calories_per_100g: 536, protein_per_100g: 7, fat_per_100g: 35, carbs_per_100g: 50, fiber_per_100g: 4,
  },
  {
    aliases: ["popcorn"],
    calories_per_100g: 387, protein_per_100g: 13, fat_per_100g: 5, carbs_per_100g: 78, fiber_per_100g: 15,
  },
  {
    aliases: ["gummibärchen", "haribo"],
    calories_per_100g: 343, protein_per_100g: 6.9, fat_per_100g: 0.5, carbs_per_100g: 77, fiber_per_100g: 0,
  },
  {
    aliases: ["croissant", "croissants"],
    calories_per_100g: 406, protein_per_100g: 8, fat_per_100g: 21, carbs_per_100g: 48, fiber_per_100g: 2,
  },
  {
    aliases: ["nutella", "nuss-nougat-creme"],
    calories_per_100g: 539, protein_per_100g: 6.3, fat_per_100g: 31, carbs_per_100g: 58, fiber_per_100g: 3,
  },
  {
    aliases: ["müsliriegel", "energieriegel", "getreideriegel"],
    calories_per_100g: 380, protein_per_100g: 6, fat_per_100g: 8, carbs_per_100g: 70, fiber_per_100g: 4,
  },

  // ── Proteinprodukte ───────────────────────────────────────────────
  {
    aliases: ["proteinshake", "protein shake", "eiweißshake", "whey shake"],
    calories_per_100g: 98, protein_per_100g: 20, fat_per_100g: 2, carbs_per_100g: 3, fiber_per_100g: 0,
  },
  {
    aliases: ["whey protein", "whey", "proteinpulver", "eiweißpulver"],
    calories_per_100g: 380, protein_per_100g: 80, fat_per_100g: 4, carbs_per_100g: 8, fiber_per_100g: 0,
  },
  {
    aliases: ["proteinriegel", "protein riegel", "eiweißriegel"],
    calories_per_100g: 350, protein_per_100g: 33, fat_per_100g: 9, carbs_per_100g: 37, fiber_per_100g: 3,
  },

  // ── Getränke ──────────────────────────────────────────────────────
  {
    aliases: ["orangensaft", "oj"],
    calories_per_100g: 45, protein_per_100g: 0.7, fat_per_100g: 0.2, carbs_per_100g: 10, fiber_per_100g: 0.2,
  },
  {
    aliases: ["apfelsaft"],
    calories_per_100g: 46, protein_per_100g: 0.1, fat_per_100g: 0.1, carbs_per_100g: 11, fiber_per_100g: 0.2,
  },
  {
    aliases: ["cola", "coca-cola", "pepsi"],
    calories_per_100g: 42, protein_per_100g: 0, fat_per_100g: 0, carbs_per_100g: 11, fiber_per_100g: 0,
  },
  {
    aliases: ["bier", "pils", "helles"],
    calories_per_100g: 43, protein_per_100g: 0.5, fat_per_100g: 0, carbs_per_100g: 3.5, fiber_per_100g: 0,
  },
  {
    aliases: ["kaffee", "schwarzer kaffee", "espresso"],
    calories_per_100g: 2, protein_per_100g: 0.3, fat_per_100g: 0, carbs_per_100g: 0, fiber_per_100g: 0,
  },
  {
    aliases: ["milchkaffee", "latte macchiato", "cappuccino"],
    calories_per_100g: 40, protein_per_100g: 2, fat_per_100g: 1.5, carbs_per_100g: 5, fiber_per_100g: 0,
  },

  // ── Fertigprodukte & Fast Food ────────────────────────────────────
  {
    aliases: ["pizza", "tiefkühlpizza", "pizza margherita"],
    calories_per_100g: 266, protein_per_100g: 11, fat_per_100g: 11, carbs_per_100g: 33, fiber_per_100g: 2,
  },
  {
    aliases: ["burger", "hamburger", "cheeseburger"],
    calories_per_100g: 254, protein_per_100g: 14, fat_per_100g: 11, carbs_per_100g: 25, fiber_per_100g: 1,
  },
  {
    aliases: ["pommes", "pommes frites", "fritten"],
    calories_per_100g: 312, protein_per_100g: 3.4, fat_per_100g: 15, carbs_per_100g: 41, fiber_per_100g: 3,
  },
  {
    aliases: ["döner", "döner kebab"],
    calories_per_100g: 235, protein_per_100g: 16, fat_per_100g: 12, carbs_per_100g: 17, fiber_per_100g: 1,
  },
];

// ─── PROJ-9: Kategorie-Lookup ─────────────────────────────────────────────────

export type IngredientCategory =
  | "Gemüse & Obst"
  | "Fleisch & Fisch"
  | "Milchprodukte & Eier"
  | "Brot & Backwaren"
  | "Tiefkühl"
  | "Gewürze & Öle"
  | "Konserven & Trockenware"
  | "Getränke"
  | "Sonstiges";

export const CATEGORY_ORDER: IngredientCategory[] = [
  "Gemüse & Obst",
  "Fleisch & Fisch",
  "Milchprodukte & Eier",
  "Brot & Backwaren",
  "Tiefkühl",
  "Gewürze & Öle",
  "Konserven & Trockenware",
  "Getränke",
  "Sonstiges",
];

type CategoryEntry = {
  category: IngredientCategory;
  keywords: string[];
};

const CATEGORY_ENTRIES: CategoryEntry[] = [
  {
    category: "Gemüse & Obst",
    keywords: [
      "karotte", "karotten", "möhre", "möhren", "gelbe rübe",
      "kartoffel", "kartoffeln", "süßkartoffel", "süßkartoffeln",
      "tomate", "tomaten",
      "paprika", "paprikaschote",
      "zucchini", "spinat", "blattspinat", "brokkoli", "broccoli",
      "champignon", "champignons", "pilze",
      "lauch", "porree", "sellerie", "staudensellerie", "knollensellerie",
      "erbsen", "mais", "maiskörner", "zuckermais",
      "zwiebel", "zwiebeln", "gemüsezwiebel", "frühlingszwiebel",
      "knoblauch", "knoblauchzehe", "knoblauchzehen",
      "apfel", "äpfel", "banane", "bananen", "zitrone", "zitronen",
      "orange", "orangen", "mandarine", "mandarinen",
      "gurke", "gurken", "salat", "blattsalat", "feldsalat", "rucola",
      "kohl", "rotkohl", "weißkohl", "blumenkohl", "rosenkohl",
      "spargel", "rote bete", "fenchel", "aubergine", "avocado",
      "ingwer", "pak choi", "steckrübe", "pastinake",
    ],
  },
  {
    category: "Fleisch & Fisch",
    keywords: [
      "hähnchenbrust", "hühnerbrust", "hähnchen", "hühnchen", "chicken",
      "hackfleisch", "gemischtes hackfleisch", "rinderhackfleisch", "hack",
      "rindfleisch", "rind", "rindersteak", "rinderhüfte",
      "schweinefleisch", "schwein", "schweinefilet", "schweineschnitzel",
      "lachs", "lachsfilet", "thunfisch",
      "wurst", "bratwurst", "leberwurst", "salami", "aufschnitt",
      "speck", "bacon", "schinken",
      "pute", "putenfleisch", "putenbrust",
      "lammfleisch", "lamm", "lammhack",
      "garnelen", "shrimps", "forelle", "kabeljau", "pangasius",
    ],
  },
  {
    category: "Milchprodukte & Eier",
    keywords: [
      "butter",
      "milch", "vollmilch", "kuhmilch", "h-milch",
      "sahne", "schlagsahne", "crème fraîche", "creme fraiche", "schmand",
      "joghurt", "naturjoghurt", "griechischer joghurt",
      "magerquark", "quark", "topfen",
      "gouda", "käse", "schnittkäse", "parmesan", "parmigiano",
      "mozzarella", "frischkäse", "camembert", "brie", "ricotta", "feta",
      "ei", "eier", "hühnerei", "hühnereier",
      "kondensmilch",
    ],
  },
  {
    category: "Brot & Backwaren",
    keywords: [
      "brot", "weißbrot", "toastbrot", "toast",
      "vollkornbrot", "schwarzbrot", "roggenbrot",
      "brötchen", "semmel", "laugenbrezel", "bagel", "ciabatta",
      "mehl", "weizenmehl", "vollkornmehl", "dinkelmehl",
      "paniermehl", "semmelbrösel",
      "haferflocken", "hafer",
      "backpulver", "hefe", "natron",
    ],
  },
  {
    category: "Tiefkühl",
    keywords: [
      "tiefkühlgemüse", "tiefkühlerbsen", "tiefkühlspinat",
      "tiefkühlpizza", "tiefkühlfisch", "tiefkühlbrot", "tiefkühl",
    ],
  },
  {
    category: "Gewürze & Öle",
    keywords: [
      "salz", "meersalz", "kochsalz",
      "pfeffer", "schwarzer pfeffer", "weißer pfeffer",
      "olivenöl", "sonnenblumenöl", "pflanzenöl", "öl", "rapsöl", "neutrales öl",
      "essig", "weißweinessig", "apfelessig", "balsamico", "rotweinessig",
      "senf", "mittelscharfer senf", "dijonsenf",
      "paprikapulver", "kümmel", "kreuzkümmel",
      "oregano", "thymian", "rosmarin", "basilikum", "petersilie", "schnittlauch",
      "lorbeer", "lorbeerblatt", "zimt", "curry", "currypulver",
      "kurkuma", "chili", "chilipulver", "muskat", "muskatnuss",
      "zucker", "haushaltszucker", "brauner zucker", "rohrzucker",
      "honig", "ahornsirup",
      "vanille", "vanillezucker", "vanilleextrakt",
    ],
  },
  {
    category: "Konserven & Trockenware",
    keywords: [
      "nudeln", "pasta", "spaghetti", "penne", "fusilli", "tagliatelle", "makkaroni",
      "reis", "weißer reis", "langkornreis", "basmati", "jasminreis",
      "tomaten dose", "dosentomaten", "gehackte tomaten", "passierte tomaten",
      "tomatenmark", "tomatenpüree",
      "linsen", "rote linsen", "grüne linsen", "beluga linsen",
      "kichererbsen", "kidneybohnen", "bohnen", "weiße bohnen",
      "kokosmilch", "sojasoße", "sojasauce",
      "brühe", "gemüsebrühe", "hühnerbrühe", "rinderbrühe",
      "walnüsse", "walnuss", "mandeln", "cashews", "erdnüsse",
      "mais dose",
    ],
  },
  {
    category: "Getränke",
    keywords: [
      "wasser", "mineralwasser", "sprudel",
      "saft", "orangensaft", "apfelsaft", "multivitaminsaft",
      "wein", "rotwein", "weißwein", "prosecco",
      "bier",
    ],
  },
];

/**
 * PROJ-9: Bestimmt die Supermarkt-Kategorie eines Zutatennamens.
 * Gleiche Matching-Strategie wie lookupLocalIngredient (Wort-Grenzen, kein Substring).
 * Gibt "Sonstiges" zurück wenn kein Match gefunden.
 */
export function lookupCategory(query: string): IngredientCategory {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return "Sonstiges";

  const queryWords = normalized.split(/\s+/);

  for (const entry of CATEGORY_ENTRIES) {
    for (const keyword of entry.keywords) {
      if (normalized === keyword) return entry.category;

      const keywordWords = keyword.split(/\s+/);
      // All query words appear in keyword (e.g. "Pfeffer" matches "Schwarzer Pfeffer")
      const queryInKeyword = queryWords.every((w) => keywordWords.includes(w));
      // All keyword words appear in query — only when keyword is as long as query,
      // preventing single-word keywords from matching multi-word queries.
      const keywordInQuery =
        keywordWords.length >= queryWords.length &&
        keywordWords.every((w) => queryWords.includes(w));

      if (queryInKeyword || keywordInQuery) return entry.category;
    }
  }

  return "Sonstiges";
}

// ─── PROJ-11: Nährwert-Lookup ─────────────────────────────────────────────────

/**
 * Sucht Nährwerte in der lokalen Tabelle.
 * Gibt null zurück wenn kein Match gefunden.
 *
 * Matching-Strategie (von eng zu weit):
 * 1. Exakter Match: "mehl" === "mehl"
 * 2. Wort-Match: Alle Wörter der Anfrage sind Wörter des Alias (oder umgekehrt)
 *    z.B. "Knoblauchzehe" → query-Wort "knoblauchzehe" ist im Alias "knoblauchzehe" ✓
 *    Verhindert "öl" in "trüffelöl" als Substring-Match.
 */
export function lookupLocalIngredient(query: string): NutritionPer100g | null {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return null;

  const queryWords = normalized.split(/\s+/);

  for (const ingredient of LOCAL_INGREDIENTS) {
    for (const alias of ingredient.aliases) {
      if (normalized === alias) {
        const { aliases: _, ...nutrition } = ingredient;
        return nutrition;
      }

      const aliasWords = alias.split(/\s+/);
      const queryWordsInAlias = queryWords.every((w) => aliasWords.includes(w));
      const aliasWordsInQuery = aliasWords.every((w) => queryWords.includes(w));

      if (queryWordsInAlias || aliasWordsInQuery) {
        const { aliases: _, ...nutrition } = ingredient;
        return nutrition;
      }
    }
  }

  return null;
}
