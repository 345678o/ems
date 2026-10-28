/**
 * tests/credentials-auth.test.ts
 *
 * Unit tests for password auth: authorizeCredentials (lib/auth/credentials.ts)
 * and POST /api/auth/register.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

const maybeSingle = vi.fn();
const insert = vi.fn();
const update = vi.fn();
const updateSelect = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: () => ({ eq: () => ({ maybeSingle }) }),
      insert,
      update: (row: unknown) => {
        update(row);
        return { eq: () => ({ is: () => ({ select: updateSelect }) }) };
      },
    })),
  },
}));

vi.mock("@/lib/logger", () => ({
  default: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { authorizeCredentials } from "@/lib/auth/credentials";
import { POST as register } from "@/app/api/auth/register/route";
import { googleSubToUuid } from "@/lib/utils/id";

const EMAIL = "student@mlrit.ac.in";
const PASSWORD = "correct-horse-battery";
// Low cost factor keeps the tests fast; verifyPassword reads it from the hash.
const HASH = bcrypt.hashSync(PASSWORD, 4);

function dbUser(overrides: Record<string, unknown> = {}) {
  return {
    id: googleSubToUuid(EMAIL),
    email: EMAIL,
    full_name: "Student One",
    avatar_url: null,
    password_hash: HASH,
    ...overrides,
  };
}

describe("authorizeCredentials", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the user when the password matches", async () => {
    maybeSingle.mockResolvedValue({ data: dbUser(), error: null });
    const user = await authorizeCredentials({
      email: "  Student@MLRIT.ac.in ",
      password: PASSWORD,
    });
    expect(user).toEqual({
      id: googleSubToUuid(EMAIL),
      name: "Student One",
      email: EMAIL,
      image: null,
    });
  });

  it("rejects a wrong password", async () => {
    maybeSingle.mockResolvedValue({ data: dbUser(), error: null });
    expect(
      await authorizeCredentials({ email: EMAIL, password: "wrong-password" })
    ).toBeNull();
  });

  it("rejects an account with no password_hash", async () => {
    maybeSingle.mockResolvedValue({
      data: dbUser({ password_hash: null }),
      error: null,
    });
    expect(
      await authorizeCredentials({ email: EMAIL, password: "anything123" })
    ).toBeNull();
  });

  it("rejects an unknown email", async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null });
    expect(
      await authorizeCredentials({ email: EMAIL, password: PASSWORD })
    ).toBeNull();
  });

  it("rejects a missing password without hitting the DB", async () => {
    expect(
      await authorizeCredentials({ email: EMAIL, password: "" })
    ).toBeNull();
    expect(maybeSingle).not.toHaveBeenCalled();
  });

  it("rejects on DB error", async () => {
    maybeSingle.mockResolvedValue({ data: null, error: { message: "boom" } });
    expect(
      await authorizeCredentials({ email: EMAIL, password: PASSWORD })
    ).toBeNull();
  });
});

describe("POST /api/auth/register", () => {
  beforeEach(() => vi.clearAllMocks());

  const req = (body: unknown) =>
    new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }) as never;

  it("stores a bcrypt hash, never the plain password", async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null });
    insert.mockResolvedValue({ error: null });

    const res = await register(
      req({ email: EMAIL, password: PASSWORD, full_name: "Student One" })
    );
    expect(res.status).toBe(201);

    const row = insert.mock.calls[0][0];
    expect(row.email).toBe(EMAIL);
    expect(row.password).toBeUndefined();
    expect(row.password_hash).not.toBe(PASSWORD);
    expect(await bcrypt.compare(PASSWORD, row.password_hash)).toBe(true);
  });

  it("rejects an existing email that already has a password", async () => {
    maybeSingle.mockResolvedValue({
      data: { id: "x", password_hash: HASH },
      error: null,
    });
    const res = await register(
      req({ email: EMAIL, password: PASSWORD, full_name: "Student One" })
    );
    expect(res.status).toBe(400);
    expect(insert).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("claims a legacy account that has no password_hash", async () => {
    maybeSingle.mockResolvedValue({
      data: { id: "legacy-id", password_hash: null },
      error: null,
    });
    updateSelect.mockResolvedValue({
      data: [{ id: "legacy-id" }],
      error: null,
    });

    const res = await register(
      req({ email: EMAIL, password: PASSWORD, full_name: "Student One" })
    );
    expect(res.status).toBe(200);
    expect(insert).not.toHaveBeenCalled();
    const row = update.mock.calls[0][0];
    expect(await bcrypt.compare(PASSWORD, row.password_hash)).toBe(true);
    const body = await res.json();
    expect(body.data.id).toBe("legacy-id");
  });

  it("rejects a legacy claim that lost the race", async () => {
    maybeSingle.mockResolvedValue({
      data: { id: "legacy-id", password_hash: null },
      error: null,
    });
    updateSelect.mockResolvedValue({ data: [], error: null });
    const res = await register(
      req({ email: EMAIL, password: PASSWORD, full_name: "Student One" })
    );
    expect(res.status).toBe(400);
  });

  it("maps a unique-violation race to 400", async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null });
    insert.mockResolvedValue({ error: { code: "23505", message: "dup" } });
    const res = await register(
      req({ email: EMAIL, password: PASSWORD, full_name: "Student One" })
    );
    expect(res.status).toBe(400);
  });
});
