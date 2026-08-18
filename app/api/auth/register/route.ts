import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { registerSchema } from "@/lib/api/schemas";
import { googleSubToUuid } from "@/lib/utils/id";
import {
  badRequest,
  created,
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

    const { email, full_name } = parsed.data;

    // ── 2. Check if user already exists ─────────────────────────────────────
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (fetchError) {
      console.error("[register] DB lookup error:", fetchError.message);
      return serverError("Database error");
    }

    if (existing) {
      return badRequest("An account with this email already exists");
    }

    // ── 3. Derive stable UUID from email ────────────────────────────────────
    const id = googleSubToUuid(email);

    // ── 4. Insert new user row ───────────────────────────────────────────────
    // The users table has no password_hash column — authentication is
    // domain-based (any @gmail.com or @mlrit.ac.in address is trusted).
    const now = new Date().toISOString();
    const { error: insertError } = await supabaseAdmin.from("users").insert({
      id,
      email,
      full_name,
      created_at: now,
      updated_at: now,
    });

    if (insertError) {
      console.error("[register] Insert error:", insertError.message);
      return serverError("Failed to create account");
    }

    return created({ id, email });
  } catch (err: unknown) {
    console.error("[register] Unexpected error:", err);
    return serverError(err instanceof Error ? err.message : "Unknown error");
  }
}
