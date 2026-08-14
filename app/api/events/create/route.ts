import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { v4 as uuidv4 } from "uuid";
import { createEventSchema } from "@/lib/api/schemas";
import {
  badRequest,
  created,
  forbidden,
  serverError,
  unauthorized,
  validationError,
} from "@/lib/api/response";

// Ensure Node.js runtime for Buffer / FormData handling.
export const runtime = "nodejs";

/** Strip characters outside a safe filename set. */
function sanitizePathPart(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

export async function POST(req: Request) {
  // ── 1. Authentication ──────────────────────────────────────────────────────
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorized();

  const actingUserId = session.user.id;

  try {
    const form = await req.formData();

    // ── 2. Extract text fields and validate with Zod ───────────────────────
    const raw = {
      name: String(form.get("name") ?? "").trim(),
      theme: String(form.get("theme") ?? "").trim(),
      start_datetime: String(form.get("start_datetime") ?? "").trim(),
      end_datetime: String(form.get("end_datetime") ?? "").trim(),
      // coerce strings → numbers (schema uses z.coerce.number)
      estimated_participants: form.get("estimated_participants"),
      estimated_budget: form.get("estimated_budget"),
      club_id: String(form.get("club_id") ?? "").trim(),
      event_type: String(form.get("event_type") ?? "free").trim(),
    };

    const parsed = createEventSchema.safeParse(raw);
    if (!parsed.success) return validationError(parsed.error.issues);

    const {
      name,
      theme,
      start_datetime,
      end_datetime,
      estimated_participants,
      estimated_budget,
      club_id,
      event_type,
    } = parsed.data;

    // ── 3. Validate the uploaded file (cannot be done via Zod) ────────────
    const file = form.get("event_blueprint");
    if (!(file instanceof File)) {
      return badRequest("event_blueprint is required and must be a file");
    }
    if (file.type !== "application/pdf") {
      return badRequest("Event blueprint must be a PDF");
    }
    if (file.size > 200 * 1024) {
      return badRequest("Event blueprint must be 200 KB or smaller");
    }

    // ── 4. Club ownership check ────────────────────────────────────────────
    // ASSUMPTION: clubs.user_id holds the owner's UUID. Adjust if your
    // schema uses a different column name (e.g. owner_id).
    const { data: club, error: clubErr } = await supabaseAdmin
      .from("clubs")
      .select("id")
      .eq("id", club_id)
      .eq("user_id", actingUserId)
      .maybeSingle();

    if (clubErr) {
      console.error(
        "[events/create] club ownership lookup error:",
        clubErr.message
      );
      return serverError("Could not verify club ownership");
    }
    if (!club) return forbidden("You do not administer this club");

    // ── 5. Upload blueprint to Storage ────────────────────────────────────
    const BUCKET = "event-blueprints";
    const safeClub = sanitizePathPart(club_id);
    const safeName = sanitizePathPart(file.name || "blueprint.pdf");
    const filePath = `${safeClub}/${Date.now()}_${safeName}`;

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadErr } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filePath, fileBuffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: "application/pdf",
      });

    if (uploadErr) {
      console.error("[events/create] storage upload error:", uploadErr.message);
      return badRequest(`Upload failed: ${uploadErr.message}`);
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    if (!publicUrlData.publicUrl)
      return serverError("Failed to get public URL");

    // ── 6. Insert event row ────────────────────────────────────────────────
    // Always generate a fresh server-side UUID — never trust a client-supplied id.
    const id = uuidv4();

    const { data, error: insertErr } = await supabaseAdmin
      .from("events")
      .insert({
        id,
        name,
        theme,
        start_datetime,
        end_datetime,
        estimated_participants,
        estimated_budget,
        event_blueprint: publicUrlData.publicUrl,
        event_type,
        status: "pending_approval",
        hosted: "self",
        club_id,
      })
      .select("id")
      .single();

    if (insertErr) {
      console.error("[events/create] DB insert error:", insertErr.message);
      return badRequest(insertErr.message);
    }

    return created({ id: data.id, event_blueprint: publicUrlData.publicUrl });
  } catch (err: unknown) {
    console.error("[events/create] unexpected error");
    return serverError(err instanceof Error ? err.message : "Unexpected error");
  }
}
