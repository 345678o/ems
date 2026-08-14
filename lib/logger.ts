/**
 * lib/logger.ts
 *
 * Centralised logging shim. All application code must use this module instead
 * of calling console.* directly so that:
 *   - debug / info output can be silenced in production with a single env flag
 *   - the logging backend can be swapped (e.g. to a structured logger or a
 *     remote sink) without touching every call-site
 *
 * Usage:
 *   import logger from "@/lib/logger";
 *   logger.debug("fetching", { url });   // dev-only
 *   logger.info("user signed in");
 *   logger.warn("slow query", { ms });
 *   logger.error("DB write failed", err); // always emitted
 *
 * Environment control:
 *   LOG_LEVEL=silent  — suppresses everything (useful in test runners)
 *   LOG_LEVEL=error   — only errors
 *   LOG_LEVEL=warn    — errors + warnings
 *   LOG_LEVEL=info    — errors + warnings + info  (production default)
 *   LOG_LEVEL=debug   — all output                (development default)
 *
 * In the browser the same variable is read from NEXT_PUBLIC_LOG_LEVEL.
 */

type Level = "debug" | "info" | "warn" | "error" | "silent";

const LEVELS: Record<Level, number> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

function resolveLevel(): Level {
  // Server: process.env is available. Browser: use the NEXT_PUBLIC_ variant.
  const raw =
    (typeof process !== "undefined" && process.env?.LOG_LEVEL) ||
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_LOG_LEVEL) ||
    (process.env.NODE_ENV === "development" ? "debug" : "info");
  return (raw as Level) in LEVELS ? (raw as Level) : "info";
}

const activeLevel = LEVELS[resolveLevel()];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LogArgs = [message: string, ...rest: any[]];

const logger = {
  debug(...args: LogArgs): void {
    if (activeLevel >= LEVELS.debug) console.debug("[debug]", ...args);
  },
  info(...args: LogArgs): void {
    if (activeLevel >= LEVELS.info) console.info("[info]", ...args);
  },
  warn(...args: LogArgs): void {
    if (activeLevel >= LEVELS.warn) console.warn("[warn]", ...args);
  },
  error(...args: LogArgs): void {
    if (activeLevel >= LEVELS.error) console.error("[error]", ...args);
  },
};

export default logger;
