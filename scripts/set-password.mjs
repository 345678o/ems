// Set (or reset) a user's password. Accounts without a password_hash cannot
// sign in, so run this for users created before password auth was enforced.
//
// Usage: node scripts/set-password.mjs <email> <password>
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "../.env");
const env = {};
fs.readFileSync(envPath, "utf8")
  .split("\n")
  .forEach((line) => {
    const [key, ...val] = line.split("=");
    if (key && val.length) env[key.trim()] = val.join("=").trim();
  });

const [, , rawEmail, password] = process.argv;
if (!rawEmail || !password) {
  console.error("Usage: node scripts/set-password.mjs <email> <password>");
  process.exit(1);
}
if (password.length < 8 || password.length > 128) {
  console.error("Password must be 8-128 characters.");
  process.exit(1);
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const email = rawEmail.trim().toLowerCase();
const password_hash = await bcrypt.hash(password, 12);

const { data, error } = await supabase
  .from("users")
  .update({ password_hash, updated_at: new Date().toISOString() })
  .eq("email", email)
  .select("id");

if (error) {
  console.error("Update failed:", error.message);
  process.exit(1);
}
if (!data?.length) {
  console.error(`No user with email ${email}.`);
  process.exit(1);
}
console.log(`Password set for ${email}.`);
