import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createClient } from "@/lib/supabase/server";
import { partnerConvertSchema } from "@/lib/api/schemas";
import {
  notFound,
  ok,
  serverError,
  unauthorized,
  validationError,
} from "@/lib/api/response";

export async function PATCH(req: Request) {
  // ── 1. Authentication ──────────────────────────────────────────────────────
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorized("Not authenticated");

  // ── 2. Validate body (this route takes no body; schema ensures it is empty
  //       or absent — any extra fields are rejected to prevent injection). ────
  const body = await req.json().catch(() => ({}));
  const parsed = partnerConvertSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.issues);

  const supabase = await createClient();

  // ── 3. Load user row ───────────────────────────────────────────────────────
  const { data: user, error: userErr } = await supabase
    .from("users")
    .select("id, email, full_name, avatar_url")
    .eq("email", session.user.email)
    .maybeSingle();

  if (userErr) {
    console.error("[/api/partner/convert] fetch user error:", userErr.message);
    return serverError("Failed to load user");
  }
  if (!user) return notFound("User not found");

  // ── 4. Promote user role to 'club' ─────────────────────────────────────────
  const { error: updErr } = await supabase
    .from("users")
    .update({ role: "club", updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (updErr) {
    console.error("[/api/partner/convert] update role error:", updErr.message);
    return serverError("Update failed");
  }

  // ── 5. Upsert club row ─────────────────────────────────────────────────────
  const displayName =
    user.full_name ||
    session.user.name ||
    (user.email ? user.email.split("@")[0] : "New Club");

  const { error: clubErr } = await supabase.from("clubs").upsert(
    {
      id: user.id,
      name: displayName,
      description: "",
      owner_id: user.id,
      form_schema: {},
      avatar_url: user.avatar_url || session.user.image || null,
      email: user.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (clubErr) {
    console.error("[/api/partner/convert] upsert club error:", clubErr.message);
    return serverError("Club creation failed");
  }

  return ok({ success: true });
}
