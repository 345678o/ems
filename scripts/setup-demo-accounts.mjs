// Give the three demo accounts (student, club, admin) fresh random
// passwords so each role can be tried. Prints the passwords once; they are
// stored only as bcrypt hashes. Re-running issues new passwords.
//
// Only touches these three existing rows, and checks each row's role first.
// Needs the users.password_hash column (supabase/migrations/add_users_password_hash.sql).
//
// Usage: node scripts/setup-demo-accounts.mjs
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const DEMO_ACCOUNTS = [
  { role: "user", label: "Student", email: "demo@example.com" },
  { role: "club", label: "Club", email: "demo.club@mlrit.ac.in" },
  { role: "admin", label: "Admin", email: "demo.admin@mlrit.ac.in" },
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = {};
fs.readFileSync(path.join(__dirname, "../.env"), "utf8")
  .split("\n")
  .forEach((line) => {
    const [key, ...val] = line.split("=");
    if (key && val.length) env[key.trim()] = val.join("=").trim();
  });

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

// 16 characters from an unambiguous alphabet (no 0/O, 1/l/I).
const ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
const makePassword = () =>
  Array.from(crypto.randomBytes(16), (b) => ALPHABET[b % ALPHABET.length]).join(
    ""
  );

// Fail early, before generating anything, if the column isn't there yet.
const probe = await supabase.from("users").select("password_hash").limit(0);
if (probe.error) {
  console.error(
    "users.password_hash is missing. Run this in the Supabase SQL editor first:\n" +
      "  alter table public.users add column if not exists password_hash text;"
  );
  process.exit(1);
}

const results = [];
for (const account of DEMO_ACCOUNTS) {
  const { data: user, error } = await supabase
    .from("users")
    .select("id, role")
    .eq("email", account.email)
    .maybeSingle();
  if (error || !user) {
    results.push({ ...account, password: null, note: "account not found" });
    continue;
  }
  if (user.role !== account.role) {
    results.push({
      ...account,
      password: null,
      note: `skipped: role is "${user.role}", expected "${account.role}"`,
    });
    continue;
  }
  const password = makePassword();
  const password_hash = await bcrypt.hash(password, 12);
  const { error: updateError } = await supabase
    .from("users")
    .update({ password_hash, updated_at: new Date().toISOString() })
    .eq("id", user.id);
  results.push(
    updateError
      ? { ...account, password: null, note: updateError.message }
      : { ...account, password, note: "ready" }
  );
}

console.log("\nDemo accounts (sign in at /register):\n");
for (const r of results) {
  console.log(
    `${r.label.padEnd(8)} ${r.email.padEnd(26)} ${r.password ?? "-".padEnd(16)}  ${r.note}`
  );
}
console.log("\nPasswords are shown only now. Re-run to issue new ones.\n");
