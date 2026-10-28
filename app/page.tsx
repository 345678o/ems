import Link from "next/link";
import { Inter } from "next/font/google";
import { getServerSession } from "next-auth";
import {
  ArrowRight,
  CalendarDays,
  Handshake,
  Ticket,
  UsersRound,
} from "lucide-react";
import "@/components/discover/discover.css";
import logger from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import GradientASCII from "@/components/ui/gradient-ascii";
import { DiscoverEventCard } from "@/components/discover/DiscoverEventCard";
import {
  EVENT_FIELDS,
  toDiscoverEvents,
  type DiscoverEvent,
} from "@/components/discover/types";

const inter = Inter({ subsets: ["latin"], variable: "--font-dz" });

export const metadata = {
  title: "EMS.MLRIT — Campus events at MLR Institute of Technology",
  description:
    "Discover workshops, hackathons, fests and club events at MLRIT. Register, track your bookings and never miss what's on.",
};

// Counts and the event preview are cached briefly; the page stays static-fast.
export const revalidate = 300;

const FEATURES = [
  {
    icon: Ticket,
    title: "Find events",
    text: "Workshops, hackathons, fests and talks from every club, in one feed.",
    href: "/discover",
  },
  {
    icon: CalendarDays,
    title: "Plan your weeks",
    text: "A campus calendar by month, week or day, with filters by category.",
    href: "/calendar",
  },
  {
    icon: UsersRound,
    title: "Join clubs",
    text: "See what each club runs and what's coming up next.",
    href: "/clubs",
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
        .limit(3),
    ]);
    const failed = [events, clubs, upcomingCount, upcoming].find(
      (r) => r.error
    );
    if (failed) {
      logger.error("[landing] overview error:", failed.error?.message);
      return null;
    }
    let preview: DiscoverEvent[] = toDiscoverEvents(upcoming.data);
    const hasUpcoming = preview.length > 0;
    // Nothing scheduled yet: show the most recent events instead, labelled so.
    if (!hasUpcoming) {
      const recent = await supabase
        .from("events")
        .select(EVENT_FIELDS)
        .eq("status", "approved")
        .order("start_datetime", { ascending: false })
        .limit(3);
      preview = recent.error ? [] : toDiscoverEvents(recent.data);
    }
    return {
      eventCount: events.count ?? 0,
      clubCount: clubs.count ?? 0,
      upcomingCount: upcomingCount.count ?? 0,
      preview,
      hasUpcoming,
      now,
    };
  } catch (e) {
    logger.error("[landing] overview failed:", e);
    return null;
  }
}

export default async function LandingPage() {
  const [session, overview] = await Promise.all([
    getServerSession(authOptions),
    loadOverview(),
  ]);
  const signedIn = !!session?.user;

  return (
    <div className={`${inter.variable} dz dark`}>
      {/* Top bar: brand + two actions. The app's sidebar lives inside. */}
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex h-16 max-w-page items-center justify-between px-4 md:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-[rgba(255,117,71,0.14)] ring-1 ring-[rgba(255,117,71,0.3)]">
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
        <section className="relative isolate flex min-h-[86svh] items-center overflow-hidden">
          <GradientASCII
            className="!absolute inset-0 -z-10"
            colors={["#c2451f", "#ff7547", "#ffb48f", "#fff4ed"]}
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
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_50%_30%,rgba(11,11,13,0.75),transparent_75%)]"
          />
          <div className="mx-auto w-full max-w-page px-4 pb-16 pt-28 text-center md:px-8">
            <p className="text-ui font-semibold uppercase tracking-[0.18em] text-[var(--dz-accent)]">
              MLR Institute of Technology
            </p>
            <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-6xl">
              Every campus event, in one place.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-zinc-300 sm:text-lg">
              Discover workshops, hackathons, fests and club meetups. Register
              in a tap and keep track of everything you&apos;re going to.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
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
              <dl className="mx-auto mt-12 grid max-w-lg grid-cols-3 gap-3">
                {[
                  ["Events", overview.eventCount],
                  ["Clubs", overview.clubCount],
                  ["Coming up", overview.upcomingCount],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-[var(--dz-border)] bg-[rgba(20,20,23,0.7)] px-3 py-3 backdrop-blur"
                  >
                    <dd className="text-2xl font-semibold tabular-nums sm:text-3xl">
                      {value}
                    </dd>
                    <dt className="mt-0.5 text-xs text-zinc-400">{label}</dt>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </section>

        {/* What you can do */}
        <section
          aria-labelledby="features-heading"
          className="mx-auto max-w-page px-4 py-16 md:px-8"
        >
          <h2
            id="features-heading"
            className="text-2xl font-semibold tracking-[-0.02em] sm:text-3xl"
          >
            Built for students and clubs
          </h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text, href }) => (
              <li key={title}>
                <Link
                  href={href}
                  className="dz-card group flex h-full flex-col gap-3 p-5"
                >
                  <span className="grid size-10 place-items-center rounded-lg bg-[rgba(255,117,71,0.12)] text-[var(--dz-accent)] ring-1 ring-[rgba(255,117,71,0.2)]">
                    <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="text-base font-semibold">{title}</span>
                  <span className="text-sm text-zinc-400">{text}</span>
                  <span className="mt-auto flex items-center gap-1 text-ui text-zinc-400 transition-colors group-hover:text-white">
                    Open
                    <ArrowRight className="size-3.5" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Event preview (real data only) */}
        {overview && overview.preview.length > 0 && (
          <section
            aria-labelledby="preview-heading"
            className="mx-auto max-w-page px-4 pb-16 md:px-8"
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2
                id="preview-heading"
                className="text-2xl font-semibold tracking-[-0.02em] sm:text-3xl"
              >
                {overview.hasUpcoming ? "Coming up next" : "Recent events"}
              </h2>
              <Link
                href="/events"
                className="text-ui text-zinc-400 transition-colors hover:text-white"
              >
                View all events →
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        <section className="mx-auto max-w-page px-4 pb-20 md:px-8">
          <div className="dz-panel flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[rgba(255,117,71,0.12)] text-[var(--dz-accent)] ring-1 ring-[rgba(255,117,71,0.25)]">
              <Handshake className="size-6" aria-hidden />
            </span>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">Run a club?</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Publish events, manage registrations and share reports from your
                club workspace.
              </p>
            </div>
            <Link
              href={
                signedIn ? "/user/profile?tab=partner" : "/register?mode=signup"
              }
              className="dz-btn dz-btn--ghost"
            >
              Become an organizer
            </Link>
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
