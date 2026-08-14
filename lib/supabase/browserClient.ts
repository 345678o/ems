import { createClient } from "@supabase/supabase-js";
import logger from "@/lib/logger";

/**
 * Dev-only logging fetch wrapper.
 * Only active when NODE_ENV === "development" (controlled via the `logger`
 * shim which respects LOG_LEVEL). In production the standard `fetch` is used
 * directly — zero overhead.
 */
function loggingFetch(input: RequestInfo | URL, init?: RequestInit) {
  const url = typeof input === "string" ? input : (input as Request).url;
  const method = (init?.method || "GET").toUpperCase();
  // Only log Supabase REST calls; skip Next.js HMR / internal endpoints.
  const isSupabase = typeof url === "string" && url.includes("/rest/v1/");
  if (isSupabase) {
    logger.debug("[SB] →", method, url);
  }
  return fetch(input, init).then(async (res) => {
    if (isSupabase) {
      logger.debug("[SB] ←", res.status, res.statusText, method, url);
      if (!res.ok) {
        try {
          const text = await res.clone().text();
          logger.debug("[SB] body:", text);
        } catch {
          // ignore clone errors
        }
      }
    }
    return res;
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  // Use the logging wrapper only during local development to avoid log noise
  // and the minor performance cost in production.
  global: {
    fetch: process.env.NODE_ENV === "development" ? loggingFetch : undefined,
  },
  auth: { persistSession: true, autoRefreshToken: true },
});
