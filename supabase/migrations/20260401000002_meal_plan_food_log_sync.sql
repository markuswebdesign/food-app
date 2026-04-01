-- ================================================
-- Migration: Meal Plan ↔ Food Log Sync
-- Adds food_log_entry_id to meal_plan_entries so
-- that adding/removing a meal plan entry automatically
-- syncs with the food log.
-- ================================================

ALTER TABLE meal_plan_entries
ADD COLUMN IF NOT EXISTS food_log_entry_id UUID REFERENCES food_log_entries(id) ON DELETE SET NULL;
