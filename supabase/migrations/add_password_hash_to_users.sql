-- Migration: add password_hash column to public.users
-- Run this in the Supabase SQL Editor or via the Supabase CLI.
--
-- The column is nullable so that:
--   1. Existing rows are unaffected (they simply have no password yet).
--   2. OAuth-only accounts (if added later) can also leave it NULL.
--   3. The NextAuth authorize() function rejects login when password_hash IS NULL,
--      so a NULL value is never a "bypass" — it is treated as "no password set".

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS password_hash TEXT DEFAULT NULL;

-- Optional: tighten RLS so no client can read the hash directly.
-- The column is only ever read by the service-role admin client on the server.
-- If you have a SELECT policy that returns all columns, replace "SELECT *" with
-- an explicit column list that excludes password_hash, or add the policy below.
--
-- Example (adjust policy name / role as needed):
-- CREATE POLICY "users_select_own_no_hash"
--   ON public.users
--   FOR SELECT
--   USING (auth.uid() = id)
--   -- returning only safe columns requires a view; see Supabase docs on column-level security
-- ;
--
-- At minimum, ensure your existing SELECT policies do NOT expose password_hash
-- to the anon or authenticated roles. The safest approach is to verify via:
--   SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'users' AND table_schema = 'public';
-- and audit every policy on public.users.
