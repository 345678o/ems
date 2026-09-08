/**
 * tests/id-utils.test.ts
 *
 * Unit tests for deterministic UUID generator in lib/utils/id.ts.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Hoist uuid mock so that v5 is configurable
vi.mock("uuid", async (importOriginal) => {
  const actual = await importOriginal<typeof import("uuid")>();
  return {
    ...actual,
    v5: vi.fn(actual.v5),
  };
});

// Mock @/lib/logger to silence expected error logs during test runs
vi.mock("@/lib/logger", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { googleSubToUuid } from "@/lib/utils/id";
import { v5 as uuidv5 } from "uuid";

describe("lib/utils/id.ts — googleSubToUuid", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const actual = await vi.importActual<typeof import("uuid")>("uuid");
    vi.mocked(uuidv5).mockImplementation(actual.v5);
  });

  it("generates deterministic UUIDv5 for the same input", () => {
    const input = "user@example.com";
    const id1 = googleSubToUuid(input);
    const id2 = googleSubToUuid(input);

    expect(id1).toBe(id2);
    // Standard UUID format: 8-4-4-4-12 hex digits
    expect(id1).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });

  it("generates different UUIDs for different inputs", () => {
    const id1 = googleSubToUuid("user1@example.com");
    const id2 = googleSubToUuid("user2@example.com");

    expect(id1).not.toBe(id2);
  });

  it("returns fallback UUID when input is empty string", () => {
    const result = googleSubToUuid("");
    expect(result).toBe("11111111-1111-4111-8111-111111111111");
  });

  it("returns fallback UUID when input is not a string", () => {
    // @ts-expect-error Testing runtime edge cases with non-string inputs
    expect(googleSubToUuid(null)).toBe("11111111-1111-4111-8111-111111111111");
    // @ts-expect-error Testing runtime edge cases with non-string inputs
    expect(googleSubToUuid(undefined)).toBe(
      "11111111-1111-4111-8111-111111111111"
    );
  });

  it("catches errors thrown during uuid generation and returns error fallback UUID", () => {
    vi.mocked(uuidv5).mockImplementation(() => {
      throw new Error("UUID generation failure");
    });

    const result = googleSubToUuid("trigger-error@example.com");
    expect(result).toBe("22222222-2222-4222-8222-222222222222");
  });
});
