/**
 * app/api/me/password/route.ts
 *
 * Lets a signed-in user change their own password. The current password must
 * be supplied and is checked against the stored bcrypt hash before the new
 * hash is written, so a borrowed open session alone can't change it.
 */

import logger from "@/lib/logger";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { changePasswordSchema } from "@/lib/api/schemas";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  badRequest,
  ok,
  serverError,
  unauthorized,
  validationError,
} from "@/lib/api/response";

export async function PATCH(req: Request) {
  // ── 1. Authentication ──────────────────────────────────────────────────────
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) return unauthorized("Not authenticated");

  // ── 2. Validate body ───────────────────────────────────────────────────────
  const body = await req.json().catch(() => ({}));
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.issues);
  const { current_password, new_password } = parsed.data;

  // ── 3. Check the current password ──────────────────────────────────────────
  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("id, password_hash")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    logger.error("[/api/me/password] lookup error:", error.message);
    return serverError("Database error");
  }

  // Same bcrypt work whether or not the row/hash exists.
  const valid = await verifyPassword(current_password, user?.password_hash);
  if (!user || !valid) return badRequest("Current password is incorrect");

  // ── 4. Store the new hash ──────────────────────────────────────────────────
  // The password_hash guard makes this a compare-and-set: if the password was
  // changed elsewhere in the meantime, nothing is overwritten.
  const { data: updated, error: updateError } = await supabaseAdmin
    .from("users")
    .update({
      password_hash: await hashPassword(new_password),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .eq("password_hash", user.password_hash)
    .select("id");

  if (updateError) {
    logger.error("[/api/me/password] update error:", updateError.message);
    return serverError("Failed to update password");
  }
  if (!updated?.length) {
    return badRequest("Your password was just changed. Please try again.");
  }

  return ok({ updated: true });
}
