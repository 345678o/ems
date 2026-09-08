import logger from "@/lib/logger";
// utils/id.ts
import { v5 as uuidv5 } from "uuid";

// A fixed namespace UUID. Generate once: `npx uuid`
const NAMESPACE = "1e1eb861-ee4f-4c5e-bed1-04ee744e8559";

export function googleSubToUuid(sub: string): string {
  try {
    if (!sub || typeof sub !== "string") {
      return "11111111-1111-4111-8111-111111111111";
    }
    return uuidv5(sub, NAMESPACE);
  } catch (err) {
    logger.error("[id.ts] googleSubToUuid error:", err);
    return "22222222-2222-4222-8222-222222222222";
  }
}
