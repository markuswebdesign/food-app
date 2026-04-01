-- ================================================
-- Migration: Makro-Ziele im Profil
-- Supports PROJ-4: Makro-Tracking
-- ================================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS protein_goal_g INTEGER,
ADD COLUMN IF NOT EXISTS fat_goal_g INTEGER,
ADD COLUMN IF NOT EXISTS carbs_goal_g INTEGER;
