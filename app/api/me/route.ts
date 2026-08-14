import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createClient } from "@/lib/supabase/server";
import { patchMeSchema } from "@/lib/api/schemas";
import {
  ok,
  serverError,
  unauthorized,
  validationError,
} from "@/lib/api/response";

export async function GET() {
  // ── 1. Authentication ──────────────────────────────────────────────────────
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorized("Not authenticated");

  // ── 2. Fetch user profile ──────────────────────────────────────────────────
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select(
      "id, email, first_name, last_name, phone_number, full_name, avatar_url"
    )
    .eq("email", session.user.email)
    .maybeSingle();

  if (error) {
    console.error("[/api/me] GET error:", error.message);
    return serverError("DB error");
  }

  return ok({ user: data });
}

export async function PATCH(req: Request) {
  // ── 1. Authentication ──────────────────────────────────────────────────────
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorized("Not authenticated");

  // ── 2. Parse + validate JSON body with Zod ────────────────────────────────
  const body = await req.json().catch(() => ({}));
  const parsed = patchMeSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.issues);

  const { first_name, last_name, phone_number } = parsed.data;

  // ── 3. Update user row ─────────────────────────────────────────────────────
  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .update({
      first_name: first_name ?? null,
      last_name: last_name ?? null,
      phone_number: phone_number ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("email", session.user.email);

  if (error) {
    console.error("[/api/me] PATCH error:", error.message);
    return serverError("Update failed");
  }

  return ok({ success: true });
}
