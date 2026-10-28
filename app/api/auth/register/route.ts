/**
 * app/api/auth/register/route.ts
 *
 * User registration endpoint. Validates registration payloads against registerSchema,
 * computes a deterministic UUIDv5 from the provided email, hashes the password with
 * bcrypt, and inserts the user record using the Supabase admin client. An existing
 * row without a password_hash (created before password auth) is claimed instead.
 */

import logger from "@/lib/logger";
import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { registerSchema } from "@/lib/api/schemas";
import { googleSubToUuid } from "@/lib/utils/id";
import { hashPassword } from "@/lib/auth/password";
import {
  badRequest,
  created,
  ok,
  serverError,
  validationError,
} from "@/lib/api/response";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // ── 1. Parse + validate JSON body ───────────────────────────────────────
    const body = await req.json().catch(() => null);
    if (body === null) {
      return validationError([
        {
          code: "custom",
          path: [],
          message: "Request body must be valid JSON",
        },
      ]);
    }

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.issues);

    const { email, password, full_name } = parsed.data;

    // ── 2. Check if user already exists ─────────────────────────────────────
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("id, password_hash")
      .eq("email", email)
      .maybeSingle();

    if (fetchError) {
      logger.error("[register] DB lookup error:", fetchError.message);
      return serverError("Database error");
    }

    if (existing?.password_hash) {
      return badRequest("An account with this email already exists");
    }

    const password_hash = await hashPassword(password);
    const now = new Date().toISOString();

    // ── 3. Claim a legacy account ───────────────────────────────────────────
    // Rows created before password auth have no password_hash. The first
    // register call for that email sets one. The `is(password_hash, null)`
    // guard makes the claim atomic: a second concurrent claim updates 0 rows.
    if (existing) {
      const { data: claimed, error: claimError } = await supabaseAdmin
        .from("users")
        .update({ password_hash, updated_at: now })
        .eq("id", existing.id)
        .is("password_hash", null)
        .select("id");

      if (claimError) {
        logger.error("[register] Claim error:", claimError.message);
        return serverError("Failed to create account");
      }
      if (!claimed?.length) {
        return badRequest("An account with this email already exists");
      }
      return ok({ id: existing.id, email });
    }

    // ── 4. Insert new user row with hashed password ──────────────────────────
    const id = googleSubToUuid(email);
    const { error: insertError } = await supabaseAdmin.from("users").insert({
      id,
      email,
      full_name,
      password_hash,
      created_at: now,
      updated_at: now,
    });

    if (insertError) {
      // 23505 = unique_violation: a concurrent request created the same user.
      if (insertError.code === "23505") {
        return badRequest("An account with this email already exists");
      }
      logger.error("[register] Insert error:", insertError.message);
      return serverError("Failed to create account");
    }

    return created({ id, email });
  } catch (err: unknown) {
    logger.error("[register] Unexpected error:", err);
    return serverError("Failed to create account");
  }
}
