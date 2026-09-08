/**
 * tests/auth-actions.test.ts
 *
 * Unit tests for server action createOrUpdateUser in app/actions/auth.ts.
 * Tests success and failure paths, including the error-handling catch block.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Hoist mock for @/lib/supabase/server
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

// Mock @/lib/logger to silence error logs during test runs
vi.mock("@/lib/logger", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { createOrUpdateUser } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";

describe("app/actions/auth.ts — createOrUpdateUser", () => {
  const profile = {
    id: "user-uuid-1234",
    email: "test@example.com",
    name: "Test User",
    image: "https://example.com/avatar.jpg",
  };

  let mockMaybeSingle: ReturnType<typeof vi.fn>;
  let mockEqSelect: ReturnType<typeof vi.fn>;
  let mockSelect: ReturnType<typeof vi.fn>;
  let mockInsert: ReturnType<typeof vi.fn>;
  let mockEqUpdate: ReturnType<typeof vi.fn>;
  let mockUpdate: ReturnType<typeof vi.fn>;
  let mockFrom: ReturnType<typeof vi.fn>;
  let mockSupabase: { from: typeof mockFrom };

  beforeEach(() => {
    vi.clearAllMocks();

    mockMaybeSingle = vi.fn();
    mockEqSelect = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    mockSelect = vi.fn().mockReturnValue({ eq: mockEqSelect });
    mockInsert = vi.fn();
    mockEqUpdate = vi.fn();
    mockUpdate = vi.fn().mockReturnValue({ eq: mockEqUpdate });

    mockFrom = vi.fn().mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    });

    mockSupabase = { from: mockFrom };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);
  });

  it("inserts new user successfully when user does not exist", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockInsert.mockResolvedValue({ error: null });

    const result = await createOrUpdateUser(profile);

    expect(result).toEqual({ success: true });
    expect(mockFrom).toHaveBeenCalledWith("users");
    expect(mockSelect).toHaveBeenCalledWith("id");
    expect(mockEqSelect).toHaveBeenCalledWith("id", profile.id);
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockInsert).toHaveBeenCalledWith([
      expect.objectContaining({
        id: profile.id,
        email: profile.email,
        full_name: profile.name,
        avatar_url: profile.image,
      }),
    ]);
  });

  it("updates existing user successfully when user is found", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { id: profile.id },
      error: null,
    });
    mockEqUpdate.mockResolvedValue({ error: null });

    const result = await createOrUpdateUser(profile);

    expect(result).toEqual({ success: true });
    expect(mockFrom).toHaveBeenCalledWith("users");
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: profile.id,
        email: profile.email,
        full_name: profile.name,
        avatar_url: profile.image,
      })
    );
    expect(mockEqUpdate).toHaveBeenCalledWith("id", profile.id);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns failure when user lookup returns a database error", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: null,
      error: { message: "Failed to connect to database" },
    });

    const result = await createOrUpdateUser(profile);

    expect(result).toEqual({
      success: false,
      error: "Failed to connect to database",
    });
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns failure when user insertion fails", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockInsert.mockResolvedValue({
      error: { message: "Unique constraint violation on email" },
    });

    const result = await createOrUpdateUser(profile);

    expect(result).toEqual({
      success: false,
      error: "Unique constraint violation on email",
    });
  });

  it("returns failure when user update fails", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { id: profile.id },
      error: null,
    });
    mockEqUpdate.mockResolvedValue({
      error: { message: "Database write timeout" },
    });

    const result = await createOrUpdateUser(profile);

    expect(result).toEqual({
      success: false,
      error: "Database write timeout",
    });
  });

  it("catches thrown exceptions and returns standardized error object", async () => {
    vi.mocked(createClient).mockRejectedValue(
      new Error("Supabase auth failed")
    );

    const result = await createOrUpdateUser(profile);

    expect(result).toEqual({
      success: false,
      error: "Supabase auth failed",
    });
  });
});
