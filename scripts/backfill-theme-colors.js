// Backfill script - run once with: node scripts/backfill-theme-colors.js
// Extracts a 3-color theme from each event's existing 1x1 banner image for
// rows that predate the theme_colors column (e.g. seeded Unsplash banners).
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
const { Vibrant } = require("node-vibrant/node");

const envPath = path.join(__dirname, "../.env");
const envContent = fs.readFileSync(envPath, "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [key, ...val] = line.split("=");
  if (key && val.length) env[key.trim()] = val.join("=").trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or service role key in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function extractTheme(imageUrl) {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Failed to fetch ${imageUrl}: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const palette = await Vibrant.from(buffer).getPalette();

  const primary = palette.Vibrant?.hex;
  const dark = palette.DarkVibrant?.hex ?? palette.DarkMuted?.hex;
  const light = palette.LightVibrant?.hex ?? palette.LightMuted?.hex;
  if (!primary || !dark || !light) return null;
  return { primary, dark, light };
}

async function main() {
  const { data: events, error } = await supabase
    .from("events")
    .select("id,name,banners,theme_colors");

  if (error) {
    console.error("Failed to fetch events:", error.message);
    process.exit(1);
  }

  const pending = (events || []).filter((e) => {
    const banners = typeof e.banners === "string" ? JSON.parse(e.banners) : e.banners;
    return Boolean(banners?.["1x1"]) && !e.theme_colors;
  });

  console.log(`Found ${pending.length} event(s) needing a theme.`);

  for (const event of pending) {
    const banners = typeof event.banners === "string" ? JSON.parse(event.banners) : event.banners;
    try {
      const theme = await extractTheme(banners["1x1"]);
      if (!theme) {
        console.warn(`  skip "${event.name}" (${event.id}) — no usable palette`);
        continue;
      }
      const { error: updateError } = await supabase
        .from("events")
        .update({ theme_colors: theme })
        .eq("id", event.id);
      if (updateError) {
        console.error(`  failed "${event.name}" (${event.id}):`, updateError.message);
      } else {
        console.log(`  done "${event.name}" (${event.id}) →`, theme);
      }
    } catch (err) {
      console.error(`  error "${event.name}" (${event.id}):`, err.message || err);
    }
  }
}

main();
