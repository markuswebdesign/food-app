-- Schreibrecht für recipe_nutrition für Rezept-Besitzer
CREATE POLICY "Users can manage nutrition of own recipes"
  ON recipe_nutrition FOR ALL
  USING (
    EXISTS (SELECT 1 FROM recipes WHERE id = recipe_id AND user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM recipes WHERE id = recipe_id AND user_id = auth.uid())
  );
