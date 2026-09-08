/**
 * lib/supabase/admin.ts
 *
 * Server-only Supabase client initialized with the service role key. Bypasses Row Level
 * Security (RLS) for privileged backend operations such as user management, storage admin,
 * and event approvals. Must never be imported or exposed to client-side code.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Missing environment variable: NEXT_PUBLIC_SUPABASE_URL is required."
  );
}

if (!serviceRoleKey) {
  throw new Error(
    "Missing environment variable: SUPABASE_SERVICE_ROLE_KEY is required. " +
      "Do NOT substitute the anon key — doing so silently removes the RLS bypass " +
      "that server-side API routes depend on."
  );
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
