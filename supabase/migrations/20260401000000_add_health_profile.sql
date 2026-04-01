-- ================================================
-- Migration: Add health profile fields to profiles
-- Supports PROJ-1: Gesundheitsprofil + TDEE-Rechner
-- ================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS weight_kg       DECIMAL,
  ADD COLUMN IF NOT EXISTS height_cm       DECIMAL,
  ADD COLUMN IF NOT EXISTS age             INTEGER,
  ADD COLUMN IF NOT EXISTS activity_level  TEXT CHECK (activity_level IN (
                                             'sedentary',
                                             'lightly_active',
                                             'moderately_active',
                                             'very_active',
                                             'extra_active'
                                           )),
  ADD COLUMN IF NOT EXISTS goal_type       TEXT CHECK (goal_type IN ('lose', 'maintain')),
  ADD COLUMN IF NOT EXISTS custom_calorie_goal INTEGER;
