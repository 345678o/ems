/**
 * lib/auth/password.ts
 *
 * Password hashing helpers built on bcryptjs. Server-only.
 */

import bcrypt from "bcryptjs";

export const BCRYPT_ROUNDS = 12;

// Precomputed hash of a random string. Compared against when the account does
// not exist (or has no password) so the response time does not reveal which
// emails are registered.
const DUMMY_HASH =
  "$2b$12$AmfM6xYT3rPkRNp/QYOZJekspv.wMTptnH9TVOOfdP.BdtOH2VFKe";

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Returns true only when `hash` is a real hash and `password` matches it.
 * A missing hash always returns false, after doing the same amount of work.
 */
export async function verifyPassword(
  password: string,
  hash: string | null | undefined
): Promise<boolean> {
  if (!hash) {
    await bcrypt.compare(password, DUMMY_HASH);
    return false;
  }
  return bcrypt.compare(password, hash);
}
