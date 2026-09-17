"use client";
import logger from "@/lib/logger";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  MapPin,
  CalendarDays,
  Search,
  Calendar as CalendarIcon,
} from "lucide-react";
import LogoLoop from "@/components/logo-loop";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ScribbleStar,
  ScribbleArrow,
  ScribbleCrown,
} from "@/components/ui/scribble";
import {
  CategoryBadge,
  toEventCategory,
  type EventCategory,
} from "@/components/ui/category-badge";
import { supabase } from "@/lib/supabase/browserClient";
import type { EventTheme } from "@/lib/utils/theme-color";

type HomeEventRow = {
  id: string;
  name: string;
  venue: string | null;
  city: string | null;
  description: string | null;
  banners: Record<string, string>;
  theme_colors: EventTheme | null;
  start_datetime: string | null;
  club: { name: string } | null;
};

function eventLocation(e: Pick<HomeEventRow, "venue" | "city">) {
  return Array.from(
    new Set(
      [e.venue, e.city].filter(
        (v): v is string => v != null && v.trim().toLowerCase() !== "tbd"
      )
    )
  ).join(", ");
}

/** Small stacked date chip, e.g. "APR / 26", torn-ticket style. */
function DateChip({ iso }: { iso: string | null }) {
  const d = iso ? new Date(iso) : null;
  return (
    <div className="flex w-14 shrink-0 flex-col items-center rounded-lg border border-ink/10 bg-secondary py-1.5 leading-none shadow-sm">
      <span className="text-[10px] font-bold uppercase tracking-wider text-hotpink">
        {d ? d.toLocaleDateString("en-IN", { month: "short" }) : "TBA"}
      </span>
      <span className="font-display mt-1 text-lg text-ink">
        {d ? d.getDate() : "?"}
      </span>
    </div>
  );
}

/** Counts up from 0 to `target` once `active` flips true — used for the
 * stats bar when it scrolls into view. Rounds with an ease-out curve so
 * the count settles rather than ticking linearly. */
function useCountUp(target: number | null, active: boolean, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active || target === null) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return value;
}

/** Fires once the ref'd element enters the viewport. Uses a plain
 * IntersectionObserver (not motion's `whileInView`, which in testing did
 * not reliably fire for elements already visible at initial mount — it
 * only fired after an explicit scroll/layout event) plus a short timeout
 * fallback so the count-up can never get stuck at its zero state. */
function useInViewOnce<T extends HTMLElement>() {
  const ref = React.useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (inView) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);

    const fallback = setTimeout(() => setInView(true), 1200);
    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, [inView]);

  return [ref, inView] as const;
}

function StatTile({
  value,
  label,
  active,
}: {
  value: number | null;
  label: string;
  active: boolean;
}) {
  const display = useCountUp(value, active);
  return (
    <div className="px-2 text-center sm:px-6">
      <p className="font-display text-3xl text-paper sm:text-4xl">
        {value === null ? "—" : `${display}+`}
      </p>
      <p className="mt-1 text-xs text-paper/60 sm:text-sm">{label}</p>
    </div>
  );
}

type FilterId =
  "all" | "today" | "week" | "workshop" | "hackathon" | "fest" | "sports";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "workshop", label: "Workshops" },
  { id: "hackathon", label: "Hackathons" },
  { id: "fest", label: "Fests" },
  { id: "sports", label: "Sports" },
];

/** The schema's event `category` is inferred from its name (there's no
 * dedicated taxonomy column beyond the cultural/tech/sports/workshop
 * buckets `toEventCategory` already produces) — "Hackathons" and "Fests"
 * aren't real buckets, so those two filters match on keyword + bucket. */
function matchesFilter(e: HomeEventRow, filter: FilterId): boolean {
  if (filter === "all") return true;
  const now = new Date();
  const start = e.start_datetime ? new Date(e.start_datetime) : null;
  if (filter === "today") {
    return !!start && start.toDateString() === now.toDateString();
  }
  if (filter === "week") {
    if (!start) return false;
    const weekOut = new Date(now);
    weekOut.setDate(weekOut.getDate() + 7);
    return start >= now && start <= weekOut;
  }
  const category = toEventCategory(e.name);
  const name = e.name.toLowerCase();
  if (filter === "workshop") return category === "workshop";
  if (filter === "sports") return category === "sports";
  if (filter === "hackathon")
    return category === "tech" || name.includes("hack");
  if (filter === "fest")
    return category === "cultural" || name.includes("fest");
  return true;
}

function EventThumb({
  e,
  category,
  aspect = "aspect-[16/10]",
}: {
  e: HomeEventRow;
  category: EventCategory;
  aspect?: string;
}) {
  return (
    <div className={`relative w-full overflow-hidden ${aspect}`}>
      <img
        src={e.banners?.["16:9"] || e.banners?.["1x1"]}
        alt={e.name}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute left-3 top-3">
        <CategoryBadge category={category} />
      </div>
    </div>
  );
}

function Page() {
  const [events, setEvents] = useState<HomeEventRow[]>([]);
  const [clubs, setClubs] = useState<
    Array<{ id: string; name: string; avatar_url: string | null }>
  >([]);
  const [ticketPrices, setTicketPrices] = useState<Record<string, number>>({});
  const [stats, setStats] = useState<{
    events: number | null;
    clubs: number | null;
    registrations: number | null;
    upcoming: number | null;
  }>({ events: null, clubs: null, registrations: null, upcoming: null });
  const [statsRef, statsInView] = useInViewOnce<HTMLDivElement>();
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      const nowIso = new Date().toISOString();
      const [eventsCount, clubsCount, registrationsCount, upcomingCount] =
        await Promise.all([
          supabase.from("events").select("id", { count: "exact", head: true }),
          supabase.from("clubs").select("id", { count: "exact", head: true }),
          supabase
            .from("event_participants")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("events")
            .select("id", { count: "exact", head: true })
            .gte("start_datetime", nowIso),
        ]);
      if (eventsCount.error) {
        logger.error("[home] events count error:", eventsCount.error.message);
      }
      if (clubsCount.error) {
        logger.error("[home] clubs count error:", clubsCount.error.message);
      }
      if (registrationsCount.error) {
        logger.error(
          "[home] registrations count error:",
          registrationsCount.error.message
        );
      }
      if (upcomingCount.error) {
        logger.error(
          "[home] upcoming count error:",
          upcomingCount.error.message
        );
      }
      setStats({
        events: eventsCount.count ?? null,
        clubs: clubsCount.count ?? null,
        registrations: registrationsCount.count ?? null,
        upcoming: upcomingCount.count ?? null,
      });
    };
    loadStats();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select(
            "id,name,venue,city,description,banners,theme_colors,start_datetime,created_at,clubs(name)"
          )
          .order("created_at", { ascending: false });

        if (error) {
          logger.error("[home] events fetch error:", error.message);
          setEvents([]);
          return;
        }

        type RawHomeEvent = {
          id: string;
          name: string;
          venue: string | null;
          city: string | null;
          description: string | null;
          banners: Record<string, string> | null;
          theme_colors: EventTheme | null;
          start_datetime: string | null;
          clubs: { name: string } | { name: string }[] | null;
        };
        const filtered = ((data as unknown as RawHomeEvent[]) || []).filter(
          (e) => {
            let b: Record<string, string> = {};
            try {
              b =
                typeof e.banners === "string"
                  ? JSON.parse(e.banners)
                  : (e.banners ?? {});
            } catch {
              logger.warn("Invalid banners JSON:", e.banners);
            }
            return (
              Boolean(b?.["1x1"]) &&
              Boolean(b?.["16:9"]) &&
              Boolean(b?.["21:9"])
            );
          }
        );

        setEvents(
          filtered.map((e) => ({
            ...e,
            banners: e.banners ?? {},
            club: Array.isArray(e.clubs) ? (e.clubs[0] ?? null) : e.clubs,
          }))
        );
      } catch (err: unknown) {
        logger.error(
          "[home] events fetch error:",
          err instanceof Error ? err.message : err
        );
        setEvents([]);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (events.length === 0) return;
    const loadPrices = async () => {
      const { data, error } = await supabase
        .from("event_tickets")
        .select("event_id,price")
        .in(
          "event_id",
          events.map((e) => e.id)
        );
      if (error) {
        logger.error("[home] ticket price fetch error:", error.message);
        return;
      }
      const min: Record<string, number> = {};
      for (const t of (data || []) as Array<{
        event_id: string;
        price: number;
      }>) {
        if (min[t.event_id] === undefined || t.price < min[t.event_id]) {
          min[t.event_id] = t.price;
        }
      }
      setTicketPrices(min);
    };
    loadPrices();
  }, [events]);

  useEffect(() => {
    const loadClubs = async () => {
      try {
        const { data, error } = await supabase
          .from("clubs")
          .select("id,name,avatar_url")
          .order("name", { ascending: true });

        if (error) {
          logger.error("[home] clubs fetch error:", error.message);
          setClubs([]);
          return;
        }

        setClubs(
          (data || []).map((club) => ({
            id: club.id,
            name: club.name || "Unnamed Club",
            avatar_url: club.avatar_url,
          }))
        );
      } catch (err: unknown) {
        logger.error(
          "[home] clubs fetch error:",
          err instanceof Error ? err.message : err
        );
        setClubs([]);
      }
    };
    loadClubs();
  }, []);

  const heroPhotos = useMemo(() => events.slice(0, 3), [events]);

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      if (!matchesFilter(e, activeFilter)) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.club?.name?.toLowerCase().includes(q) ||
        eventLocation(e).toLowerCase().includes(q)
      );
    });
  }, [events, activeFilter, query]);

  const featured = filteredEvents.slice(0, 3);

  const upcoming = useMemo(() => {
    const now = new Date();
    return events
      .filter((e) => e.start_datetime && new Date(e.start_datetime) >= now)
      .sort(
        (a, b) =>
          new Date(a.start_datetime!).getTime() -
          new Date(b.start_datetime!).getTime()
      )
      .slice(0, 6);
  }, [events]);

  const clubLogos = useMemo(
    () =>
      clubs.map((c) => ({
        node: (
          <Avatar className="h-[50px] w-[50px] border-2 border-ink/10 ring-2 ring-hotpink/20">
            <AvatarImage src={c.avatar_url ?? undefined} alt={c.name} />
            <AvatarFallback className="bg-ink text-paper font-display">
              {c.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        ),
        title: c.name,
        ariaLabel: c.name,
      })),
    [clubs]
  );

  const heroTilts = [-4, 2, -1.5];

  return (
    <div className="paper-grain min-h-screen bg-background">
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative mx-auto w-[92%] max-w-7xl pt-14 pb-16 sm:w-[88%]">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          {/* Left — headline */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative"
          >
            <p className="font-marker mb-3 hidden -rotate-2 text-lg text-hotpink md:block">
              Same campus.
              <br />
              Different perspective.
              <ScribbleCrown className="ml-1.5 -mt-1 inline-block h-5 w-6 rotate-6 align-middle" />
            </p>

            <h1 className="font-display text-5xl leading-[0.92] tracking-[-0.01em] text-ink sm:text-6xl lg:text-[5.25rem]">
              EVENTS ARE
              <br />
              BETTER
              <br />
              <span className="marker-highlight">TOGETHER</span>
            </h1>

            <p className="mt-6 max-w-sm text-base leading-relaxed text-ink/70">
              Discover. Register. Participate. Your one-stop feed for every
              club&apos;s fests, hackathons, workshops, and everything in
              between.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/events">
                <Button
                  size="lg"
                  className="group rounded-full px-7 text-base shadow-[3px_3px_0_0_var(--ink)] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Explore Events
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/calendar">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-ink/20 bg-transparent px-6 text-base text-ink hover:bg-ink/5"
                >
                  <CalendarIcon className="h-4 w-4" />
                  View Calendar
                </Button>
              </Link>
              <ScribbleArrow className="hidden h-8 w-14 -rotate-12 text-ink/30 lg:block" />
            </div>
          </motion.div>

          {/* Right — collage of live event cards */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="relative mx-auto h-[340px] w-full max-w-sm md:h-[400px]"
          >
            <ScribbleStar className="absolute -top-4 left-2 z-30 h-6 w-6 text-hotpink" />
            {heroPhotos.length === 0 ? (
              <div className="polaroid absolute inset-x-8 top-4 rotate-2">
                <div className="flex aspect-[4/5] w-full items-center justify-center bg-paper-dim text-sm text-ink/40">
                  Events coming soon
                </div>
              </div>
            ) : (
              heroPhotos.map((e, i) => {
                const category = toEventCategory(e.name);
                const location = eventLocation(e);
                return (
                  <Link
                    key={e.id}
                    href={`/events/${e.id}`}
                    className="group absolute w-[64%] overflow-hidden rounded-sm border border-ink/10 bg-card shadow-[0_10px_30px_-10px_rgba(0,0,0,0.35)] transition-all duration-300 hover:z-30 hover:-translate-y-1 hover:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45)]"
                    style={{
                      transform: `rotate(${heroTilts[i % heroTilts.length]}deg)`,
                      left: `${i * 15}%`,
                      top: `${i * 15}%`,
                      zIndex: i,
                    }}
                  >
                    {i === 0 && (
                      <span className="washi-tape absolute -top-2 -right-2 z-10 rotate-3 rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                        Live now
                      </span>
                    )}
                    <EventThumb
                      e={e}
                      category={category}
                      aspect="aspect-[4/3]"
                    />
                    <div className="flex items-center gap-2 p-2.5">
                      <DateChip iso={e.start_datetime} />
                      <div className="min-w-0">
                        <p className="font-display truncate text-sm text-ink">
                          {e.name}
                        </p>
                        {location && (
                          <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-ink/50">
                            <MapPin className="h-2.5 w-2.5 shrink-0" />
                            {location}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </motion.div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Stats bar                                                         */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-ink py-8">
        <div
          ref={statsRef}
          className="mx-auto grid w-[92%] max-w-5xl grid-cols-2 divide-y divide-paper/15 sm:w-[88%] sm:grid-cols-4 sm:divide-x sm:divide-y-0"
        >
          <StatTile
            value={stats.events}
            label="Events hosted"
            active={statsInView}
          />
          <StatTile
            value={stats.registrations}
            label="Registrations"
            active={statsInView}
          />
          <StatTile
            value={stats.clubs}
            label="Clubs & departments"
            active={statsInView}
          />
          <StatTile
            value={stats.upcoming}
            label="Upcoming events"
            active={statsInView}
          />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Discovery — filters + search                                      */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-b border-ink/10 py-10">
        <div className="mx-auto w-[92%] max-w-7xl sm:w-[88%]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl text-ink md:text-4xl">
                What&apos;s happening
              </h2>
              <p className="mt-1 text-sm text-ink/60">
                Find something worth showing up for.
              </p>
            </div>
            <div className="relative w-full max-w-xs sm:w-64">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events..."
                className="w-full rounded-full border border-ink/15 bg-card py-2 pl-10 pr-4 text-sm text-ink placeholder:text-ink/40 focus:border-hotpink/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="scrollbar-none mt-6 flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((f) => {
              const isActive = f.id === activeFilter;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFilter(f.id)}
                  className={`relative shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-ink text-paper"
                      : "border border-ink/15 bg-card text-ink/60 hover:text-ink"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Featured Events                                                   */}
      {/* ---------------------------------------------------------------- */}
      <section className="py-14">
        <div className="mx-auto w-[92%] max-w-7xl sm:w-[88%]">
          {featured.length === 0 ? (
            <p className="font-marker text-xl text-ink/50">
              Nothing matches that yet — try a different filter.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Large featured card */}
              {featured[0] && (
                <FeaturedCard
                  e={featured[0]}
                  price={ticketPrices[featured[0].id]}
                  large
                  delay={0}
                />
              )}
              {/* Two smaller cards stacked beside it */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1">
                {featured.slice(1, 3).map((e, i) => (
                  <FeaturedCard
                    key={e.id}
                    e={e}
                    price={ticketPrices[e.id]}
                    delay={(i + 1) * 0.08}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Coming up — editorial timeline                                    */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-y border-ink/10 bg-secondary/40 py-14">
        <div className="mx-auto w-[92%] max-w-7xl sm:w-[88%]">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-display flex items-center gap-2 text-3xl text-ink md:text-4xl">
              Coming up
            </h2>
            <Link
              href="/events"
              className="text-sm font-semibold text-ink underline decoration-hotpink decoration-2 underline-offset-4 hover:text-hotpink"
            >
              View All →
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <p className="font-marker text-xl text-ink/50">
              Nothing on the calendar yet — check back soon.
            </p>
          ) : (
            <div className="divide-y divide-ink/10 border-y border-ink/10">
              {upcoming.map((e, i) => {
                const d = e.start_datetime ? new Date(e.start_datetime) : null;
                const location = eventLocation(e);
                return (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: i * 0.04 }}
                    className="group grid grid-cols-[3.5rem_1fr] items-center gap-4 py-4 sm:grid-cols-[3.5rem_1.5fr_1fr_1fr_auto] sm:gap-6"
                  >
                    <div className="flex flex-col items-center leading-none">
                      <span className="font-display text-2xl text-ink">
                        {d ? d.getDate() : "?"}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-hotpink">
                        {d
                          ? d.toLocaleDateString("en-IN", { month: "short" })
                          : "TBA"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-display truncate text-lg text-ink">
                        {e.name}
                      </p>
                      <p className="mt-0.5 text-xs text-ink/50 sm:hidden">
                        {e.club?.name}
                        {location ? ` · ${location}` : ""}
                      </p>
                    </div>
                    <p className="hidden truncate text-sm text-ink/60 sm:block">
                      {e.club?.name ?? "—"}
                    </p>
                    <p className="hidden truncate text-sm text-ink/60 sm:block">
                      {location || "TBA"}
                    </p>
                    <Link
                      href={`/events/${e.id}`}
                      className="group/link flex shrink-0 items-center gap-1 text-sm font-semibold text-ink transition-colors hover:text-hotpink"
                    >
                      Register
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/link:translate-x-1" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Clubs                                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="py-14">
        <div className="mx-auto mb-8 w-[92%] max-w-7xl sm:w-[88%]">
          <h2 className="font-display flex items-center gap-2 text-3xl text-ink md:text-4xl">
            Powered by our Clubs
            <CalendarDays className="hidden h-6 w-6 text-hotpink sm:block" />
          </h2>
          <p className="font-marker mt-1 text-lg text-ink/60">
            The student communities behind every fest on this page.
          </p>
        </div>

        {clubLogos.length > 0 && (
          <div className="relative w-full overflow-hidden border-y border-dashed border-ink/15 bg-secondary/50 py-3">
            <LogoLoop
              logos={clubLogos}
              speed={80}
              direction="left"
              logoHeight={50}
              gap={48}
              pauseOnHover
              scaleOnHover
              fadeOut
              fadeOutColor="#f5f1e8"
              ariaLabel="Clubs"
            />
          </div>
        )}
      </section>
    </div>
  );
}

function FeaturedCard({
  e,
  price,
  large,
  delay,
}: {
  e: HomeEventRow;
  price: number | undefined;
  large?: boolean;
  delay: number;
}) {
  const category = toEventCategory(e.name);
  const location = eventLocation(e);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Link href={`/events/${e.id}`} className="group block h-full">
        <article className="flex h-full flex-col overflow-hidden rounded-sm border border-ink/10 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-hotpink/30 hover:shadow-[0_16px_36px_-16px_rgba(0,0,0,0.3)]">
          <EventThumb
            e={e}
            category={category}
            aspect={large ? "aspect-[16/9]" : "aspect-[16/10]"}
          />
          <div className="flex flex-1 flex-col gap-2 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink/40">
              <CalendarDays className="h-3.5 w-3.5" />
              {e.start_datetime
                ? new Date(e.start_datetime).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })
                : "TBA"}
            </div>
            <h3
              className={`font-display text-ink ${large ? "text-2xl" : "text-lg"}`}
            >
              {e.name}
            </h3>
            {e.description && (
              <p className="line-clamp-2 text-sm text-ink/60">
                {e.description}
              </p>
            )}
            <div className="mt-auto flex items-center justify-between gap-3 pt-2">
              <div className="min-w-0">
                {e.club?.name && (
                  <p className="truncate text-xs font-medium text-ink/50">
                    {e.club.name}
                  </p>
                )}
                {location && (
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-ink/40">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {location}
                  </p>
                )}
              </div>
              <span className="group/btn flex shrink-0 items-center gap-1 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-paper transition-transform group-hover:scale-[1.03]">
                {price !== undefined ? `₹${price}` : "Register"}
                <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
              </span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

export default Page;
