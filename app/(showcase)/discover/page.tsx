"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, CalendarPlus, CalendarX2, SearchX } from "lucide-react";
import logger from "@/lib/logger";
import { supabase } from "@/lib/supabase/browserClient";
import { HeroBanner } from "@/components/discover/HeroBanner";
import { JumpIn } from "@/components/discover/JumpIn";
import { DiscoverEventCard } from "@/components/discover/DiscoverEventCard";
import {
  ExploreClubs,
  type ClubItem,
} from "@/components/discover/ExploreClubs";
import {
  EmptyState,
  ErrorState,
  EventGridSkeleton,
} from "@/components/discover/LoadStates";
import {
  friendlyError,
  useClubs,
  useEvents,
} from "@/components/discover/useEvents";
import {
  clubHref,
  clubLogo,
  eventBlurb,
  eventCategory,
  eventCover,
  formatEventDate,
  isUpcomingEvent,
  type DiscoverEvent,
} from "@/components/discover/types";

const WHEN = ["Upcoming", "All", "Past"] as const;
type When = (typeof WHEN)[number];
const ALL = "all";
const GRID_LIMIT = 8;

const time = (e: DiscoverEvent) =>
  e.start_datetime ? new Date(e.start_datetime).getTime() : 0;

/**
 * Event ids the signed-in student registered for. Used only to tune "You
 * might like"; any failure just means no personalisation.
 */
function useRegisteredEventIds(email: string | null | undefined) {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    if (!email) return;
    let cancelled = false;
    supabase
      .from("event_participants")
      .select("event_id")
      .eq("email", email)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          logger.warn("[discover] registrations fetch error:", error.message);
          return;
        }
        setIds((data ?? []).map((r: { event_id: string }) => r.event_id));
      });
    return () => {
      cancelled = true;
    };
  }, [email]);
  return email ? ids : [];
}

const selectClass =
  "dz-input h-9 min-w-0 cursor-pointer appearance-none bg-[var(--dz-surface-2)] px-3 pr-8 text-ui [background-image:linear-gradient(45deg,transparent_50%,#8b8b94_50%),linear-gradient(135deg,#8b8b94_50%,transparent_50%)] [background-position:calc(100%-15px)_50%,calc(100%-10px)_50%] [background-repeat:no-repeat] [background-size:5px_5px]";

export default function DiscoverPage() {
  const { data: session } = useSession();
  const { events, status, error, retry } = useEvents({ approvedOnly: true });
  const clubsQuery = useClubs();
  const registeredIds = useRegisteredEventIds(session?.user?.email);
  const [now] = useState(() => Date.now());

  const [heroIndex, setHeroIndex] = useState(0);
  const [when, setWhen] = useState<When>("Upcoming");
  const [category, setCategory] = useState(ALL);
  const [organizer, setOrganizer] = useState(ALL);
  const [sort, setSort] = useState<"soonest" | "latest">("soonest");

  const upcoming = useMemo(
    () =>
      events
        .filter((e) => isUpcomingEvent(e, now))
        .sort((a, b) => time(a) - time(b)),
    [events, now]
  );

  // Hero: next upcoming events with real artwork first; otherwise the latest.
  const featured = useMemo(() => {
    const pool = upcoming.length ? upcoming : events;
    const withArt = pool.filter(
      (e) => e.banners && Object.keys(e.banners).length
    );
    return [...withArt, ...pool.filter((e) => !withArt.includes(e))].slice(
      0,
      5
    );
  }, [events, upcoming]);
  const hero = featured.length ? featured[heroIndex % featured.length] : null;
  const step = (d: number) =>
    setHeroIndex((i) =>
      featured.length ? (i + d + featured.length) % featured.length : 0
    );

  const categories = useMemo(
    () => [...new Set(events.map(eventCategory))].sort(),
    [events]
  );
  const organizers = useMemo(
    () =>
      [
        ...new Set(
          events.map((e) => e.club?.name).filter((n): n is string => !!n)
        ),
      ].sort(),
    [events]
  );

  const filtered = useMemo(() => {
    const list = events.filter((e) => {
      const up = isUpcomingEvent(e, now);
      if (when === "Upcoming" && !up) return false;
      if (when === "Past" && up) return false;
      if (category !== ALL && eventCategory(e) !== category) return false;
      if (organizer !== ALL && e.club?.name !== organizer) return false;
      return true;
    });
    return list.sort((a, b) =>
      sort === "soonest" ? time(a) - time(b) : time(b) - time(a)
    );
  }, [events, now, when, category, organizer, sort]);
  const filtersActive =
    when !== "Upcoming" || category !== ALL || organizer !== ALL;
  const resetFilters = () => {
    setWhen("Upcoming");
    setCategory(ALL);
    setOrganizer(ALL);
  };

  // "You might like": upcoming events sharing a category or club with what
  // the student registered for. Without that history, fall back to the next
  // upcoming events and say so.
  const recommendations = useMemo(() => {
    const mine = events.filter((e) => registeredIds.includes(e.id));
    const cats = new Set(mine.map(eventCategory));
    const clubs = new Set(mine.map((e) => e.club?.name).filter(Boolean));
    const candidates = upcoming.filter(
      (e) => !registeredIds.includes(e.id) && e.id !== hero?.id
    );
    const personal = mine.length
      ? candidates.filter(
          (e) => cats.has(eventCategory(e)) || clubs.has(e.club?.name)
        )
      : [];
    return personal.length
      ? { personal: true, items: personal.slice(0, 4) }
      : { personal: false, items: candidates.slice(0, 4) };
  }, [events, upcoming, registeredIds, hero]);

  const clubItems = useMemo<ClubItem[]>(() => {
    const counts = new Map<string, number>();
    upcoming.forEach((e) => {
      if (e.club?.name)
        counts.set(e.club.name, (counts.get(e.club.name) ?? 0) + 1);
    });
    return clubsQuery.clubs
      .map((c) => ({ c, n: counts.get(c.name) ?? 0 }))
      .sort((a, b) => b.n - a.n || a.c.name.localeCompare(b.c.name))
      .map(({ c, n }) => ({
        key: c.id,
        href: clubHref(c.name),
        name: c.name,
        about: c.about,
        meta:
          status === "ready"
            ? n
              ? `${n} upcoming event${n === 1 ? "" : "s"}`
              : "No upcoming events"
            : "",
        logo: c.avatar_url || clubLogo(c.name),
      }));
  }, [clubsQuery.clubs, upcoming, status]);

  const firstName = session?.user?.name?.split(" ")[0];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-ui font-medium text-[var(--dz-accent)]">
            {firstName ? `Welcome back, ${firstName}` : "Discover"}
          </p>
          <h1 className="mt-1 text-2xl font-semibold leading-tight tracking-[-0.02em] sm:text-[28px]">
            What&apos;s happening at MLRIT
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-zinc-400">
            Workshops, hackathons, fests and club meetups across campus. Find
            something worth showing up for.
          </p>
        </div>
        <Link href="/events" className="dz-btn dz-btn--accent">
          Explore events
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <JumpIn />

      {/* Featured — only when there is a real event to feature */}
      {status === "ready" && hero && (
        <HeroBanner
          image={eventCover(hero, heroIndex)}
          eyebrow={
            isUpcomingEvent(hero, now) ? "Featured · coming up" : "Latest event"
          }
          tags={[
            eventCategory(hero),
            formatEventDate(hero.start_datetime),
            hero.club?.name,
          ].filter((t): t is string => !!t)}
          title={hero.name}
          description={eventBlurb(hero)}
          primary={{
            label: isUpcomingEvent(hero, now)
              ? "View & register"
              : "View event",
            href: `/events/${hero.id}`,
          }}
          secondary={{
            label: "Open calendar",
            href: "/calendar",
            icon: <CalendarPlus className="size-4" aria-hidden />,
          }}
          onPrev={featured.length > 1 ? () => step(-1) : undefined}
          onNext={featured.length > 1 ? () => step(1) : undefined}
        />
      )}

      {/* Events */}
      <section aria-labelledby="events-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="events-heading" className="text-lg font-semibold">
            Events
          </h2>
          <Link
            href="/events"
            className="-my-2 py-2 text-ui text-zinc-400 transition-colors hover:text-white"
          >
            View all events
          </Link>
        </div>

        {status === "ready" && events.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label="When"
              className="flex rounded-lg border border-[var(--dz-border)] bg-[var(--dz-surface-1)] p-0.5"
            >
              {WHEN.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWhen(w)}
                  aria-pressed={when === w}
                  className={`h-8 rounded-md px-3 text-ui transition-colors ${
                    when === w
                      ? "bg-white/10 font-medium text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Category"
              className={`${selectClass} max-w-[180px]`}
            >
              <option value={ALL}>All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              aria-label="Organizer"
              className={`${selectClass} max-w-[180px]`}
            >
              <option value={ALL}>All organizers</option>
              {organizers.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              aria-label="Sort"
              className={selectClass}
            >
              <option value="soonest">Date: earliest first</option>
              <option value="latest">Date: latest first</option>
            </select>
            <span className="dz-chip ml-auto">
              {filtered.length} event{filtered.length === 1 ? "" : "s"}
            </span>
          </div>
        )}

        <div className="mt-4">
          {status === "loading" && <EventGridSkeleton count={4} />}

          {status === "error" && (
            <ErrorState
              title="Events didn't load"
              message={friendlyError(error)}
              onRetry={retry}
            />
          )}

          {status === "ready" && events.length === 0 && (
            <EmptyState
              icon={<CalendarX2 className="size-5" aria-hidden />}
              title="No events published yet"
              message="When clubs publish events they'll show up here. Check the calendar for anything already scheduled."
              action={
                <Link href="/calendar" className="dz-btn dz-btn--ghost">
                  Open calendar
                </Link>
              }
            />
          )}

          {status === "ready" && events.length > 0 && filtered.length === 0 && (
            <EmptyState
              icon={<SearchX className="size-5" aria-hidden />}
              title="Nothing matches these filters"
              message={
                when === "Upcoming" && !filtersActive
                  ? "No upcoming events right now. Past events are still worth a look."
                  : "Try a different category or organizer."
              }
              action={
                <button
                  type="button"
                  onClick={filtersActive ? resetFilters : () => setWhen("Past")}
                  className="dz-btn dz-btn--ghost"
                >
                  {filtersActive ? "Reset filters" : "Show past events"}
                </button>
              }
            />
          )}

          {status === "ready" && filtered.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {filtered.slice(0, GRID_LIMIT).map((e, i) => (
                  <DiscoverEventCard key={e.id} event={e} index={i} now={now} />
                ))}
              </div>
              {filtered.length > GRID_LIMIT && (
                <div className="mt-4 flex justify-center">
                  <Link href="/events" className="dz-btn dz-btn--ghost">
                    See all {filtered.length} events
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Recommendations + clubs */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-labelledby="like-heading" className="min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h2 id="like-heading" className="text-lg font-semibold">
              {recommendations.personal ? "You might like" : "Coming up soon"}
            </h2>
            <p className="text-xs text-faint">
              {recommendations.personal
                ? "Based on events you registered for"
                : session
                  ? "Register for events to get picks tailored to you"
                  : "Sign in and register for events to get personal picks"}
            </p>
          </div>
          <div className="mt-3">
            {status === "loading" && <EventGridSkeleton count={2} />}
            {status === "error" && (
              <p className="dz-panel p-5 text-ui text-zinc-400">
                Recommendations need the events list, which didn&apos;t load.
              </p>
            )}
            {status === "ready" && recommendations.items.length === 0 && (
              <p className="dz-panel p-5 text-ui text-zinc-400">
                No upcoming events to suggest yet.
              </p>
            )}
            {status === "ready" && recommendations.items.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {recommendations.items.map((e, i) => (
                  <DiscoverEventCard
                    key={e.id}
                    event={e}
                    index={i + 3}
                    now={now}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <ExploreClubs
          items={clubItems.slice(0, 8)}
          status={clubsQuery.status}
          onRetry={clubsQuery.retry}
          className="xl:self-start"
        />
      </div>
    </div>
  );
}
