"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarPlus, X } from "lucide-react";
import { HeroBanner } from "@/components/discover/HeroBanner";
import { DiscoverEventCard } from "@/components/discover/DiscoverEventCard";
import {
  ErrorState,
  EventGridSkeleton,
} from "@/components/discover/LoadStates";
import { friendlyError, useEvents } from "@/components/discover/useEvents";
import {
  eventBlurb,
  eventCategory,
  eventCover,
  eventLocation,
  formatEventDate,
  type DiscoverEvent,
} from "@/components/discover/types";

const FILTERS = ["All", "Upcoming", "Past"] as const;
type Filter = (typeof FILTERS)[number];

function EventsView() {
  const q = (useSearchParams().get("q") ?? "").trim().toLowerCase();
  const { events, status, error, retry } = useEvents({ ascending: true });
  const loaded = status === "ready";
  const [filter, setFilter] = useState<Filter>("All");
  const [heroIndex, setHeroIndex] = useState(0);
  const [now] = useState(() => Date.now());

  const isUpcoming = (e: DiscoverEvent) =>
    !!e.start_datetime && new Date(e.start_datetime).getTime() >= now;

  const visible = useMemo(
    () =>
      events.filter((e) => {
        if (filter === "Upcoming" && !isUpcoming(e)) return false;
        if (filter === "Past" && isUpcoming(e)) return false;
        if (!q) return true;
        return [e.name, e.description, e.club?.name, e.theme, e.venue]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(q));
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events, filter, q]
  );

  // Hero cycles through what's coming up next (or the latest if nothing is).
  const spotlight = useMemo(() => {
    const upcoming = events.filter(isUpcoming);
    return (upcoming.length ? upcoming : [...events].reverse()).slice(0, 5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);
  const hero = spotlight.length
    ? spotlight[heroIndex % spotlight.length]
    : null;
  const step = (d: number) =>
    setHeroIndex((i) =>
      spotlight.length ? (i + d + spotlight.length) % spotlight.length : 0
    );

  return (
    <div className="flex flex-col gap-6">
      <HeroBanner
        titleAs="h1"
        image={hero ? eventCover(hero, heroIndex) : "/events/welcome-gate.jpg"}
        eyebrow={hero && isUpcoming(hero) ? "Coming up next" : "Latest event"}
        tags={
          hero
            ? [eventCategory(hero), formatEventDate(hero.start_datetime)]
            : []
        }
        title={
          hero?.name ??
          (status === "error"
            ? "Events are unavailable"
            : loaded
              ? "No events yet"
              : "Loading events…")
        }
        description={
          hero
            ? eventBlurb(hero) ||
              `${hero.club?.name ?? "EMS"} · ${eventLocation(hero) || "Venue TBA"}`
            : "Workshops, challenges, summits and showcases across campus."
        }
        primary={{
          label: "View event",
          href: hero ? `/events/${hero.id}` : "/events",
        }}
        secondary={{
          label: "Calendar",
          href: "/calendar",
          icon: (
            <CalendarPlus className="size-3.5" strokeWidth={1.8} aria-hidden />
          ),
        }}
        onPrev={spotlight.length > 1 ? () => step(-1) : undefined}
        onNext={spotlight.length > 1 ? () => step(1) : undefined}
      />

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">
              {q ? `Results for “${q}”` : "All events"}
            </h2>
            {q && (
              <Link
                href="/events"
                className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/80 hover:bg-white/20"
              >
                <X className="size-3" aria-hidden />
                Clear
              </Link>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`rounded-full px-3.5 py-2 text-xs transition ${
                  filter === f
                    ? "bg-white/15 font-semibold text-white"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
            <span className="ml-1 dz-chip">
              {visible.length} event{visible.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {status === "loading" ? (
          <div className="mt-3">
            <EventGridSkeleton count={8} />
          </div>
        ) : status === "error" ? (
          <ErrorState
            className="mt-3"
            title="Events didn't load"
            message={friendlyError(error)}
            onRetry={retry}
          />
        ) : visible.length === 0 ? (
          <p className="dz-panel mt-3 p-6 text-ui text-zinc-400">
            No events match. Try another filter or search.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((e, i) => (
              <DiscoverEventCard key={e.id} event={e} index={i} now={now} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function EventsPage() {
  // useSearchParams needs a Suspense boundary for static rendering.
  return (
    <Suspense>
      <EventsView />
    </Suspense>
  );
}
