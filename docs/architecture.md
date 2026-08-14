# Architecture & Development Guide

> Consolidated from `WARP.md`. Kept verbatim where accurate; outdated paths
> updated to reflect the refactored codebase.

## Project Overview

**Event Management System (EMS)** — built with Next.js 15 (App Router),
TypeScript, Supabase, and NextAuth.js. Manages events for clubs across two
hosting models:

- **IIC-hosted** — events managed by IIC (Innovation and Incubation Center);
  clubs have restricted access (report submission only).
- **Self-hosted** — created and managed by clubs with full control.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| UI | Tailwind CSS 4, Radix UI, shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Auth | NextAuth.js v4 (Credentials provider, bcrypt) |
| Animation | Motion (Framer Motion successor) |
| Icons | Lucide React, Tabler Icons |

---

## Directory Structure

```
app/                   Next.js App Router pages
├── club/              Club dashboard + event management
├── admin/             IIC admin panel
├── home/              Public landing page
├── user/              User profile
└── api/               API routes (auth, events, storage, me, partner)

components/            Reusable React components
├── ui/                shadcn/ui base components
├── club/              Club-specific sub-components + hooks
├── after-event/       After-event stepper sub-components
├── event-info/        Event info tab sub-components
├── iic-calendar/      IIC calendar sub-components
└── tickets/           Ticket display components

lib/
├── api/               Shared API helpers (response.ts, schemas.ts)
├── supabase/          Supabase clients (browserClient, server, admin)
└── logger.ts          Centralised logging shim (LOG_LEVEL-aware)

types/
├── database.ts        Hand-written DB types (run supabase gen types to replace)
└── next-auth.d.ts     Session type augmentation (session.user.id)
```

---

## Key Architectural Patterns

### Event lifecycle
1. Club submits event via `POST /api/events/create` (auth + ownership checks).
2. Event starts in `status: "pending_approval"`.
3. Admin approves/rejects via the admin panel.
4. After the event the club submits an after-event report (3-step stepper).

### Authentication flow
- NextAuth `CredentialsProvider` with **bcrypt** password verification.
- User's UUID is a deterministic `uuidv5` of their email (`lib/utils/id.ts`).
- `session.user.id` is typed in `types/next-auth.d.ts` — no casts needed.
- All API routes guard with `getServerSession(authOptions)`.

### Authorization model
- Storage upload/delete: path must start with `${session.user.id}/`.
- Event creation: `clubs.user_id` must match the session user.
- Admin routes: checked via user role stored in `public.users`.

### Supabase clients

| Client | File | Key |
|---|---|---|
| Browser (anon) | `lib/supabase/browserClient.ts` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Server (anon + cookies) | `lib/supabase/server.ts` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Admin (service role) | `lib/supabase/admin.ts` | `SUPABASE_SERVICE_ROLE_KEY` |

Both `lib/supabase/admin.ts` and `lib/api/response.ts` throw at startup if
required env vars are missing — there are no silent fallbacks.

---

## API Routes

| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/events/create` | POST | Session + club ownership | Create event with PDF blueprint |
| `/api/storage/upload` | POST | Session + path ownership | Upload user file to allowed bucket |
| `/api/storage/delete` | POST | Session + path ownership | Delete user file from allowed bucket |
| `/api/me` | GET / PATCH | Session | Read / update own profile |
| `/api/partner/convert` | PATCH | Session | Promote own account to club role |

All routes use shared helpers from `lib/api/response.ts` (`ok`, `created`,
`unauthorized`, `forbidden`, `validationError`, etc.) and validate inputs with
Zod schemas from `lib/api/schemas.ts`.

---

## Environment Variables

Add these to `.env.local` (never commit real values):

```
NEXTAUTH_SECRET=          # openssl rand -base64 32
NEXTAUTH_URL=             # http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

LOG_LEVEL=debug           # debug | info | warn | error | silent
```

---

## Common Dev Commands

```powershell
npm run dev       # dev server (Turbopack)
npm run build     # production build (Turbopack)
npm run lint      # ESLint
```

---

## Database Migrations

Migration files live in `supabase/migrations/`. Run them in the Supabase SQL
Editor or via the Supabase CLI:

```bash
supabase db push
```

After running all migrations, regenerate types:

```bash
supabase gen types typescript --local > types/database.ts
```

---

## Styling Conventions

- Tailwind classes; dark mode via `class` strategy (`next-themes`).
- Custom palette: primary `#F4A4BF`, secondary `#A652BC`.
- shadcn/ui "New York" style (`components.json`).

---

## Testing Events (Manual)

1. Sign up → verify a club account exists in `public.clubs`.
2. Create a self-hosted event (PDF ≤ 200 KB) → confirm `status: pending_approval`.
3. Approve via admin panel → confirm card shows in club dashboard.
4. Submit after-event report (all 3 steps) → check `after_event_reports` row.
5. Add an IIC event to calendar → verify it appears in the Calendar tab.
