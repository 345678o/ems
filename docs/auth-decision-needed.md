# Authentication Architecture Decision

## Current Behavior & Discrepancies

In [`app/api/auth/[...nextauth]/route.ts`](../app/api/auth/[...nextauth]/route.ts), the credentials `authorize()` function currently operates as follows:

1. **Domain Allowlist Bypass**:
   - Any email with a domain ending in `gmail.com` or `mlrit.ac.in` is authenticated **immediately without any password verification**.
   - A deterministic UUID is computed from the email address (`googleSubToUuid(email)`), and the user is signed in directly.
2. **Registration Password Dropping**:
   - The registration schema (`registerSchema`) collects and validates password requirements on the frontend and API.
   - However, the submitted password is **never hashed and never stored** anywhere.
3. **Unused Infrastructure**:
   - The database schema includes a `password_hash` column (added via migrations).
   - `bcryptjs` is installed as a production dependency.
   - Neither the migration column nor the library is currently utilized in the authentication flow.

---

## Options for Resolution

### Option A: Fully Commit to Domain-Trust Authentication

Align the code with the reality that authentication is domain-verified rather than password-based.

- **Code Changes Implied**:
  - Remove the `password` and `confirmPassword` fields from `registerSchema`, the registration API, and frontend registration forms.
  - Remove `bcryptjs` and `@types/bcryptjs` from dependencies.
  - Remove references to the `password_hash` column in Supabase migrations/types.
  - Document clearly in [`README.md`](../README.md) that authentication relies on verified organizational/domain email identity rather than secret credentials.

---

### Option B: Fully Implement Password Authentication

Implement standard, secure password-based credential authentication for all users across all domains.

- **Code Changes Implied**:
  - In the user registration action/route (`app/api/auth/register`), hash the supplied password using `bcryptjs` (e.g. `await bcrypt.hash(password, 10)`).
  - Store the computed hash into the `password_hash` column of the `users` table in Supabase.
  - In `authorize()` in [`app/api/auth/[...nextauth]/route.ts`](../app/api/auth/[...nextauth]/route.ts):
    - Query the `password_hash` column from the database for the given email.
    - Validate using `await bcrypt.compare(credentials.password, user.password_hash)`.
    - Completely remove the domain-allowlist bypass (`ALLOWED_DOMAINS`) so all accounts require a valid password.

---

### Option C: Hybrid Authentication

Retain domain-trust authentication for pre-approved organizations/domains while supporting real password credentials for others.

- **Code Changes Implied**:
  - Make the domain allowlist configurable via an environment variable (e.g., `AUTH_ALLOWED_DOMAINS="gmail.com,mlrit.ac.in"`) rather than hardcoding it in source code.
  - For users within the allowlisted domains, allow direct domain-trust sign-in.
  - For users outside the allowlisted domains (or for all regular credential sign-ins):
    - Require password creation on register, hash with `bcryptjs`, and save to `password_hash`.
    - Verify with `bcrypt.compare()` in `authorize()` before granting a session.
