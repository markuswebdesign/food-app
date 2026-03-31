-- ============================================================
-- Rezepte-App: Initial Schema
-- ============================================================

-- USER PROFILES (erweitert Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- KATEGORIEN
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('meal_time', 'diet')),
  -- meal_time: breakfast, lunch, dinner, snack
  -- diet: meat, vegetarian, vegan
  slug TEXT UNIQUE NOT NULL,
  icon TEXT
);

-- REZEPTE
CREATE TABLE recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT NOT NULL,
  servings INTEGER DEFAULT 2,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  image_url TEXT,
  source_url TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- REZEPT-KATEGORIEN (Many-to-Many)
CREATE TABLE recipe_categories (
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, category_id)
);

-- ZUTATEN
CREATE TABLE ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL,
  unit TEXT,
  calories_per_100g DECIMAL,
  protein_per_100g DECIMAL,
  fat_per_100g DECIMAL,
  carbs_per_100g DECIMAL,
  micronutrients JSONB DEFAULT '{}'
);

-- NÄHRWERTE PRO REZEPT (kalkuliert/gecacht)
CREATE TABLE recipe_nutrition (
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE PRIMARY KEY,
  calories DECIMAL,
  protein_g DECIMAL,
  fat_g DECIMAL,
  carbohydrates_g DECIMAL,
  fiber_g DECIMAL,
  micronutrients JSONB DEFAULT '{}',
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- WOCHENPLÄNE
CREATE TABLE meal_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- WOCHENPLAN EINTRÄGE
CREATE TABLE meal_plan_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 1 AND 7),
  meal_time TEXT CHECK (meal_time IN ('breakfast', 'lunch', 'dinner', 'snack')),
  servings INTEGER DEFAULT 1
);

-- EINKAUFSLISTEN
CREATE TABLE shopping_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EINKAUFSLISTEN EINTRÄGE
CREATE TABLE shopping_list_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shopping_list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE NOT NULL,
  ingredient_name TEXT NOT NULL,
  amount DECIMAL,
  unit TEXT,
  is_checked BOOLEAN DEFAULT FALSE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_nutrition ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Profiles: eigenes Profil lesen/bearbeiten
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Kategorien: alle können lesen
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT USING (true);

-- Rezepte: öffentliche für alle lesbar
CREATE POLICY "Public recipes are viewable by everyone"
  ON recipes FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Users can manage own recipes"
  ON recipes FOR ALL USING (auth.uid() = user_id);

-- Admins: voller Zugriff auf Rezepte
CREATE POLICY "Admins have full access to recipes"
  ON recipes FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins: voller Zugriff auf Profile
CREATE POLICY "Admins have full access to profiles"
  ON profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Zutaten: über Rezept-Zugang
CREATE POLICY "Ingredients viewable with recipe"
  ON ingredients FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = ingredients.recipe_id
      AND (recipes.is_public = TRUE OR recipes.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage ingredients of own recipes"
  ON ingredients FOR ALL USING (
    EXISTS (SELECT 1 FROM recipes WHERE id = recipe_id AND user_id = auth.uid())
  );

-- Nährwerte: wie Zutaten
CREATE POLICY "Recipe nutrition viewable with recipe"
  ON recipe_nutrition FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_nutrition.recipe_id
      AND (recipes.is_public = TRUE OR recipes.user_id = auth.uid())
    )
  );

-- Wochenpläne: nur eigene
CREATE POLICY "Users can manage own meal plans"
  ON meal_plans FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own meal plan entries"
  ON meal_plan_entries FOR ALL USING (
    EXISTS (SELECT 1 FROM meal_plans WHERE id = meal_plan_id AND user_id = auth.uid())
  );

-- Einkaufslisten: nur eigene
CREATE POLICY "Users can manage own shopping lists"
  ON shopping_lists FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own shopping list items"
  ON shopping_list_items FOR ALL USING (
    EXISTS (SELECT 1 FROM shopping_lists WHERE id = shopping_list_id AND user_id = auth.uid())
  );

-- ============================================================
-- TRIGGER: Profil bei Registrierung anlegen
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- TRIGGER: updated_at bei Rezept-Update
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- SEED: Standardkategorien
-- ============================================================

INSERT INTO categories (name, type, slug, icon) VALUES
  ('Frühstück',  'meal_time', 'breakfast', '🍳'),
  ('Mittagessen', 'meal_time', 'lunch',     '🥗'),
  ('Abendessen',  'meal_time', 'dinner',    '🍽️'),
  ('Snack',       'meal_time', 'snack',     '🍎'),
  ('Fleisch',     'diet',      'meat',      '🥩'),
  ('Vegetarisch', 'diet',      'vegetarian','🥦'),
  ('Vegan',       'diet',      'vegan',     '🌱');
