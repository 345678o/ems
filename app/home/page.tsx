"use client";
import logger from "@/lib/logger";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, CalendarDays } from "lucide-react";
import LogoLoop from "@/components/logo-loop";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TornCard } from "@/components/ui/torn-card";
import {
  ScribbleStar,
  ScribbleArrow,
  ScribbleCrown,
} from "@/components/ui/scribble";
import { CategoryBadge, toEventCategory } from "@/components/ui/category-badge";
import { supabase } from "@/lib/supabase/browserClient";
import type { EventTheme } from "@/lib/utils/theme-color";

type HomeEventRow = {
  id: string;
  name: string;
  venue: string | null;
  city: string | null;
  banners: Record<string, string>;
  theme_colors: EventTheme | null;
  start_datetime: string | null;
  club: { name: string } | null;
};

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
  }>({ events: null, clubs: null, registrations: null });

  useEffect(() => {
    const loadStats = async () => {
      const [eventsCount, clubsCount, registrationsCount] = await Promise.all([
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("clubs").select("id", { count: "exact", head: true }),
        supabase
          .from("event_participants")
          .select("id", { count: "exact", head: true }),
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
      setStats({
        events: eventsCount.count ?? null,
        clubs: clubsCount.count ?? null,
        registrations: registrationsCount.count ?? null,
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
            "id,name,venue,city,banners,theme_colors,start_datetime,created_at,clubs(name)"
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

  const rotations = [-6, 3, -2];
  const cardTilts = [-1.5, 1, -1, 1.5, -0.5, 1.5];

  return (
    <div className="paper-grain min-h-screen bg-background">
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative mx-auto w-[92%] max-w-7xl pt-14 pb-16 sm:w-[88%]">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          {/* Left — headline */}
          <div className="relative">
            <p className="font-marker mb-3 hidden -rotate-2 text-xl text-hotpink md:block">
              Same campus.
              <br />
              Different perspective.
              <ScribbleCrown className="ml-1.5 -mt-2 inline-block h-6 w-7 rotate-6 align-middle" />
            </p>

            <h1 className="font-display text-5xl leading-[0.95] tracking-tight text-ink sm:text-6xl lg:text-7xl">
              EVENTS ARE
              <br />
              BETTER
              <br />
              <span className="marker-highlight">TOGETHER</span>
            </h1>

            <p className="mt-6 max-w-md text-base text-ink/70">
              Discover. Register. Participate. Your one-stop feed for every
              club&apos;s fests, hackathons, workshops, and everything in
              between.
            </p>

            <div className="mt-8 flex items-center gap-4">
              <Link href="/events">
                <Button
                  size="lg"
                  className="rounded-full px-7 text-base shadow-[3px_3px_0_0_var(--ink)]"
                >
                  Explore Events
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <ScribbleArrow className="hidden h-8 w-16 -rotate-12 text-ink/40 sm:block" />
            </div>
          </div>

          {/* Right — polaroid collage of live events */}
          <div className="relative mx-auto h-[320px] w-full max-w-sm md:h-[380px]">
            <ScribbleStar className="absolute -top-4 left-2 h-6 w-6 text-hotpink" />
            {heroPhotos.length === 0 ? (
              <div className="polaroid absolute inset-x-8 top-4 rotate-2">
                <div className="flex aspect-[4/5] w-full items-center justify-center bg-paper-dim text-sm text-ink/40">
                  Events coming soon
                </div>
              </div>
            ) : (
              heroPhotos.map((e, i) => (
                <Link
                  key={e.id}
                  href={`/events/${e.id}`}
                  className="polaroid absolute w-[62%] transition-transform hover:z-20 hover:scale-105"
                  style={{
                    transform: `rotate(${rotations[i % rotations.length]}deg)`,
                    left: `${i * 16}%`,
                    top: `${i * 14}%`,
                    zIndex: i,
                  }}
                >
                  {i === 0 && (
                    <span className="washi-tape absolute -top-2 left-1/2 z-10 -translate-x-1/2 -rotate-3 rounded-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                      Live now
                    </span>
                  )}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-paper-dim">
                    <img
                      src={e.banners?.["1x1"]}
                      alt={e.name}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                  <p className="font-marker mt-2 truncate text-center text-lg leading-none text-ink/80">
                    {e.name}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Stats bar                                                         */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-ink py-8">
        <div className="mx-auto grid w-[92%] max-w-4xl grid-cols-3 divide-x divide-paper/15 sm:w-[88%]">
          {[
            { label: "Events hosted", value: stats.events },
            { label: "Registrations", value: stats.registrations },
            { label: "Clubs & departments", value: stats.clubs },
          ].map((s) => (
            <div key={s.label} className="px-2 text-center sm:px-6">
              <p className="font-display text-3xl text-paper sm:text-4xl">
                {s.value === null ? "—" : `${s.value}+`}
              </p>
              <p className="mt-1 text-xs text-paper/60 sm:text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Upcoming Events                                                   */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-y-2 border-dashed border-ink/15 bg-secondary/50 py-14">
        <div className="mx-auto w-[92%] max-w-7xl sm:w-[88%]">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-display flex items-center gap-2 text-3xl text-ink md:text-4xl">
              <ScribbleStar className="h-6 w-6 text-hotpink" />
              Upcoming Events
            </h2>
            <Link
              href="/events"
              className="text-sm font-semibold text-ink underline decoration-hotpink decoration-2 underline-offset-4 hover:text-hotpink"
            >
              View All →
            </Link>
          </div>

          {events.length === 0 ? (
            <p className="font-marker text-xl text-ink/50">
              Nothing on the calendar yet — check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {events.slice(0, 6).map((e, i) => {
                const category = toEventCategory(e.name);
                const price = ticketPrices[e.id];
                const location = Array.from(
                  new Set(
                    [e.venue, e.city].filter(
                      (v): v is string =>
                        v != null && v.trim().toLowerCase() !== "tbd"
                    )
                  )
                ).join(", ");

                return (
                  <Link
                    key={e.id}
                    href={`/events/${e.id}`}
                    className="group block"
                  >
                    <TornCard
                      rotate={cardTilts[i % cardTilts.length]}
                      variant={i === 0 ? "both" : "bottom"}
                      className="overflow-hidden transition-transform group-hover:-translate-y-1"
                    >
                      <div className="relative aspect-[16/10] w-full overflow-hidden">
                        <img
                          src={e.banners?.["16:9"] || e.banners?.["1x1"]}
                          alt={e.name}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute left-3 top-3">
                          <CategoryBadge category={category} />
                        </div>
                      </div>
                      <div className="flex gap-3 p-4">
                        <DateChip iso={e.start_datetime} />
                        <div className="min-w-0">
                          <h3 className="font-display truncate text-lg text-ink">
                            {e.name}
                          </h3>
                          {e.club?.name && (
                            <p className="truncate text-xs text-ink/50">
                              {e.club.name}
                            </p>
                          )}
                          {location && (
                            <p className="mt-1 flex items-center gap-1 truncate text-xs text-ink/60">
                              <MapPin className="h-3 w-3 shrink-0" />
                              {location}
                            </p>
                          )}
                          {price !== undefined && (
                            <p className="mt-1 text-xs font-semibold text-hotpink">
                              ₹{price} onwards
                            </p>
                          )}
                        </div>
                      </div>
                    </TornCard>
                  </Link>
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
              fadeOutColor="#f3ede1"
              ariaLabel="Clubs"
            />
          </div>
        )}
      </section>
    </div>
  );
}

export default Page;
