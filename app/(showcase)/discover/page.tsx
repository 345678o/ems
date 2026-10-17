"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownUp, ArrowRight, CalendarPlus } from "lucide-react";
import logger from "@/lib/logger";
import { supabase } from "@/lib/supabase/browserClient";
import { HeroBanner } from "@/components/discover/HeroBanner";
import { JumpIn } from "@/components/discover/JumpIn";
import { TrailerCard } from "@/components/discover/TrailerCard";
import { EventCard } from "@/components/discover/EventCard";
import {
  ExploreClubs,
  type ClubItem,
} from "@/components/discover/ExploreClubs";
import {
  EVENT_FIELDS,
  clubLogo,
  eventCategory,
  eventBlurb,
  eventCover,
  formatEventDate,
  toDiscoverEvents,
  type DiscoverEvent,
} from "@/components/discover/types";

const time = (e: DiscoverEvent) =>
  e.start_datetime ? new Date(e.start_datetime).getTime() : 0;

export default function DiscoverPage() {
  const [events, setEvents] = useState<DiscoverEvent[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [newestFirst, setNewestFirst] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("events")
        .select(EVENT_FIELDS)
        .eq("status", "approved")
        .order("start_datetime", { ascending: false });
      if (error) logger.error("[discover] events fetch error:", error.message);
      setEvents(toDiscoverEvents(data));
      setLoaded(true);
    };
    load();
  }, []);

  // Events with real banners make the best hero art; lead with them.
  const featured = useMemo(() => {
    const withArt = events.filter(
      (e) => e.banners && Object.keys(e.banners).length
    );
    return [...withArt, ...events.filter((e) => !withArt.includes(e))].slice(
      0,
      5
    );
  }, [events]);
  const hero = featured.length ? featured[heroIndex % featured.length] : null;
  const step = (d: number) =>
    setHeroIndex((i) =>
      featured.length ? (i + d + featured.length) % featured.length : 0
    );

  const latest = useMemo(
    () =>
      [...events]
        .sort((a, b) => (newestFirst ? time(b) - time(a) : time(a) - time(b)))
        .slice(0, 8),
    [events, newestFirst]
  );
  const suggestions = events.filter((e) => e.id !== hero?.id).slice(0, 4);

  // Clubs that actually host events, busiest first.
  const clubs = useMemo<ClubItem[]>(() => {
    const counts = new Map<string, number>();
    events.forEach((e) => {
      if (e.club?.name)
        counts.set(e.club.name, (counts.get(e.club.name) ?? 0) + 1);
    });
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name, n]) => ({
        key: name,
        href: `/clubs/${encodeURIComponent(name.toLowerCase())}`,
        name,
        meta: `${n} event${n === 1 ? "" : "s"}`,
        logo: clubLogo(name),
      }));
  }, [events]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-ui font-medium text-zinc-400">Discover</p>
          <h1 className="mt-1 text-[28px] font-semibold leading-tight tracking-[-0.02em]">
            What&apos;s happening at MLRIT
          </h1>
        </div>
        <Link href="/events" className="dz-btn dz-btn--ghost">
          Browse all events
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <JumpIn />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        {/* DOM order = mobile order: hero, new events, suggestions, clubs */}
        <HeroBanner
          className="xl:col-start-2 xl:row-start-1"
          image={hero ? eventCover(hero, heroIndex) : undefined}
          eyebrow={hero ? "Featured event" : undefined}
          tags={
            hero
              ? [
                  eventCategory(hero),
                  formatEventDate(hero.start_datetime),
                  hero.club?.name,
                ].filter((t): t is string => !!t)
              : []
          }
          title={hero?.name ?? (loaded ? "No events yet" : "Loading events…")}
          description={hero ? eventBlurb(hero) : null}
          primary={{
            label: "Register",
            href: hero ? `/events/${hero.id}` : "/events",
          }}
          secondary={{
            label: "Add to calendar",
            href: "/calendar",
            icon: <CalendarPlus className="size-4" aria-hidden />,
          }}
          moreHref={hero ? `/events/${hero.id}` : undefined}
          onPrev={featured.length > 1 ? () => step(-1) : undefined}
          onNext={featured.length > 1 ? () => step(1) : undefined}
        />

        <section className="dz-panel flex min-w-0 flex-col p-4 xl:col-start-1 xl:row-start-1 xl:h-[340px]">
          <div className="flex items-center justify-between gap-3 px-1">
            <h2 className="text-lg font-semibold">New events</h2>
            <button
              type="button"
              onClick={() => setNewestFirst((v) => !v)}
              className="flex h-9 items-center gap-1.5 rounded-md px-2 text-ui text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
              aria-label={`Sort by date, ${newestFirst ? "newest" : "oldest"} first`}
            >
              {newestFirst ? "Newest" : "Oldest"}
              <ArrowDownUp className="size-3.5" aria-hidden />
            </button>
          </div>
          <div className="dz-scroll mt-3 flex min-h-0 flex-1 gap-3 overflow-x-auto pb-1 xl:flex-col xl:overflow-y-auto xl:overflow-x-hidden xl:pb-0 xl:pr-1 xl:[mask-image:linear-gradient(to_bottom,#000_calc(100%-28px),transparent)]">
            {latest.map((e, i) => (
              <TrailerCard
                key={e.id}
                href={`/events/${e.id}`}
                title={e.name}
                meta={formatEventDate(e.start_datetime)}
                image={eventCover(e, i + 2)}
                className="w-[240px] xl:w-full"
              />
            ))}
          </div>
        </section>

        <section className="min-w-0 xl:col-start-2 xl:row-start-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">You might like</h2>
            <Link
              href="/events"
              className="-my-2 py-2 text-ui text-zinc-400 transition-colors hover:text-white"
            >
              See all
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {suggestions.map((e, i) => (
              <EventCard
                key={e.id}
                href={`/events/${e.id}`}
                title={e.name}
                category={eventCategory(e)}
                meta={`${formatEventDate(e.start_datetime)}${e.club ? ` · ${e.club.name}` : ""}`}
                image={eventCover(e, i + 4)}
              />
            ))}
          </div>
        </section>

        {/* On desktop the clubs panel takes the height of the "You might
            like" row and scrolls inside it. */}
        <div className="xl:relative xl:col-start-1 xl:row-start-2">
          <ExploreClubs
            items={clubs}
            className="max-h-[360px] xl:absolute xl:inset-0 xl:max-h-none"
          />
        </div>
      </div>
    </div>
  );
}
