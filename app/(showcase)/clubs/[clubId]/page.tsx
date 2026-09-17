"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft, CalendarDays } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { SiteFooter } from "@/components/ems/site-shell";
import RingGallery from "@/components/originkit/ui/ring-gallery";
import { supabase } from "@/lib/supabase/browserClient";

type Club = {
  id: string;
  name: string;
  about: string | null;
  avatar_url: string | null;
};

type ClubEvent = {
  id: string;
  name: string;
  start_datetime: string;
  venue: string | null;
};

const fallbackPosters = [
  { id: "equinox", name: "Equinox" },
  { id: "hustle-mania", name: "Hustle Mania" },
  { id: "welcome-2", name: "Welcome 2.0" },
  { id: "metaloop", name: "Metaloop" },
  { id: "b2b", name: "B2B" },
];

const blankPlaceholder =
  "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

const clubImages: Record<string, string> = {
  APEX: "/clubs/apex",
  AREO: "/clubs/areo",
  CAME: "/clubs/came",
  CIE: "/clubs/cie",
  CODE: "/clubs/code",
  EWB: "/clubs/EWB",
  LIT: "/clubs/lit",
  MUN: "/clubs/mun",
  NSS: "/clubs/nss",
  SCOPE: "/clubs/scope",
};

const placeholderEventDetails = [
  {
    image: "/events/equniox.png",
    date: "October 18, 2026",
    venue: "Innovation Hall",
    description: "An evening of ideas, energy, and new connections.",
  },
  {
    image: "/events/hustle mania.png",
    date: "November 06, 2026",
    venue: "MLRIT Main Auditorium",
    description: "A fast-paced showcase built for curious minds.",
  },
];

function EventRingGallery({
  events,
  clubImage,
}: {
  events: ClubEvent[];
  clubImage?: string;
}) {
  const posters = events.length
    ? events.map((event, index) => ({
        id: event.id,
        name: event.name,
        image:
          index < placeholderEventDetails.length
            ? placeholderEventDetails[index].image
            : blankPlaceholder,
      }))
    : fallbackPosters.map((poster, index) => ({
        ...poster,
        image:
          index < placeholderEventDetails.length
            ? placeholderEventDetails[index].image
            : blankPlaceholder,
      }));
  const ringPosters = Array.from({ length: 20 }, (_, index) => {
    const poster = posters[index % posters.length];
    return {
      ...poster,
      image:
        index < placeholderEventDetails.length
          ? poster.image
          : blankPlaceholder,
    };
  });
  const [selectedPoster, setSelectedPoster] = useState<
    (typeof ringPosters)[number] | null
  >(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedDetails =
    selectedIndex < placeholderEventDetails.length
      ? placeholderEventDetails[selectedIndex]
      : {
          image: blankPlaceholder,
          date: "Event date placeholder",
          venue: "Venue placeholder",
          description: "Event information will appear here.",
        };

  return (
    <div className="club-ring-gallery relative flex h-[520px] w-full items-center justify-center overflow-hidden sm:h-[650px]">
      <RingGallery
        images={ringPosters.map((poster) => ({
          image: { src: poster.image || blankPlaceholder, alt: poster.name },
        }))}
        ring={{ radiusX: 210, radiusY: 210, tilt: true, repeat: 1 }}
        cardWidth={125}
        cardHeight={165}
        rounded={5}
        direction="anticlockwise"
        stack="firstOnTop"
        drag
        onSelect={(index) => {
          setSelectedIndex(index);
          setSelectedPoster(ringPosters[index]);
        }}
        style={{ width: "100%", height: "520px" }}
      />
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-[500000] grid h-40 w-40 -translate-x-1/2 -translate-y-1/2 place-items-center overflow-hidden rounded-full border border-white/10 bg-[#121212] shadow-2xl shadow-black/50 sm:h-52 sm:w-52">
        {clubImage ? (
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden p-2 sm:p-3">
            <Image
              src={clubImage}
              alt=""
              fill
              sizes="(max-width: 640px) 160px, 208px"
              className="scale-[1.16] object-contain"
              style={{
                objectPosition: "center",
                filter: "drop-shadow(0 8px 10px rgba(0,0,0,0.28))",
              }}
              unoptimized
            />
          </div>
        ) : (
          <span className="text-2xl font-semibold text-white/30">CLUB</span>
        )}
      </div>
      <div className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 text-xs uppercase tracking-[0.16em] text-white/45">
        <span>Event placeholders</span>
      </div>
      {selectedPoster ? (
        <div
          className="absolute inset-0 z-[1000000] grid grid-cols-2 gap-16 bg-[#121212]/35 px-6 py-8 backdrop-blur-[1px] sm:gap-16 sm:px-10"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedPoster(null);
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedPoster(null)}
            className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-black/60 transition hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <button
            type="button"
            aria-label="Close event placeholder"
            onClick={() => setSelectedPoster(null)}
            className="group relative flex items-center justify-center bg-white/90 text-black shadow-2xl transition-transform duration-500 animate-in slide-in-from-left-8 hover:bg-white"
          >
            <Image
              src={selectedDetails.image}
              alt={selectedPoster.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="absolute inset-0 h-full w-full object-cover"
              unoptimized
            />
            <span className="absolute inset-0 bg-black/25" />
            <span className="relative text-2xl font-semibold uppercase tracking-tight text-white sm:text-4xl">
              {selectedPoster.name}
            </span>
            <span className="absolute bottom-4 text-[10px] uppercase tracking-[0.2em] text-black/45">
              Event card
            </span>
          </button>
          <div className="flex flex-col justify-center bg-white/90 px-6 text-black shadow-2xl animate-in slide-in-from-right-8 sm:px-10">
            <span className="text-xs uppercase tracking-[0.2em] text-black/45">
              Event details
            </span>
            <span className="mt-3 text-2xl font-semibold uppercase tracking-tight sm:text-4xl">
              {selectedPoster.name}
            </span>
            <span className="mt-5 text-sm text-black/60">
              {selectedDetails.description}
            </span>
            <span className="mt-6 text-xs uppercase tracking-[0.16em] text-black/50">
              {selectedDetails.date} | {selectedDetails.venue}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function ClubPage() {
  const params = useParams<{ clubId: string }>();
  const clubId = params.clubId;
  const [club, setClub] = useState<Club | null>(null);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadClub = async () => {
      setIsLoading(true);
      const decodedId = decodeURIComponent(clubId);
      const { data: clubs } = await supabase
        .from("clubs")
        .select("id,name,about,avatar_url")
        .ilike("name", decodedId)
        .limit(1);

      const matchedClub = clubs?.[0] as Club | undefined;
      if (!matchedClub) {
        setClub({
          id: decodedId,
          name: decodedId.toUpperCase(),
          about: null,
          avatar_url: null,
        });
        setIsLoading(false);
        return;
      }

      setClub(matchedClub);
      const { data: eventData } = await supabase
        .from("events")
        .select("id,name,start_datetime,venue")
        .eq("club_id", matchedClub.id)
        .order("start_datetime", { ascending: true });
      setEvents((eventData as ClubEvent[]) || []);
      setIsLoading(false);
    };

    void loadClub();
  }, [clubId]);

  if (isLoading) {
    return (
      <div className="event-world flex min-h-screen items-center justify-center bg-background">
        <p style={{ color: "var(--clr-white)" }}>Loading club...</p>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="event-world flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <p style={{ color: "var(--clr-white)" }}>Club not found.</p>
        <Link href="/clubs" className="meta flex items-center gap-2" style={{ color: "var(--clr-orange)" }}>
          <ArrowLeft className="size-4" />
          All clubs
        </Link>
      </div>
    );
  }

  return (
    <main>
      <section className="relative min-h-[75svh]" style={{ background: "var(--clr-purple)", color: "var(--clr-white)" }}>
        <div className="page-gutter mx-auto grid min-h-[75svh] max-w-[1400px] items-end gap-10 pb-16 pt-32 md:grid-cols-12">
          <div className="md:col-span-8">
            <Link href="/clubs" className="meta flex items-center gap-2" style={{ color: "var(--clr-orange)" }}>
              <ArrowLeft className="size-4" />
              All clubs
            </Link>
            <h1 className="display-lg mt-8 uppercase" style={{ color: "var(--clr-white)" }}>
              {club.name}
            </h1>
            {club.about && (
              <p className="mt-6 text-xl" style={{ color: "rgba(233,236,239,0.7)" }}>
                {club.about}
              </p>
            )}
          </div>
          <div
            className="flex aspect-square w-full items-center justify-center rounded-3xl text-7xl font-black tracking-[0.2em] md:col-span-3 md:col-start-10"
            style={{
              border: "1px solid rgba(233,236,239,0.2)",
              background: "rgba(233,236,239,0.07)",
              color: "var(--clr-white)",
            }}
          >
            {club.name.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </section>

      <section className="section-pad page-gutter" style={{ background: "var(--clr-white)" }}>
        <div className="mx-auto grid max-w-[1400px] gap-10 md:grid-cols-12">
          <h2 className="text-5xl font-semibold md:col-span-4" style={{ color: "var(--clr-black)" }}>
            Built by students,
            <br />
            open to ideas.
          </h2>
          <div className="md:col-span-7 md:col-start-6">
            <p className="text-2xl leading-relaxed" style={{ color: "rgba(33,37,41,0.75)" }}>
              {club.name} is part of the MLRIT student community
              {club.about ? `, bringing people together through ${club.about.toLowerCase()}` : ""}.
            </p>
            <div className="mt-16">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="meta flex items-center gap-2" style={{ color: "var(--clr-purple)" }}>
                  <CalendarDays className="size-4" />
                  Events
                </h3>
                <span className="meta" style={{ color: "rgba(33,37,41,0.4)" }}>
                  Hover to explore
                </span>
              </div>
              <EventRingGallery
                events={events}
                clubImage={club.avatar_url || clubImages[club.name.toUpperCase()]}
              />
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
