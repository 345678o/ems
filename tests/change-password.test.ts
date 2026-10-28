/**
 * tests/change-password.test.ts
 *
 * Unit tests for changePasswordSchema and PATCH /api/me/password.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

const maybeSingle = vi.fn();
const update = vi.fn();
const updateSelect = vi.fn();
const getServerSession = vi.fn();

vi.mock("next-auth/next", () => ({
  getServerSession: (...args: unknown[]) => getServerSession(...args),
}));
vi.mock("@/app/api/auth/[...nextauth]/route", () => ({ authOptions: {} }));

vi.mock("@/lib/supabase/admin", () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: () => ({ eq: () => ({ maybeSingle }) }),
      update: (row: unknown) => {
        update(row);
        return { eq: () => ({ eq: () => ({ select: updateSelect }) }) };
      },
    })),
  },
}));

vi.mock("@/lib/logger", () => ({
  default: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { changePasswordSchema } from "@/lib/api/schemas";
import { PATCH } from "@/app/api/me/password/route";

const CURRENT = "old-password-123";
const NEXT = "new-password-456";
// Low cost factor keeps the tests fast; verifyPassword reads it from the hash.
const HASH = bcrypt.hashSync(CURRENT, 4);

const call = (body: unknown) =>
  PATCH(
    new Request("http://localhost/api/me/password", {
      method: "PATCH",
      body: JSON.stringify(body),
    })
  );

describe("changePasswordSchema", () => {
  it("accepts a valid change", () => {
    expect(
      changePasswordSchema.safeParse({
        current_password: CURRENT,
        new_password: NEXT,
      }).success
    ).toBe(true);
  });

  it("rejects a short new password", () => {
    expect(
      changePasswordSchema.safeParse({
        current_password: CURRENT,
        new_password: "short",
      }).success
    ).toBe(false);
  });

  it("rejects reusing the current password", () => {
    expect(
      changePasswordSchema.safeParse({
        current_password: CURRENT,
        new_password: CURRENT,
      }).success
    ).toBe(false);
  });
});

describe("PATCH /api/me/password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServerSession.mockResolvedValue({ user: { email: "s@mlrit.ac.in" } });
    maybeSingle.mockResolvedValue({
      data: { id: "u1", password_hash: HASH },
      error: null,
    });
    updateSelect.mockResolvedValue({ data: [{ id: "u1" }], error: null });
  });

  it("rejects signed-out requests", async () => {
    getServerSession.mockResolvedValue(null);
    const res = await call({ current_password: CURRENT, new_password: NEXT });
    expect(res.status).toBe(401);
    expect(update).not.toHaveBeenCalled();
  });

  it("rejects a wrong current password without writing", async () => {
    const res = await call({
      current_password: "not-it-000",
      new_password: NEXT,
    });
    expect(res.status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });

  it("stores a new hash that matches the new password", async () => {
    const res = await call({ current_password: CURRENT, new_password: NEXT });
    expect(res.status).toBe(200);
    const row = update.mock.calls[0][0] as { password_hash: string };
    expect(row.password_hash).not.toBe(NEXT);
    expect(await bcrypt.compare(NEXT, row.password_hash)).toBe(true);
  });

  it("reports a concurrent change instead of overwriting it", async () => {
    updateSelect.mockResolvedValue({ data: [], error: null });
    const res = await call({ current_password: CURRENT, new_password: NEXT });
    expect(res.status).toBe(400);
  });
});
