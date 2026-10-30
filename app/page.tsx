import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import { getServerSession } from "next-auth";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import "@/components/discover/discover.css";
import "./landing.css";
import logger from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import GradientASCII from "@/components/ui/gradient-ascii";
import { DiscoverEventCard } from "@/components/discover/DiscoverEventCard";
import {
  EVENT_FIELDS,
  eventLocation,
  toDiscoverEvents,
  type DiscoverEvent,
} from "@/components/discover/types";

const inter = Inter({ subsets: ["latin"], variable: "--font-dz" });
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-lp-display",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-lp-mono",
});

export const metadata = {
  title: "EMS.MLRIT — Campus events at MLR Institute of Technology",
  description:
    "Discover workshops, hackathons, fests and club events at MLRIT. Register, track your bookings and never miss what's on.",
};

// Counts and the event preview are cached briefly; the page stays static-fast.
export const revalidate = 300;

// Dates render on the server (UTC on Vercel), so pin the campus time zone.
const TZ = "Asia/Kolkata";

/** What each role gets. Mirrors the per-role sidebar menus. */
const ROLES = [
  {
    icon: GraduationCap,
    who: "Students",
    title: "Find it, book it, show up.",
    points: [
      "One feed for every club",
      "Passes in My bookings",
      "Updates when plans change",
    ],
    href: "/discover",
    cta: "Browse events",
  },
  {
    icon: Building2,
    who: "Clubs",
    title: "Run events without the spreadsheet.",
    points: [
      "Create and submit events",
      "Approve participants",
      "Post-event reports",
    ],
    href: "/club",
    cta: "Club workspace",
  },
  {
    icon: BadgeCheck,
    who: "Admin",
    title: "Approve what goes live.",
    points: [
      "Review club submissions",
      "Manage the IIC calendar",
      "One source of truth",
    ],
    href: "/admin",
    cta: "Admin console",
  },
];

const STEPS = [
  {
    title: "Find",
    text: "Browse by club, category or date — or search for exactly what you want.",
  },
  {
    title: "Register",
    text: "One tap to book. Your pass lands in My bookings, ready at the door.",
  },
  {
    title: "Show up",
    text: "Show your pass at the door. The club sees you on its attendee list.",
  },
];

/** Real numbers and the next few events; null when the database is unreachable. */
async function loadOverview() {
  try {
    const supabase = await createClient();
    const now = Date.now();
    const nowIso = new Date(now).toISOString();
    const [events, clubs, upcomingCount, upcoming] = await Promise.all([
      supabase
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("status", "approved"),
      supabase.from("clubs").select("id", { count: "exact", head: true }),
      supabase
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("status", "approved")
        .gte("start_datetime", nowIso),
      supabase
        .from("events")
        .select(EVENT_FIELDS)
        .eq("status", "approved")
        .gte("start_datetime", nowIso)
        .order("start_datetime", { ascending: true })
        .limit(8),
    ]);
    const failed = [events, clubs, upcomingCount, upcoming].find(
      (r) => r.error
    );
    if (failed) {
      logger.error("[landing] overview error:", failed.error?.message);
      return null;
    }
    let shown: DiscoverEvent[] = toDiscoverEvents(upcoming.data);
    const hasUpcoming = shown.length > 0;
    // Nothing scheduled yet: show the most recent events instead, labelled so.
    if (!hasUpcoming) {
      const recent = await supabase
        .from("events")
        .select(EVENT_FIELDS)
        .eq("status", "approved")
        .order("start_datetime", { ascending: false })
        .limit(8);
      shown = recent.error ? [] : toDiscoverEvents(recent.data);
    }
    return {
      eventCount: events.count ?? 0,
      clubCount: clubs.count ?? 0,
      upcomingCount: upcomingCount.count ?? 0,
      // Hero ticket: the next event, else the latest one.
      featured: shown[0] ?? null,
      ticker: [...new Set(shown.map((e) => e.name.trim()))].filter(Boolean),
      preview: shown.slice(0, 3),
      hasUpcoming,
      now,
    };
  } catch (e) {
    // Let Next's own signals (e.g. "this route reads cookies") through.
    unstable_rethrow(e);
    logger.error("[landing] overview failed:", e);
    return null;
  }
}

function dateParts(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  const part = (o: Intl.DateTimeFormatOptions) =>
    d.toLocaleString("en-IN", { timeZone: TZ, ...o });
  return {
    day: part({ day: "2-digit" }),
    month: part({ month: "short" }).toUpperCase(),
    weekday: part({ weekday: "long" }),
    time: part({ hour: "numeric", minute: "2-digit" }).toUpperCase(),
  };
}

/** An approved event, drawn as an admit-one ticket. */
function EventTicket({
  event,
  label,
}: {
  event: DiscoverEvent;
  label: string;
}) {
  const when = dateParts(event.start_datetime);
  const where = eventLocation(event);
  return (
    <Link
      href={`/events/${event.id}`}
      className="lp-ticket group block w-full max-w-sm p-6 pb-5"
      aria-label={`${label}: ${event.name}`}
    >
      <div className="flex items-center justify-between">
        <span className="lp-mono text-[11px] uppercase text-[var(--dz-accent)]">
          ● {label}
        </span>
        <ArrowUpRight
          className="size-4 text-zinc-500 transition-colors group-hover:text-white"
          aria-hidden
        />
      </div>
      <div className="mt-5 flex items-start gap-4">
        {when && (
          <div className="shrink-0 text-center">
            <div className="lp-display text-5xl font-bold leading-none tabular-nums">
              {when.day}
            </div>
            <div className="lp-mono mt-1 text-xs text-zinc-400">
              {when.month}
            </div>
          </div>
        )}
        <div className="min-w-0">
          <p className="lp-display line-clamp-2 text-xl font-semibold leading-tight">
            {event.name}
          </p>
          {event.club?.name && (
            <p className="mt-1 truncate text-sm text-zinc-400">
              by {event.club.name}
            </p>
          )}
        </div>
      </div>
      {/* Space for the tear line at 68%. */}
      <div className="h-10" />
      <div className="lp-ticket-tear" aria-hidden />
      <dl className="lp-mono grid grid-cols-2 gap-3 pt-3 text-[11px] uppercase">
        <div className="min-w-0">
          <dt className="text-zinc-500">When</dt>
          <dd className="mt-0.5 truncate text-zinc-200">
            {when ? `${when.weekday.slice(0, 3)} · ${when.time}` : "TBA"}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-zinc-500">Where</dt>
          <dd className="mt-0.5 truncate text-zinc-200">{where || "TBA"}</dd>
        </div>
      </dl>
    </Link>
  );
}

function Ticker({ items }: { items: string[] }) {
  // Repeat short lists so one copy is wider than the screen, then double it
  // for the seamless -50% loop.
  const base = Array.from(
    { length: Math.max(1, Math.ceil(12 / items.length)) },
    () => items
  ).flat();
  const loop = [...base, ...base];
  return (
    <div
      className="lp-marquee overflow-hidden border-y border-[var(--dz-border)] bg-[var(--dz-surface-1)] py-4"
      style={{ ["--lp-marquee-s" as string]: `${base.length * 4}s` }}
    >
      <ul className="lp-marquee-track" aria-hidden>
        {loop.map((name, i) => (
          <li
            key={i}
            className="lp-display flex shrink-0 items-center gap-6 pr-6 text-lg font-semibold text-zinc-300 sm:text-2xl"
          >
            {name}
            <Sparkles
              className="size-4 text-[var(--dz-accent)]"
              strokeWidth={1.75}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function LandingPage() {
  const [session, overview] = await Promise.all([
    getServerSession(authOptions),
    loadOverview(),
  ]);
  const signedIn = !!session?.user;

  return (
    <div
      className={`${inter.variable} ${display.variable} ${mono.variable} dz dark lp`}
    >
      {/* Top bar: brand + two actions. The app's sidebar lives inside. */}
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex h-16 max-w-page items-center justify-between px-4 md:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-[rgba(255,122,80,0.14)] ring-1 ring-[rgba(255,122,80,0.3)]">
              <span className="size-2.5 rounded-full bg-[var(--dz-accent)]" />
            </span>
            <span>
              EMS<span className="text-faint">.MLRIT</span>
            </span>
          </Link>
          <nav aria-label="Get started" className="flex items-center gap-2">
            {signedIn ? (
              <Link href="/discover" className="dz-btn dz-btn--accent h-9">
                Open app
              </Link>
            ) : (
              <>
                <Link
                  href="/discover"
                  className="dz-btn h-9 px-3 text-zinc-300 hover:text-white max-sm:hidden"
                >
                  Browse events
                </Link>
                <Link href="/register" className="dz-btn dz-btn--ghost h-9">
                  Sign in
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative isolate flex min-h-[92svh] items-center overflow-hidden">
          <GradientASCII
            className="!absolute inset-0 -z-10"
            colors={["#7c2d12", "#ea580c", "#ff7a50", "#fff1ea"]}
            shape="rise"
            characters=" .:-=+*#%@"
            cellSize={16}
            density={0.9}
            glyphOpacity={1}
            gradientOpacity={1}
            glow={0.7}
            softness={0.8}
            flow={0.6}
            speed={0.7}
            clickEffect="wave"
          />
          {/* Orange glow behind the art, top right. */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(55%_65%_at_88%_28%,rgba(234,88,12,0.28),transparent_70%)]"
          />
          {/* Darken the left side so the headline reads over the art. */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(11,11,13,0.92)_0%,rgba(11,11,13,0.7)_45%,rgba(11,11,13,0.2)_100%)] max-lg:bg-[rgba(11,11,13,0.72)]"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-[var(--dz-bg)] to-transparent"
          />

          <div className="mx-auto grid w-full max-w-page items-center gap-12 px-4 pb-20 pt-28 md:px-8 lg:grid-cols-[1.35fr_1fr]">
            <div>
              <p
                className="lp-rise lp-mono text-xs uppercase tracking-[0.2em] text-[var(--dz-accent)]"
                style={{ ["--d" as string]: 0 }}
              >
                MLR Institute of Technology · Events
              </p>
              <h1
                className="lp-rise lp-display mt-5 text-[clamp(2.75rem,7.5vw,5.75rem)] font-extrabold leading-[0.95] tracking-[-0.04em]"
                style={{ ["--d" as string]: 80 }}
              >
                Every campus event,{" "}
                <span className="lp-underline">one&nbsp;place.</span>
              </h1>
              <p
                className="lp-rise mt-6 max-w-lg text-base text-zinc-300 sm:text-lg"
                style={{ ["--d" as string]: 160 }}
              >
                Workshops, hackathons, fests and club meetups from across MLRIT.
                Register in a tap and keep everything you&apos;re going to in
                one list.
              </p>
              <div
                className="lp-rise mt-8 flex flex-wrap gap-3"
                style={{ ["--d" as string]: 240 }}
              >
                <Link
                  href="/discover"
                  className="dz-btn dz-btn--accent h-12 px-6 text-[15px]"
                >
                  Explore events
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                {!signedIn && (
                  <Link
                    href="/register?mode=signup"
                    className="dz-btn dz-btn--ghost h-12 px-6 text-[15px]"
                  >
                    Create an account
                  </Link>
                )}
              </div>

              {overview && (
                <dl
                  className="lp-rise mt-12 flex flex-wrap gap-x-10 gap-y-4"
                  style={{ ["--d" as string]: 320 }}
                >
                  {(
                    [
                      ["Events", overview.eventCount],
                      ["Clubs", overview.clubCount],
                      ["Coming up", overview.upcomingCount],
                    ] as const
                  )
                    // A zero "coming up" reads as a dead campus; skip it.
                    .filter(([, value]) => value > 0)
                    .map(([label, value]) => (
                      <div
                        key={label}
                        className="flex flex-col-reverse border-l-2 border-[var(--dz-accent)] pl-3"
                      >
                        <dt className="lp-mono text-[11px] uppercase text-zinc-400">
                          {label}
                        </dt>
                        <dd className="lp-display text-3xl font-bold tabular-nums sm:text-4xl">
                          {value}
                        </dd>
                      </div>
                    ))}
                </dl>
              )}
            </div>

            {overview?.featured && (
              <div
                className="lp-rise flex justify-center lg:justify-end"
                style={{ ["--d" as string]: 400 }}
              >
                <EventTicket
                  event={overview.featured}
                  label={overview.hasUpcoming ? "Next up" : "Latest event"}
                />
              </div>
            )}
          </div>
        </section>

        {overview && overview.ticker.length >= 3 && (
          <Ticker items={overview.ticker} />
        )}

        {/* One app, three roles */}
        <section
          aria-labelledby="roles-heading"
          className="mx-auto max-w-page px-4 py-20 md:px-8 md:py-28"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="lp-mono text-xs uppercase tracking-[0.2em] text-[var(--dz-accent)]">
                Made for everyone on campus
              </p>
              <h2
                id="roles-heading"
                className="lp-display mt-3 max-w-xl text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-5xl"
              >
                One app. Your view depends on who you are.
              </h2>
            </div>
            <p className="max-w-sm text-sm text-zinc-400">
              Sign in and EMS opens the right workspace for your role — no extra
              links, no clutter.
            </p>
          </div>

          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {ROLES.map(({ icon: Icon, who, title, points, href, cta }, i) => (
              <li key={who}>
                <Link
                  href={href}
                  className="dz-card lp-role group flex h-full flex-col p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-xl bg-[rgba(255,122,80,0.12)] text-[var(--dz-accent)] ring-1 ring-[rgba(255,122,80,0.22)]">
                      <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                    </span>
                    <span className="lp-mono text-[11px] text-zinc-500">
                      0{i + 1}
                    </span>
                  </div>
                  <p className="lp-mono mt-6 text-[11px] uppercase tracking-[0.15em] text-zinc-400">
                    {who}
                  </p>
                  <p className="lp-display mt-1.5 text-xl font-semibold leading-snug">
                    {title}
                  </p>
                  <ul className="mt-4 space-y-1.5 text-sm text-zinc-400">
                    {points.map((p) => (
                      <li key={p} className="flex gap-2">
                        <span
                          aria-hidden
                          className="mt-[0.55em] size-1 shrink-0 rounded-full bg-[var(--dz-accent)]"
                        />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-auto flex items-center gap-1 pt-6 text-ui font-medium text-zinc-300 transition-colors group-hover:text-[var(--dz-accent)]">
                    {cta}
                    <ArrowRight
                      className="size-3.5 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section
          aria-labelledby="steps-heading"
          className="border-y border-[var(--dz-border)] bg-[var(--dz-surface-1)]"
        >
          <div className="mx-auto max-w-page px-4 py-20 md:px-8">
            <h2
              id="steps-heading"
              className="lp-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl"
            >
              From poster to front row.
            </h2>
            <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-6">
              {STEPS.map(({ title, text }, i) => (
                <li key={title} className="relative flex gap-5">
                  <span
                    aria-hidden
                    className="lp-step-num text-7xl sm:text-8xl"
                  >
                    {i + 1}
                  </span>
                  <div className="pt-1">
                    <p className="lp-display text-xl font-semibold">{title}</p>
                    <p className="mt-2 max-w-xs text-sm text-zinc-400">
                      {text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Event preview (real data only) */}
        {overview && overview.preview.length > 0 && (
          <section
            aria-labelledby="preview-heading"
            className="mx-auto max-w-page px-4 py-20 md:px-8"
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2
                id="preview-heading"
                className="lp-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl"
              >
                {overview.hasUpcoming ? "Coming up next" : "Recent events"}
              </h2>
              <Link
                href="/events"
                className="flex items-center gap-1 text-ui text-zinc-400 transition-colors hover:text-white"
              >
                View all events
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {overview.preview.map((e, i) => (
                <DiscoverEventCard
                  key={e.id}
                  event={e}
                  index={i}
                  now={overview.now}
                />
              ))}
            </div>
          </section>
        )}

        {/* Organizer call-out */}
        <section className="mx-auto max-w-page px-4 pb-24 md:px-8">
          <div className="relative isolate overflow-hidden rounded-[var(--dz-r-lg,18px)] border border-[rgba(255,122,80,0.3)] bg-[radial-gradient(ellipse_80%_120%_at_100%_0%,rgba(255,122,80,0.28),transparent_60%),var(--dz-surface-1)] p-8 sm:p-12">
            <p className="lp-mono text-xs uppercase tracking-[0.2em] text-[var(--dz-accent)]">
              For organizers
            </p>
            <h2 className="lp-display mt-3 max-w-2xl text-3xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-5xl">
              Run a club? Put your next event on the board.
            </h2>
            <p className="mt-4 max-w-lg text-zinc-300">
              Submit events for approval, manage registrations and share reports
              — all from your club workspace.
            </p>
            <Link
              href={
                signedIn ? "/user/profile?tab=partner" : "/register?mode=signup"
              }
              className="dz-btn dz-btn--accent mt-8 h-12 px-6 text-[15px]"
            >
              Become an organizer
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <span
              aria-hidden
              className="lp-display pointer-events-none absolute -bottom-10 -right-4 -z-10 select-none text-[10rem] font-extrabold leading-none text-white/[0.03] sm:text-[14rem]"
            >
              EMS
            </span>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--dz-border)]">
        <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-faint md:px-8">
          <p>EMS.MLRIT · Event management for MLR Institute of Technology</p>
          <nav aria-label="Footer" className="flex gap-4">
            <Link href="/discover" className="hover:text-white">
              Discover
            </Link>
            <Link href="/calendar" className="hover:text-white">
              Calendar
            </Link>
            <Link href="/clubs" className="hover:text-white">
              Clubs
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
