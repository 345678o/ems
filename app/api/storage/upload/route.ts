/**
 * app/api/storage/upload/route.ts
 *
 * Secure storage upload endpoint. Accepts a base64 payload and destination path, verifies
 * session authentication, enforces event-level path ownership, and writes the asset to
 * Supabase Storage via the admin client.
 */

import logger from "@/lib/logger";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { storageUploadSchema } from "@/lib/api/schemas";
import { authorizeEventStoragePath } from "@/lib/api/storage-auth";
import { extractEventTheme } from "@/lib/utils/theme-color.server";
import {
  forbidden,
  ok,
  serverError,
  unauthorized,
  validationError,
} from "@/lib/api/response";

// Node runtime required for Buffer.
export const runtime = "nodejs";

// path convention: `${eventId}/banners/banner_1x1.<ext>` (see components/event-info/DetailsTab.tsx)
const POSTER_BANNER_PATH = /^([^/]+)\/banners\/banner_1x1\./;

export async function POST(req: NextRequest) {
  // ── 1. Authentication ──────────────────────────────────────────────────────
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorized();

  const userId = session.user.id;

  try {
    const form = await req.formData();

    // ── 2. Validate text fields with Zod ───────────────────────────────────
    const parsed = storageUploadSchema.safeParse({
      bucket: form.get("bucket"),
      path: form.get("path"),
    });
    if (!parsed.success) return validationError(parsed.error.issues);

    const { bucket, path } = parsed.data;

    // ── 3. Verify the file is present ──────────────────────────────────────
    const file = form.get("file");
    if (!(file instanceof Blob)) {
      return validationError([
        { code: "custom", path: ["file"], message: "file is required" },
      ]);
    }

    // ── 4. Path ownership enforcement ─────────────────────────────────────
    // Paths are scoped to events. Verify the acting user owns the event
    // at the head of the path.
    const authorized = await authorizeEventStoragePath(path, userId);
    if (!authorized) {
      return forbidden(
        "You do not have permission to upload to this event's storage"
      );
    }

    // ── 5. Upload ──────────────────────────────────────────────────────────
    const buffer = Buffer.from(await file.arrayBuffer());

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, buffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "application/octet-stream",
      });

    if (error) {
      logger.error("[upload] storage error:", error.message);
      return serverError(error.message);
    }

    const { data: pub } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(data.path);

    const posterMatch = path.match(POSTER_BANNER_PATH);
    if (posterMatch) {
      const eventId = posterMatch[1];
      try {
        const theme = await extractEventTheme(buffer);
        if (theme) {
          const { error: themeError } = await supabaseAdmin
            .from("events")
            .update({ theme_colors: theme })
            .eq("id", eventId);
          if (themeError) {
            console.error("[upload] Failed to save theme_colors:", themeError.message);
          }
        }
      } catch (err) {
        console.error("[upload] Theme extraction failed:", err);
      }
    }

    return ok({ path: data.path, publicUrl: pub.publicUrl });
  } catch (err: unknown) {
    logger.error("[upload] unexpected error");
    return serverError(err instanceof Error ? err.message : "Unknown error");
  }
}
