# UI Audit — EMS (Next.js 15 + React 19 + Tailwind v4)

Audit only. No app code was changed for this document. Method: read code and CSS, `grep` counts, and rendered pages with headless Chromium against the running dev server (`localhost:3000`) at 1440 / 1024 / 768 / 390 px.

Legend: **[C]** confirmed in code/grep. **[R]** confirmed by rendering. **[V]** needs verification (could not be proven here).

Stack: Next 15.5 (Turbopack), React 19.1, Tailwind 4 via `@tailwindcss/postcss`, Radix + `@base-ui/react`, shadcn-style `components/ui`, next-auth 4, Supabase, lucide (68 imports) + tabler (2 imports), gsap / motion / three / ogl.
Scripts: `dev`, `build`, `lint`, `test` (vitest), `format`.
Branch has 21 modified + several untracked files (uncommitted redesign in progress).

---

## 1. Page inventory

| Route | Files | Shell / look | Auth |
|---|---|---|---|
| `/` | `app/page.tsx` | redirects to `/discover` | none |
| `/home` | `next.config.ts` redirect | redirects to `/discover` (see 7.1: its page file is dead) | none |
| `/discover` | `(showcase)/discover/page.tsx`, `components/discover/*` (HeroBanner, TrailerCard, EventCard, ExploreClubs, Sidebar, TopNavigation) | dark "dz" shell | none |
| `/events` | `(showcase)/events/page.tsx`, `EventCard` | dark dz | none |
| `/events/[id]` | `(showcase)/events/[id]/page.tsx` (335 lines) | dark dz | none |
| `/clubs` | `(showcase)/clubs/page.tsx` | dark dz | none |
| `/clubs/[clubId]` | `(showcase)/clubs/[clubId]/page.tsx` | dark dz | none |
| `/clubs/view/[clubId]` | 1-line page | — | [V] |
| `/calendar` | `(showcase)/calendar/page.tsx` → `calendar-integration.tsx` → `enhanced-event-calendar.tsx`, `iic-event-calendar.tsx` | dark dz, with `.dz-calendar` overrides | none |
| `/register` | `(showcase)/register/page.tsx` | dark dz | none |
| `/club`, `/club/profile`, `/club/event/[id]`, `/club/event/create` | `app/club/*`, `PillSidebar`, `ClubTopBar`, `components/club/*`, `event-info/*`, `after-event/*` | **separate light "club workspace" look** (navy header, pink sidebar) | client-side `useSession` only |
| `/dashboard` | `app/dashboard/*` | own look | server redirect |
| `/admin`, `/faculty` | `app/admin/page.tsx` + `admin-page.tsx`, `app/faculty/page.tsx` | own look | [V] guard |
| `/notifications` | `app/notifications/*` | own look | server redirect |
| `/user/profile` | `app/user/profile/*`, `user-profile.tsx` | own look | [V] guard |
| API | `/api/auth/*`, `events/create`, `me`, `partner/convert`, `storage/upload|delete` | — | — |

[R] Unauthenticated, `/dashboard /admin /faculty /notifications /user/profile` all redirect to `/discover`, so their visuals were **not** rendered. Everything said about them below is from code only.

---

## 2. Global design problems

| # | Problem | Where | Impact | Fix | Type |
|---|---|---|---|---|---|
| G1 | **Three unrelated design systems** live in one app: dark "dz" (discover/events/clubs/calendar/register), light navy/pink club workspace, and a legacy scrapbook/paper theme. | `components/discover/discover.css`, `app/club/layout.tsx` + `pill-sidebar.tsx`, `app/globals.css` (paper/torn/washi/polaroid) | App feels like 3 products; every new page must pick a side. | Decide one direction (recommend the dz dark system), map it to shared tokens, migrate club workspace in later phase. | [R][C] |
| G2 | **Tokens are not the source of truth.** `.dark {}` in `globals.css` is a byte-for-byte copy of `:root` (same light values). So `dark:` utilities (109 uses) and the theme toggle don't produce a coherent dark palette from tokens. The dz shell uses its own `--dz-*` variables instead. | `app/globals.css` (`:root` vs `.dark`), `components/theme-toggle.tsx`, `app/layout.tsx` inline theme script | Theme toggle and tokens disagree; pages hard-code `neutral-*` + `dark:` per element. | Pick one dark mechanism. Either give `.dark` real values or remove the toggle and standardize on the dz tokens. | [C] |
| G3 | **`tailwind.config.js` is dead.** Tailwind v4 only reads it with `@config`, and none exists in the CSS. It defines `primary: #F4A4BF`, `secondary`, `poppins`, which conflict with the real `--primary` (purple) and are never applied. | `tailwind.config.js` | Misleading; someone may edit it expecting effect. | Delete or port anything needed into `@theme`. | [C] (no `@config` found) |
| G4 | **Raw palette utilities bypass tokens**: `neutral-*` 515, `red-*` 111, `blue-*` 70, `zinc-*` 49, `gray-*` 32, `green-*` 31, `purple-*` 19, hex literals 98, `bg-gradient-to-*` 16. | across `app/`, `components/` | Inconsistent colors; recolor needs many edits. | Introduce semantic classes (`bg-surface`, `text-muted`, `border-subtle`, status colors) and migrate high-traffic files first. | [C] |
| G5 | **Arbitrary type sizes**: `text-[13px]` ×26, `text-[15px]` ×6, `text-[34px]`, `[28px]`, `[10px]`, `[11px]`. No type scale. Four+ font families loaded (DM Sans, Space Grotesk, Big Shoulders, Caveat, Geist Mono) plus Inter in the showcase layout. | `app/layout.tsx`, `(showcase)/layout.tsx` | Heavier font payload, inconsistent headings; sub-12px text hurts readability. | Define a type scale in `@theme`; drop unused families. [V] which of Big Shoulders/Caveat are still rendered. | [C]/[V] |
| G6 | **Inconsistent radii/cards.** `--radius: 0.375rem` base, dz cards use their own radii, club pages use `rounded-md/lg/xl/full` ad hoc. | `globals.css`, `discover.css`, pages | Slightly different corner language per area. | Single radius scale in tokens. | [C] |
| G7 | **`min-h-screen` ×27 and page-level gradient wrappers** inside pages that already sit in a shell. `.dz-calendar .min-h-screen` is a CSS patch for this. | `enhanced-event-calendar.tsx` (root `p-6 … bg-gradient-to-tl from-pink-300 …`), others | Double backgrounds, extra scroll height, light-gradient classes fighting the dark shell. | Remove per-page gradient/min-height wrappers; let the shell own the background. | [C] |

---

## 3. Page-specific visual problems

| Page / file | Observation | Impact | Fix | Type |
|---|---|---|---|---|
| `/calendar` — `enhanced-event-calendar.tsx` | Used `bg-blue-600` button and a `w-fit` month grid (199 px wide in an 800 px card); duplicate "Event Management Calendar" / "Enhanced Event Calendar" headings. | Off-palette, wasted space, redundant title. | **Already fixed in an earlier step** (width, button, title; controls moved to header via portal). Remaining: page-level gradient wrapper (G7), card title "Event Calendar" is also redundant. | [R] |
| `/discover` — `page.tsx:138-163` | "New events" panel is a fixed 340 px scroll list; cards looked clipped at the bottom. | Reads as a bug. | Fade mask added earlier; consider showing a scroll affordance or showing 2 full cards. | [R] |
| `/discover` — featured data | Event name "Woekshop Carnival" is a typo in the data, not the UI. | Content quality. | Fix in Supabase data. | [R] |
| `/discover` — `TrailerCard` | Cards with no real image render a pink gradient placeholder (same placeholder for the featured event and first list item). | Looks like a missing image. | Add a deliberate no-image treatment (initials/category color). | [R] |
| `/clubs` — `page.tsx:21` | Club cards are fixed `h-[168px]`; short names leave big empty area. Initials-only avatar for clubs without a logo. | Wasted space, especially phone. | Earlier change added min-height on phone. Consider content-driven height everywhere. | [R] |
| `/club` (workspace) | Renders at 1440: header title says **"User"**; the pink sidebar overlaps the navy top bar's left edge; empty state is one line of grey text with a large blank page; sidebar "Good vibes only ✦" tagline is decorative. `h1` count is 0 (title is not a heading). | Looks unfinished and unlike the rest of the app. | Own phase (see plan P5). | [R] |
| `/club` at 768 px | **Horizontal overflow of 75 px** (`scrollWidth − innerWidth = 75`) on `/club` and `/club/profile`. | Page scrolls sideways on tablets. | Likely `PILL_SIDEBAR_WIDTH` offset vs. content width in `app/club/layout.tsx`. Cause not yet confirmed. | [R] symptom, [V] cause |
| `app/club/profile/page.tsx` | 1,301 lines in one file. Not rendered (needs auth). | Hard to restyle safely. | Split before restyling. | [C] |
| `/dashboard`, `/admin`, `/faculty`, `/notifications`, `/user/profile` | Not rendered (redirect). Code uses many `dark:` + `neutral-*`/`red-*` classes. | Unknown actual look. | Render with a seeded session before any restyle. | [V] |

---

## 4. Inconsistencies (summary)

- **Colors:** purple primary (`--primary`) vs. blue buttons (70 `blue-*` uses) vs. orange accent vs. pink `primary` in the dead Tailwind config vs. navy club header.
- **Typography:** `font-display`, `font-heading`, `font-marker`, `font-sans`, Inter (`--font-dz`) mixed; arbitrary px sizes.
- **Spacing:** dz pages use `page-gutter` / dz paddings; club pages use `p-6`, `px-8`, etc.
- **Radii/shadows:** see G6; shadows defined per component.
- **Buttons:** `components/ui/button.tsx` default height `h-9` (36 px), sm `h-8` (32 px). dz pages mix shadcn `Button` and hand-built `dz-*` buttons.

## 5. Layout / overflow / responsive

- [R] Horizontal overflow only found at `/club`, `/club/profile` @768 (75 px). All `(showcase)` pages: 0 overflow at 1440/1024/768/390.
- [R] Mobile top-nav tab row is horizontally scrollable and the last tab ("Workshops") is clipped at 390 px; the right-edge fade added earlier is hard to see.
- [R] Small tap targets: ~3–4 interactive elements < 32 px per showcase page, ~10 on `/club` (counted by size; which ones is not itemized). [V] against 44 px guidance.
- [R] `/clubs/[clubId]` at 390 px has no `h1` (the count dropped from 1 to 0); desktop has one. Heading probably hidden or swapped responsively. [V]
- [C] Event routes depend on live Supabase data; empty/loading states were only seen as the populated state. [V]

## 6. Accessibility / interaction

| Issue | File | Impact | Fix | Type |
|---|---|---|---|---|
| Clickable `div` with `onClick`, no role/keyboard | `components/after-event/uploads-step-card.tsx:107` | Not keyboard accessible | Use `<button>` | [C] |
| `outline-none` ×19; at least 3 inputs (`user-profile.tsx:179,205,244`) and one select (`HomeHero.tsx:123`) have **no** visible replacement focus style | `user-profile.tsx`, `HomeHero.tsx` | Keyboard focus invisible | Add `focus-visible:ring` | [C] |
| `/club` pages have no `<h1>` (title is a styled `div`/span) | `club-topbar.tsx` | Screen-reader structure | Render title as `h1` | [R] (h1 count 0) |
| Muted text `text-zinc-400/500` on near-black in dz | `discover.css`, pages | Contrast likely 4–5:1 or lower for 11–13 px text | Measure with a contrast tool | [V] |
| `aria-label` on 43 of ~45 `<button>`s; icon-only buttons in dz look labelled | various | Mostly fine | Spot check | [C] |
| Images: all 5 `<img>` tags checked have `alt` (decorative ones use `alt=""`) | — | OK | none | [C] |
| Test failure: `tests/app-page.test.tsx` expects `redirect('/home')` but `app/page.tsx` now redirects to `/discover` (uncommitted change). | `tests/app-page.test.tsx` | Red test suite (1 failing earlier; 3 failing on a clean stash, so others depend on uncommitted code) | Update the test or revert the redirect | [C] |

## 7. Components to reuse / consolidate / remove

1. **Dead code, unreachable [C]:** `/home` redirects in `next.config.ts`, so `app/(showcase)/home/page.tsx` (398 lines), `components/ems/HomeHero.tsx` (583), `site-shell.tsx`, `GlobalNav.tsx`, `AppChrome.tsx`, `CloudSky`, `DroneModel`, `GalleryTunnel`, `LoadingScreen` and `app/(showcase)/ems-showcase.css` (1,529 lines, imported nowhere) appear unused. `AppChrome` has no importer. Verify `app/(showcase)/home/layout.tsx` (still does the club redirect) before removal.
2. **Zero importers found [C]:** `components/ui/focus-cards.tsx`, `polaroid.tsx` (only referenced in `globals.css`), `top-bar.tsx`, `events-navigation.tsx`, `events-quick-access.tsx`, `events-calendar-promotion.tsx`, `accordion-gallery.*`, `gradient-waves.*`, `logo-loop.*`, `fade-content.tsx`. Confirm no dynamic imports, then remove. Removing them also lets `gsap`, `three`, `ogl` drop if nothing else uses them (`DroneModel`, `GalleryTunnel`, `admin-page`, `sidebar`, `pill-sidebar` still import some).
3. **Duplicate sidebars:** `components/sidebar.tsx`, `components/ui/sidebar.tsx`, `components/ui/pill-sidebar.tsx`, `components/discover/Sidebar.tsx`. Consolidate to the two that are in use (dz + club).
4. **Duplicate card/badge patterns:** `EventCard`, `TrailerCard`, `self-event-card`, `iic-card`, `add-event-card`, `ui/card`, `category-badge`, `ui/badge`, `dz-chip`. Define one card + one chip primitive.
5. **Oversized files:** `app/club/profile/page.tsx` 1,301; `enhanced-event-calendar.tsx` 716; `event-creation-page.tsx` 487; `event-report-dialog.tsx` 451; `option-wheel.tsx` 431.
6. **Keep:** Radix/shadcn primitives in `components/ui` (button, input, select, dialog, tabs, popover, calendar); dz components.

## 8. Prioritized plan (small, verifiable phases)

Each phase: render at 1440/1024/768/390, run `tsc`, `npm test`, lint, and compare with this audit.

- **P0 — Baseline & cleanup (no visual change).** Fix/update the failing redirect test; commit or stash the in-progress redesign so diffs are reviewable. Verify: tests green.
- **P1 — Tokens.** One source of truth in `@theme` / `:root`: surfaces, text, border, status, radius, type scale. Delete/port `tailwind.config.js`. Resolve the `.dark` duplication (G2). Verify: no visual change on dz pages.
- **P2 — Dead code removal (7.1, 7.2).** Remove in small commits after a repo-wide check. Verify: `build` passes, routes still render.
- **P3 — Shared primitives.** One Card, Chip, Button sizes, form field with visible focus; replace `outline-none` without focus replacement (§6). Verify: keyboard tab-through.
- **P4 — dz pages polish.** Calendar page remaining items, no-image placeholder, mobile nav scroll affordance, club card heights, tap targets ≥ 40 px, contrast check.
- **P5 — Club workspace.** Fix 768 px overflow, header title/`h1`, sidebar/header overlap, empty states; then restyle to the chosen system. Split `club/profile/page.tsx` first.
- **P6 — Auth-gated pages.** Render with a seeded session, then audit and restyle `/dashboard`, `/admin`, `/faculty`, `/notifications`, `/user/profile`.

## 9. Risks

- **Uncommitted work:** 21 modified + untracked files, including auth (`lib/auth`, `api/auth/*`, `tests/credentials-auth.test.ts`). UI edits must not touch these.
- **Auth redirects** (`home/layout.tsx` sends club accounts to `/club`) and role checks must survive removal of "dead" files; `home/layout.tsx` is not dead logic.
- **Supabase-driven pages** depend on real data; do not replace with mocks. Several pages are `"use client"` and fetch in the browser.
- **Theme:** removing/rewriting `.dark` or the toggle can change club/admin pages that rely on `dark:` classes (109 uses).
- **Heavy libs** (`three`, `gsap`, `ogl`) — removing them needs a full import search including `components/originkit/ui/ring-gallery.tsx`.
- **No visual regression suite**; verification is manual screenshots.
- **Dev server was already running** (`localhost:3000`) and was used read-only.

## 10. Not verified

Authenticated pages (dashboard/admin/faculty/notifications/user profile and `/club` with real data), loading/error/empty states, contrast ratios, dark-mode toggle behavior, real tap-target list, the cause of the 768 px overflow.
