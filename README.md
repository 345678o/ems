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

| Doc | Description |
|---|---|
| [docs/architecture.md](docs/architecture.md) | Tech stack, directory layout, auth & auth-z model, API routes, env vars, dev commands |
| [docs/club-dashboard.md](docs/club-dashboard.md) | Club dashboard structure, Calendar tab, DB schema for `club_event_calendar` |
| [docs/supabase-storage-setup.md](docs/supabase-storage-setup.md) | Storage buckets, RLS policies, DB migrations, troubleshooting |

## Build & lint

```powershell
npm run build    # production build (Turbopack)
npm run lint     # ESLint — must be clean before committing
```

## Environment variables

See [docs/architecture.md § Environment Variables](docs/architecture.md#environment-variables)
for the full list. The app throws a clear startup error for any missing required
variable — there are no silent fallbacks.
