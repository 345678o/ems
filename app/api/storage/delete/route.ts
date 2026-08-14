import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { storageDeleteSchema } from "@/lib/api/schemas";
import { authorizeEventStoragePath } from "@/lib/api/storage-auth";
import {
  forbidden,
  ok,
  serverError,
  unauthorized,
  validationError,
} from "@/lib/api/response";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // ── 1. Authentication ──────────────────────────────────────────────────────
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorized();

  const userId = session.user.id;

  try {
    // ── 2. Parse + validate JSON body with Zod ─────────────────────────────
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

    const parsed = storageDeleteSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.issues);

    const { bucket, path } = parsed.data;

    // ── 3. Path ownership enforcement ─────────────────────────────────────
    // Verify the acting user owns the event at the head of the path.
    const authorized = await authorizeEventStoragePath(path, userId);
    if (!authorized) {
      return forbidden(
        "You do not have permission to delete files from this event's storage"
      );
    }

    // ── 4. Delete ──────────────────────────────────────────────────────────
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error("[delete] storage error:", error.message);
      return serverError(error.message);
    }

    return ok({ deleted: data });
  } catch (err: unknown) {
    console.error("[delete] unexpected error");
    return serverError(err instanceof Error ? err.message : "Unknown error");
  }
}
