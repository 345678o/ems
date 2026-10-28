/**
 * lib/auth/credentials.ts
 *
 * Credentials check used by the NextAuth `authorize()` callback. Every account
 * must have a password_hash; accounts without one cannot sign in until a
 * password is set, either by registering again with the same email (which
 * claims the row) or with scripts/set-password.mjs.
 */

import logger from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyPassword } from "@/lib/auth/password";

export type AuthorizedUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

export async function authorizeCredentials(
  credentials: Record<string, string> | undefined
): Promise<AuthorizedUser | null> {
  const email = credentials?.email?.trim().toLowerCase();
  const password = credentials?.password;
  if (!email || !password) return null;

  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("id, email, full_name, avatar_url, password_hash")
    // Look up by email, not the derived id: legacy rows may have a
    // different id, and scripts/set-password.mjs also matches on email.
    .eq("email", email)
    .maybeSingle();

  if (error) {
    logger.error("[auth] DB lookup error during authorize");
    return null;
  }

  // verifyPassword does the same bcrypt work when the user or hash is
  // missing, so unknown emails are not distinguishable by timing.
  const valid = await verifyPassword(password, user?.password_hash);
  if (!user || !valid) return null;

  return {
    id: user.id,
    name: user.full_name || email.split("@")[0] || "User",
    email: user.email,
    image: user.avatar_url ?? null,
  };
}
