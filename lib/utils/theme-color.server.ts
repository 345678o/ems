import "server-only";
import type { EventTheme } from "@/lib/utils/theme-color";

export async function extractEventTheme(
  buffer: Buffer
): Promise<EventTheme | null> {
  try {
    const { Vibrant } = await import("node-vibrant/node");
    const palette = await Vibrant.from(buffer).getPalette();

    const primary = palette.Vibrant?.hex;
    const dark = palette.DarkVibrant?.hex ?? palette.DarkMuted?.hex;
    const light = palette.LightVibrant?.hex ?? palette.LightMuted?.hex;

    if (!primary || !dark || !light) return null;

    return { primary, dark, light };
  } catch (err) {
    console.error("[theme-color] extraction failed:", err);
    return null;
  }
}
