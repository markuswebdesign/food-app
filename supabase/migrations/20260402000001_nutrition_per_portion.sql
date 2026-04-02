-- PROJ-11 Bugfix: Nährwerte pro Portion statt Gesamt speichern
-- Bestehende Daten: calories/protein/etc. waren Gesamtwerte → durch servings teilen

UPDATE recipe_nutrition rn
SET
  calories         = ROUND((rn.calories         / NULLIF(r.servings, 0))::numeric, 2),
  protein_g        = ROUND((rn.protein_g        / NULLIF(r.servings, 0))::numeric, 2),
  fat_g            = ROUND((rn.fat_g            / NULLIF(r.servings, 0))::numeric, 2),
  carbohydrates_g  = ROUND((rn.carbohydrates_g  / NULLIF(r.servings, 0))::numeric, 2),
  fiber_g          = ROUND((rn.fiber_g          / NULLIF(r.servings, 0))::numeric, 2)
FROM recipes r
WHERE rn.recipe_id = r.id
  AND r.servings > 1;
