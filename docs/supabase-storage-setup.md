# Supabase Storage Setup

> Consolidated from `SUPABASE_PERMISSION_LETTER_SETUP.md`. Updated to reflect
> the current codebase where the service-role admin client (not the anon key)
> is used for server-side uploads, which makes the anon-role RLS workarounds
> below unnecessary for server routes. They are still needed if you ever add
> direct client-side uploads.

---

## Required Storage Buckets

| Bucket | Used for |
|---|---|
| `event-blueprints` | PDF event blueprints uploaded at event creation |
| `event-images` | Event photos for after-event reports |
| `event-reports` | PDF/Word activity reports |
| `permission-letters` | Permission letter images/PDFs |

Create each bucket in the Supabase dashboard: **Storage → New Bucket**.
Set **Public bucket = ON** for all of them.

---

## Database Schema Changes

Run these migrations if you haven't already (or add them to `supabase/migrations/`):

```sql
-- Add permission_letter and video_url columns to after_event_reports
ALTER TABLE after_event_reports
  ADD COLUMN IF NOT EXISTS permission_letter TEXT,
  ADD COLUMN IF NOT EXISTS video_url TEXT;
```

---

## RLS Policies

> **Important**: This project uses **NextAuth.js**, not Supabase Auth. The
> browser client uses the **anon key**, so `auth.uid()` is always `null`.
> Server-side uploads use the **service-role key** which bypasses RLS entirely —
> no policies are needed for those paths.
>
> Policies below are only required for any future direct client-side uploads.

### Option A — Service-role only (current setup)

All uploads go through API routes that use `supabaseAdmin` (service-role key).
RLS on storage objects does not need to be configured. Leave buckets public for
reads only:

```sql
-- Public read for all app buckets
CREATE POLICY "public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id IN (
    'event-blueprints', 'event-images', 'event-reports', 'permission-letters'
  ));
```

### Option B — If you add direct client uploads (anon role)

Because NextAuth uses the anon key, any client-side upload needs anon-role
policies (not authenticated-role):

```sql
-- Drop any stale authenticated-role policies first
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Anon uploads
CREATE POLICY "anon_insert_permission_letters"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'permission-letters');

-- Public reads
CREATE POLICY "public_read_permission_letters"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'permission-letters');

-- Anon updates/deletes
CREATE POLICY "anon_update_permission_letters"
  ON storage.objects FOR UPDATE TO anon
  USING (bucket_id = 'permission-letters');

CREATE POLICY "anon_delete_permission_letters"
  ON storage.objects FOR DELETE TO anon
  USING (bucket_id = 'permission-letters');
```

Repeat for `event-images` and `event-reports` if needed.

---

## Troubleshooting: "new row violates row-level security policy"

**Root cause**: The storage policy targets the `authenticated` role but
NextAuth sessions use the anon key — `auth.uid()` returns null.

**Fix**: Apply Option B above. Then verify:

1. Bucket exists in Supabase Storage.
2. Bucket is set to **Public**.
3. Policies target the `anon` role, not `authenticated`.
4. The column exists in `after_event_reports` (run the migration above).

---

## File Limits

| Type | Max size |
|---|---|
| Event blueprint (PDF) | 200 KB |
| Event images | 3 MB each, max 3 images |
| Activity report (PDF/Word) | 200 KB |
| Permission letter (image/PDF) | 5 MB |
