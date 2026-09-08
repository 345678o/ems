"use client";
import logger from "@/lib/logger";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Anton } from "next/font/google";
import { MapPin, CalendarDays } from "lucide-react";
import { FocusCardsRow } from "@/components/ui/focus-cards";
import FadeContent from "@/components/fade-content";
import LogoLoop from "@/components/logo-loop";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { GradientButton } from "@/components/ui/gradient-button";
import { supabase } from "@/lib/supabase/browserClient";
import { cn } from "@/lib/utils";
import type { EventTheme } from "@/lib/utils/theme-color";

const anton = Anton({ weight: "400", subsets: ["latin"] });

function Page() {
  const [events, setEvents] = useState<
    Array<{
      id: string;
      name: string;
      venue: string | null;
      city: string | null;
      banners: Record<string, string>;
      theme_colors: EventTheme | null;
      start_datetime: string | null;
      club: { name: string } | null;
    }>
  >([]);
  const [clubs, setClubs] = useState<
    Array<{ id: string; name: string; avatar_url: string | null }>
  >([]);
  const [ticketPrices, setTicketPrices] = useState<Record<string, number>>({});
  const [heroApi, setHeroApi] = useState<CarouselApi>();
  const [heroIndex, setHeroIndex] = useState(0);

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

        type HomeEvent = {
          id: string;
          name: string;
          venue: string | null;
          city: string | null;
          banners: Record<string, string> | null;
          theme_colors: EventTheme | null;
          start_datetime: string | null;
          clubs: { name: string } | { name: string }[] | null;
        };
        const filtered = ((data as unknown as HomeEvent[]) || []).filter(
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
        console.error("[home] ticket price fetch error:", error.message);
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
    if (!heroApi) return;
    setHeroIndex(heroApi.selectedScrollSnap());
    const onSelect = () => setHeroIndex(heroApi.selectedScrollSnap());
    heroApi.on("select", onSelect);
    return () => {
      heroApi.off("select", onSelect);
    };
  }, [heroApi]);

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

  const cards = useMemo(
    () =>
      events.map((e) => ({
        title: e.name,
        src: e.banners?.["1x1"] || "",
        href: `/events/${e.id}`,
        colors: e.theme_colors ?? undefined,
      })),
    [events]
  );

  const clubLogos = useMemo(
    () =>
      clubs.map((c) => ({
        node: (
          <Avatar className="h-[50px] w-[50px] border-2 border-white/10 ring-2 ring-[#D96CE5]/20">
            <AvatarImage src={c.avatar_url ?? undefined} alt={c.name} />
            <AvatarFallback className="bg-gradient-to-br from-[#D96CE5] to-[#7B2FE5] text-white">
              {c.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        ),
        title: c.name,
        ariaLabel: c.name,
      })),
    [clubs]
  );

  return (
    <div className="relative min-h-screen bg-[#141414] overflow-hidden">
      {/* Ambient glow — festival-lights atmosphere behind the hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 20% 20%, #7B2FE5 0%, transparent 70%), radial-gradient(50% 50% at 85% 10%, #D96CE5 0%, transparent 70%)",
        }}
      />

      {/* Hero — split layout, one live event at a time */}
      {events.length > 0 && (
        <section className="relative mx-auto w-[90%] max-w-7xl pt-10 pb-4 sm:w-[85%] md:w-[75%] lg:w-[70%]">
          <Carousel
            opts={{ align: "center", loop: true }}
            setApi={setHeroApi}
          >
            <CarouselContent>
              {events.map((e) => {
                const price = ticketPrices[e.id];
                const badge = e.start_datetime
                  ? new Date(e.start_datetime).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })
                  : "Coming soon";
                const location = Array.from(
                  new Set(
                    [e.venue, e.city].filter(
                      (v): v is string =>
                        v != null && v.trim().toLowerCase() !== "tbd"
                    )
                  )
                ).join(", ");

                return (
                  <CarouselItem key={e.id} className="basis-full">
                    <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
                      {/* Left — event details */}
                      <div className="order-2 md:order-1">
                        <div className="mb-4 flex items-center gap-2">
                          <CalendarDays className="h-3.5 w-3.5 text-[#FF8AC9]" />
                          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#FF8AC9]">
                            {badge}
                          </span>
                        </div>

                        <h1
                          className={`${anton.className} text-3xl leading-tight tracking-wide text-white md:text-5xl`}
                        >
                          {e.name}
                        </h1>

                        {e.club?.name && (
                          <p className="mt-3 text-sm text-neutral-400 md:text-base">
                            Hosted by{" "}
                            <span className="text-neutral-200">
                              {e.club.name}
                            </span>
                          </p>
                        )}

                        {location && (
                          <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-400 md:text-base">
                            <MapPin className="h-4 w-4 shrink-0" />
                            {location}
                          </p>
                        )}

                        {price !== undefined && (
                          <p className="mt-4 text-lg font-semibold text-white">
                            ₹{price} onwards
                          </p>
                        )}

                        <Link href={`/events/${e.id}`} className="mt-6 inline-block">
                          <GradientButton className="text-base">
                            Book tickets
                          </GradientButton>
                        </Link>
                      </div>

                      {/* Right — banner card */}
                      <Link
                        href={`/events/${e.id}`}
                        className="order-1 md:order-2"
                      >
                        <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_20px_60px_-15px_rgba(123,47,229,0.35)]">
                          <img
                            src={e.banners?.["1x1"]}
                            alt={e.name}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        </div>
                      </Link>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>

            {events.length > 1 && (
              <>
                <CarouselPrevious className="-left-4 top-1/2 h-11 w-11 -translate-y-1/2 border-none bg-neutral-800/80 text-white hover:bg-neutral-700 md:-left-12" />
                <CarouselNext className="-right-4 top-1/2 h-11 w-11 -translate-y-1/2 border-none bg-neutral-800/80 text-white hover:bg-neutral-700 md:-right-12" />
              </>
            )}
          </Carousel>

          {events.length > 1 && (
            <div className="mt-6 flex items-center justify-center gap-1.5">
              {events.map((e, i) => (
                <button
                  key={e.id}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => heroApi?.scrollTo(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === heroIndex
                      ? "w-6 bg-white"
                      : "w-1.5 bg-white/25 hover:bg-white/40"
                  )}
                />
              ))}
            </div>
          )}
        </section>
      )}

      <div className="relative z-10 w-full mb-10">
        <div className="mt-20">
          <FadeContent
            blur={true}
            duration={500}
            easing="ease-out"
            initialOpacity={0}
            delay={500}
          >
            <div id="live-now" className="scroll-mt-24">
              <FocusCardsRow
                title="Recommended for you"
                cards={cards}
                seeAllHref="/events"
              />
            </div>
          </FadeContent>
        </div>

        <div className="mt-20">
          <FadeContent
            blur={true}
            duration={500}
            easing="ease-out"
            initialOpacity={0}
          >
            <div className="mx-auto w-[90%] px-4 sm:w-[85%] md:w-[75%] md:px-6 lg:w-[70%]">
              <h2
                className={`${anton.className} text-2xl tracking-wide text-white md:text-3xl`}
              >
                Happening Soon
              </h2>

              <div className="mt-6 divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                {events.length === 0 ? (
                  <p className="px-5 py-6 text-sm text-neutral-500">
                    Nothing on the calendar yet — check back soon.
                  </p>
                ) : (
                  events.map((e) => (
                    <Link
                      key={e.id}
                      href={`/events/${e.id}`}
                      className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.04]"
                    >
                      <img
                        src={e.banners?.["1x1"] || ""}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded-lg object-cover"
                      />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-white md:text-base">
                        {e.name}
                      </span>
                      <span className="hidden shrink-0 text-sm text-neutral-400 sm:block">
                        {e.start_datetime
                          ? new Date(e.start_datetime).toLocaleDateString(
                              "en-IN",
                              { day: "numeric", month: "short", year: "numeric" }
                            )
                          : "TBA"}
                      </span>
                      <span className="shrink-0 rounded-full bg-gradient-to-r from-[#FF8AC9] via-[#D96CE5] to-[#7B2FE5] px-4 py-1.5 text-xs font-semibold text-white">
                        Register
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </FadeContent>
        </div>

        <div className="mt-20">
          <FadeContent
            blur={true}
            duration={500}
            easing="ease-out"
            initialOpacity={0}
          >
            <div
              id="clubs"
              className="mx-auto mb-10 w-[90%] scroll-mt-24 px-4 sm:w-[85%] md:w-[75%] md:px-6 lg:w-[70%]"
            >
              <h2
                className={`${anton.className} text-2xl tracking-wide text-white md:text-3xl`}
              >
                Powered by our Clubs
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                The student communities behind every fest on this page.
              </p>
            </div>

            {/* LogoLoop of real clubs, framed like a dashed ticket strip */}
            {clubLogos.length > 0 && (
              <div className="relative w-full overflow-hidden border-y border-dashed border-white/10 bg-white/[0.02] py-2">
                <LogoLoop
                  logos={clubLogos}
                  speed={80}
                  direction="left"
                  logoHeight={50}
                  gap={48}
                  pauseOnHover
                  scaleOnHover
                  fadeOut
                  fadeOutColor="#141414"
                  ariaLabel="Clubs"
                />
              </div>
            )}
          </FadeContent>
        </div>
      </div>
    </div>
  );
}

export default Page;
