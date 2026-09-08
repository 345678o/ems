# EMS — Event Management System

Next.js 15 + TypeScript + Supabase + NextAuth.js platform for managing club
events with IIC-hosted and self-hosted event flows.

## Quick start

```powershell
cp .env.example .env.local   # fill in your keys (see docs/architecture.md)
npm install
npm run dev                  # http://localhost:3000
```

## Documentation

| Doc                                                              | Description                                                                           |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [docs/architecture.md](docs/architecture.md)                     | Tech stack, directory layout, auth & auth-z model, API routes, env vars, dev commands |
| [docs/club-dashboard.md](docs/club-dashboard.md)                 | Club dashboard structure, Calendar tab, DB schema for `club_event_calendar`           |
| [docs/supabase-storage-setup.md](docs/supabase-storage-setup.md) | Storage buckets, RLS policies, DB migrations, troubleshooting                         |

## Authentication

EMS uses [NextAuth.js v4](https://next-auth.js.org/) with a `CredentialsProvider` configured with a **domain-trust allowlist**:

- Email addresses ending in `@gmail.com` or `@mlrit.ac.in` are permitted to authenticate.
- User IDs are deterministically generated UUIDv5 values derived from the user's email address (`lib/utils/id.ts`), ensuring persistent foreign key relationships in Supabase (`public.users`, `public.clubs`).
- Passwords are not verified against a stored hash under the current domain-trust model; authentication upserts the user record into Supabase via the admin client.
- For architectural rationale, security details, and proposed migration options (e.g., implementing full bcrypt verification or Google OAuth), see [docs/auth-decision-needed.md](docs/auth-decision-needed.md).

## Build, lint & test

```powershell
npm run build    # production build (Turbopack)
npm run lint     # ESLint — must be clean before committing
npm test         # Unit tests (Vitest)
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on code style, naming conventions, and pull request verification.

## Environment variables

See [docs/architecture.md § Environment Variables](docs/architecture.md#environment-variables)
and [.env.example](.env.example) for the full list. The app throws a clear startup error for any missing required
variable — there are no silent fallbacks.
