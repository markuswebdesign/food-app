-- Allow recipients of shared recipes to read the shared recipe content
-- This fixes BUG-22-01: private recipes shared via shared_recipes were inaccessible to recipients
CREATE POLICY "Shared recipe recipients can view the recipe"
ON recipes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM shared_recipes
    WHERE shared_recipes.recipe_id = recipes.id
      AND shared_recipes.recipient_id = auth.uid()
      AND shared_recipes.status != 'dismissed'
  )
);
