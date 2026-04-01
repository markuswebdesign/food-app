-- ================================================
-- Migration: food_log_entries
-- Supports PROJ-2: Mahlzeiten-Logbuch
-- ================================================

CREATE TABLE IF NOT EXISTS food_log_entries (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date        DATE NOT NULL,
  name        TEXT NOT NULL,
  calories    DECIMAL NOT NULL,
  protein_g   DECIMAL,
  fat_g       DECIMAL,
  carbs_g     DECIMAL,
  servings    DECIMAL NOT NULL DEFAULT 1,
  meal_time   TEXT CHECK (meal_time IN ('breakfast', 'lunch', 'dinner', 'snack')),
  recipe_id   UUID REFERENCES recipes(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE food_log_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own log entries"
  ON food_log_entries FOR ALL USING (auth.uid() = user_id);

-- Index für schnelle Tagesabfragen
CREATE INDEX idx_food_log_entries_user_date
  ON food_log_entries (user_id, date);
