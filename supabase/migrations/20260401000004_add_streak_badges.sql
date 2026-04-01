-- ================================================
-- Migration: Streak & Badges
-- Supports PROJ-5: Streak & Motivation
-- ================================================

-- Add longest streak tracking to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS longest_streak_days INTEGER NOT NULL DEFAULT 0;

-- Badges table: one row per earned badge per user
CREATE TABLE IF NOT EXISTS profile_badges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type  TEXT NOT NULL CHECK (badge_type IN ('streak_7', 'streak_14', 'streak_30')),
  earned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, badge_type)
);

ALTER TABLE profile_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges"
  ON profile_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
  ON profile_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_profile_badges_user_id ON profile_badges(user_id);
