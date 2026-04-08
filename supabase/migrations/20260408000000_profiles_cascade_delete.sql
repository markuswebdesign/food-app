-- Fix: profiles.id foreign key now cascades on auth.users delete
-- Without this, deleting a user from auth.users fails with FK constraint error.

ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
