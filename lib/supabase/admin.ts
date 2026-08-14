import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client using the service role key.
// This bypasses RLS for operations performed on the server.
// DO NOT expose this client or the service role key to the browser.

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
