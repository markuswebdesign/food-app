-- PROJ-11: Genaue Nährwert-Berechnung
-- Add nutrition_source and unknown_ingredients to recipe_nutrition

ALTER TABLE recipe_nutrition
  ADD COLUMN IF NOT EXISTS nutrition_source TEXT CHECK (nutrition_source IN ('calculated', 'manual')) DEFAULT 'calculated',
  ADD COLUMN IF NOT EXISTS unknown_ingredients TEXT[] DEFAULT '{}';
