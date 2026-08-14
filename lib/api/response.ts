/**
 * lib/api/response.ts
 *
 * Canonical helpers for building JSON responses from API routes.
 * Every route must use these instead of raw NextResponse.json() so that the
 * shape of success and error responses stays consistent across the whole API.
 *
 * Success shape:  { data?: T }               (2xx)
 * Error shape:    { error: string,            (4xx / 5xx)
 *                   details?: ZodIssue[] }
 */

import { NextResponse } from "next/server";
import type { ZodIssue } from "zod";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Every error response body conforms to this interface. */
export interface ApiErrorBody {
  error: string;
  /** Present only for 400 Zod validation failures. */
  details?: ZodIssue[];
}

/** Every success response body conforms to this interface. */
export interface ApiSuccessBody<T = unknown> {
  data?: T;
}

// ---------------------------------------------------------------------------
// Error helpers
// ---------------------------------------------------------------------------

/** 400 Bad Request — generic message, no details. */
export function badRequest(message: string): NextResponse<ApiErrorBody> {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * 400 Bad Request — Zod validation failure.
 * Includes the flattened issue list so callers can highlight individual fields.
 */
export function validationError(
  issues: ZodIssue[]
): NextResponse<ApiErrorBody> {
  // Build a single human-readable summary from the first issue per path.
  const summary = issues
    .map((i) => {
      const path = i.path.length ? i.path.join(".") : "input";
      return `${path}: ${i.message}`;
    })
    .join("; ");

  return NextResponse.json(
    { error: summary, details: issues },
    { status: 400 }
  );
}

/** 401 Unauthorized. */
export function unauthorized(
  message = "Unauthorized"
): NextResponse<ApiErrorBody> {
  return NextResponse.json({ error: message }, { status: 401 });
}

/** 403 Forbidden. */
export function forbidden(message: string): NextResponse<ApiErrorBody> {
  return NextResponse.json({ error: message }, { status: 403 });
}

/** 404 Not Found. */
export function notFound(message: string): NextResponse<ApiErrorBody> {
  return NextResponse.json({ error: message }, { status: 404 });
}

/** 500 Internal Server Error. */
export function serverError(
  message = "Internal server error"
): NextResponse<ApiErrorBody> {
  return NextResponse.json({ error: message }, { status: 500 });
}

// ---------------------------------------------------------------------------
// Success helpers
// ---------------------------------------------------------------------------

/** 200 OK with an optional data payload. */
export function ok<T>(data?: T): NextResponse<ApiSuccessBody<T>> {
  return NextResponse.json(data !== undefined ? { data } : {}, {
    status: 200,
  });
}

/** 201 Created with an optional data payload. */
export function created<T>(data?: T): NextResponse<ApiSuccessBody<T>> {
  return NextResponse.json(data !== undefined ? { data } : {}, {
    status: 201,
  });
}
