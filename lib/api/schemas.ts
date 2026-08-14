/**
 * lib/api/schemas.ts
 *
 * Zod validation schemas for every API route under app/api/.
 * Each schema describes only the fields that the route reads from the request;
 * server-generated values (IDs, timestamps, status) are NOT validated here.
 *
 * Validation is intentionally strict:
 *   - no .passthrough() — extra fields are stripped
 *   - string fields are .trim()'d at the schema level
 *   - enums are exhaustive
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

/** Non-empty trimmed string. */
const nonEmptyString = (label: string) =>
  z.string().trim().min(1, `${label} is required`);

/** UUID v4 — used for IDs that come from the client. */
const uuid = z.string().uuid("Must be a valid UUID");

/** ISO-8601 datetime string that can be parsed by Date. */
const isoDatetime = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine((s) => !isNaN(Date.parse(s)), {
      message: `${label} must be a valid ISO-8601 datetime`,
    });

/** Positive integer — used for participant counts, budgets, etc. */
const positiveInt = (label: string) =>
  z.coerce
    .number({ invalid_type_error: `${label} must be a number` })
    .int(`${label} must be a whole number`)
    .positive(`${label} must be greater than 0`);

/** Non-negative number — allows 0 (e.g. estimated_budget). */
const nonNegativeNumber = (label: string) =>
  z.coerce
    .number({ invalid_type_error: `${label} must be a number` })
    .min(0, `${label} must be 0 or greater`);

// ---------------------------------------------------------------------------
// Allowed storage bucket names (mirrors the allowlists in the route files)
// ---------------------------------------------------------------------------
export const ALLOWED_STORAGE_BUCKETS = [
  "permission-letters",
  "event-reports",
  "profile-avatars",
  "event-assets",
] as const;

export type AllowedBucket = (typeof ALLOWED_STORAGE_BUCKETS)[number];

// ---------------------------------------------------------------------------
// POST /api/auth/register  (JSON body)
// ---------------------------------------------------------------------------

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address")
    .min(1, "Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
  full_name: z.string().trim().min(1, "Full name is required").max(100),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ---------------------------------------------------------------------------
// POST /api/events/create  (multipart/form-data — fields only, not the file)
// ---------------------------------------------------------------------------

/**
 * Validates the text fields extracted from the FormData.
 * The actual File object is validated separately in the route (MIME type,
 * size) because Zod cannot operate on a Blob/File instance.
 */
export const createEventSchema = z
  .object({
    name: nonEmptyString("Event name"),
    theme: nonEmptyString("Event theme"),
    start_datetime: isoDatetime("Start datetime"),
    end_datetime: isoDatetime("End datetime"),
    estimated_participants: positiveInt("Estimated participants"),
    estimated_budget: nonNegativeNumber("Estimated budget"),
    club_id: uuid.describe("Club ID"),
    event_type: z.enum(["free", "paid"], {
      errorMap: () => ({ message: 'Event type must be "free" or "paid"' }),
    }),
  })
  .refine((d) => new Date(d.end_datetime) >= new Date(d.start_datetime), {
    message: "End datetime must be after start datetime",
    path: ["end_datetime"],
  });

export type CreateEventInput = z.infer<typeof createEventSchema>;

// ---------------------------------------------------------------------------
// POST /api/storage/upload  (multipart/form-data — text fields only)
// ---------------------------------------------------------------------------

export const storageUploadSchema = z.object({
  bucket: z.enum(ALLOWED_STORAGE_BUCKETS, {
    errorMap: () => ({
      message: `Bucket must be one of: ${ALLOWED_STORAGE_BUCKETS.join(", ")}`,
    }),
  }),
  /**
   * Storage path for the file. Authorization is handled separately in the
   * route — this schema only checks for structural validity (no '..' segments).
   */
  path: z
    .string()
    .trim()
    .min(1, "Path is required")
    .refine((p) => !p.includes(".."), {
      message: "Path must not contain '..' directory traversal",
    }),
});

export type StorageUploadInput = z.infer<typeof storageUploadSchema>;

// ---------------------------------------------------------------------------
// POST /api/storage/delete  (JSON body)
// ---------------------------------------------------------------------------

export const storageDeleteSchema = z.object({
  bucket: z.enum(ALLOWED_STORAGE_BUCKETS, {
    errorMap: () => ({
      message: `Bucket must be one of: ${ALLOWED_STORAGE_BUCKETS.join(", ")}`,
    }),
  }),
  path: z
    .string()
    .trim()
    .min(1, "Path is required")
    .refine((p) => !p.includes(".."), {
      message: "Path must not contain '..' directory traversal",
    }),
});

export type StorageDeleteInput = z.infer<typeof storageDeleteSchema>;

// ---------------------------------------------------------------------------
// PATCH /api/me  (JSON body — all fields optional)
// ---------------------------------------------------------------------------

export const patchMeSchema = z
  .object({
    first_name: z
      .string()
      .trim()
      .max(100, "First name too long")
      .nullable()
      .optional(),
    last_name: z
      .string()
      .trim()
      .max(100, "Last name too long")
      .nullable()
      .optional(),
    phone_number: z
      .string()
      .trim()
      .max(20, "Phone number too long")
      .regex(/^[+\d\s\-().]*$/, "Phone number contains invalid characters")
      .nullable()
      .optional(),
  })
  // Strip any extra fields — never write unexpected columns to users.
  .strict("Unexpected fields in request body");

export type PatchMeInput = z.infer<typeof patchMeSchema>;

// ---------------------------------------------------------------------------
// PATCH /api/partner/convert  (no body — request shape validated by session)
// ---------------------------------------------------------------------------

/**
 * This route takes no request body; validation is purely session-based.
 * The schema is included for symmetry and to document that intent explicitly.
 */
export const partnerConvertSchema = z.object({}).strict();

export type PartnerConvertInput = z.infer<typeof partnerConvertSchema>;
