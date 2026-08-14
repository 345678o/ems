/**
 * lib/api/storage-auth.ts
 *
 * Shared authorization logic for storage upload/delete routes.
 * Validates that the acting user owns the event at the head of the storage path.
 */

import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Checks if the given user owns the event whose ID is the first path segment.
 *
 * @param path — Storage path, e.g. "abc123/banners/logo.png"
 * @param userId — Acting user's UUID from session
 * @returns true if authorized, false otherwise
 */
export async function authorizeEventStoragePath(
  path: string,
  userId: string
): Promise<boolean> {
  // Extract event ID from path (first segment before "/")
  const firstSlash = path.indexOf("/");
  if (firstSlash === -1) return false;

  const eventId = path.substring(0, firstSlash);
  if (!eventId) return false;

  // Look up the event's club_id
  const { data: event, error: eventErr } = await supabaseAdmin
    .from("events")
    .select("club_id")
    .eq("id", eventId)
    .maybeSingle();

  if (eventErr || !event) return false;

  // Look up the club's owner
  const { data: club, error: clubErr } = await supabaseAdmin
    .from("clubs")
    .select("user_id")
    .eq("id", event.club_id)
    .maybeSingle();

  if (clubErr || !club) return false;

  // Authorize if the club's user_id matches the session user
  return club.user_id === userId;
}
