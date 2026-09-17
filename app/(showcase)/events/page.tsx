"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import LogoLoop from "@/components/logo-loop";
import { ParticipantMenu } from "@/components/ui/participant-menu";
import { ScribbleStar, ScribbleUnderline } from "@/components/ui/scribble";
import {
  CategoryBadge,
  type EventCategory,
} from "@/components/ui/category-badge";
import { Search } from "lucide-react";

// ============================================================================
// PLACEHOLDER EVENT DATA
// ============================================================================

type LiveEvent = {
  image: string;
  title: string;
  category: EventCategory;
  venue: string;
  month: string;
  day: string;
};

const liveEvents: LiveEvent[] = [
  {
    image: "/events/equniox.png",
    title: "Equinox",
    category: "tech",
    venue: "Main Auditorium",
    month: "APR",
    day: "26",
  },
  {
    image: "/events/hustle mania.png",
    title: "Hustle Mania",
    category: "sports",
    venue: "College Grounds",
    month: "APR",
    day: "28",
  },
  {
    image: "/events/wc 2.0.png",
    title: "Welcome 2.0",
    category: "cultural",
    venue: "Main Auditorium",
    month: "MAY",
    day: "03",
  },
  {
    image: "/events/metaloop.png",
    title: "Metaloop",
    category: "tech",
    venue: "CSE Block",
    month: "MAY",
    day: "10",
  },
  {
    image: "/events/B2B.png",
    title: "B2B",
    category: "workshop",
    venue: "Seminar Hall",
    month: "MAY",
    day: "15",
  },
  {
    image: "/events/gi.png",
    title: "GI",
    category: "cultural",
    venue: "Open Grounds",
    month: "MAY",
    day: "18",
  },
  {
    image: "/events/wc.png",
    title: "Welcome",
    category: "cultural",
    venue: "Main Auditorium",
    month: "MAY",
    day: "22",
  },
  {
    image: "/events/welcome-gate.jpg",
    title: "Welcome Gate",
    category: "other",
    venue: "Front Lawn",
    month: "MAY",
    day: "25",
  },
];

const FILTERS: { id: "all" | EventCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "cultural", label: "Cultural" },
  { id: "tech", label: "Tech" },
  { id: "sports", label: "Sports" },
  { id: "workshop", label: "Workshops" },
  { id: "other", label: "Others" },
];

// Club logos data for LogoLoop
const clubLogos = [
  { src: "/clubs/apex", alt: "APEX", title: "APEX" },
  { src: "/clubs/areo", alt: "AREO", title: "AREO" },
  { src: "/clubs/came", alt: "CAME", title: "CAME" },
  { src: "/clubs/cie", alt: "CIE", title: "CIE" },
  { src: "/clubs/code", alt: "CODE", title: "CODE" },
  { src: "/clubs/EWB", alt: "EWB", title: "EWB" },
  { src: "/clubs/lit", alt: "LIT", title: "LIT" },
  { src: "/clubs/mun", alt: "MUN", title: "MUN" },
  { src: "/clubs/nss", alt: "NSS", title: "NSS" },
  { src: "/clubs/scope", alt: "SCOPE", title: "SCOPE" },
];

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function TopBar() {
  return (
    <div className="sticky top-0 z-[60] border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 md:px-6">
        <div className="md:hidden">
          <ParticipantMenu />
        </div>
        <p className="font-marker hidden shrink-0 text-xl text-hotpink md:block">
          EMS <ScribbleStar className="-mt-1 inline h-3 w-3" />
        </p>
        <div className="ml-auto w-full max-w-sm">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
            <input
              type="text"
              placeholder="Search events..."
              className="h-10 w-full rounded-full border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-foreground/40 focus:border-hotpink focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function EventRow({ event }: { event: LiveEvent }) {
  return (
    <a
      href="#"
      className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-3 transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-12px_rgb(0_0_0_/_0.25)] sm:p-4"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-ink/80 shadow-sm sm:h-20 sm:w-20">
        <Image
          src={event.image}
          alt={event.title}
          fill
          sizes="80px"
          className="object-cover"
          unoptimized
        />
      </div>

      <div className="flex shrink-0 flex-col items-center justify-center rounded-xl bg-paper-dim px-3 py-1.5 text-center leading-none">
        <span className="text-[10px] font-bold uppercase tracking-wide text-hotpink">
          {event.month}
        </span>
        <span className="font-display text-lg text-ink">{event.day}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center gap-2">
          <CategoryBadge category={event.category} />
        </div>
        <h3 className="truncate font-display text-base text-foreground sm:text-lg">
          {event.title}
        </h3>
        <p className="truncate text-sm text-foreground/60">{event.venue}</p>
      </div>

      <span
        aria-hidden
        className="hidden shrink-0 text-2xl text-foreground/30 transition-transform group-hover:translate-x-1 group-hover:text-hotpink sm:block"
      >
        →
      </span>
    </a>
  );
}

function ClubAvatarRow() {
  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden">
      <LogoLoop
        logos={clubLogos}
        speed={100}
        direction="left"
        logoHeight={64}
        gap={56}
        pauseOnHover
        scaleOnHover
        fadeOut
        fadeOutColor="#f3ede1"
        ariaLabel="College clubs"
      />
    </div>
  );
}

// ============================================================================
// MAIN EVENTS PAGE COMPONENT
// ============================================================================

export default function EventsPage() {
  const [activeFilter, setActiveFilter] = useState<"all" | EventCategory>(
    "all"
  );
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return liveEvents.filter((e) => {
      const matchesFilter =
        activeFilter === "all" || e.category === activeFilter;
      const matchesQuery = e.title.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, query]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />

      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
        {/* Headline */}
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl leading-none text-ink sm:text-5xl">
              All Events
            </h1>
            <ScribbleUnderline className="mt-2 h-3 w-32 text-hotpink" />
          </div>
          <ScribbleStar className="mb-1 hidden h-6 w-6 text-hotpink sm:block" />
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                activeFilter === f.id
                  ? "border-ink bg-ink text-paper"
                  : "border-border bg-card text-foreground/70 hover:border-ink/40"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search (mobile-visible, mirrors the top bar's on larger screens) */}
        <div className="relative mb-8 md:hidden">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events..."
            className="h-10 w-full rounded-full border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-foreground/40 focus:border-hotpink focus:outline-none"
          />
        </div>
        <div className="mb-8 hidden md:block">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events..."
            className="h-10 w-full max-w-sm rounded-full border border-border bg-card px-4 text-sm text-foreground placeholder:text-foreground/40 focus:border-hotpink focus:outline-none"
          />
        </div>

        {/* Event list */}
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((event) => (
            <EventRow key={event.title} event={event} />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-foreground/50">
              No events match that search.
            </p>
          )}
        </div>

        {/* Browse by Club */}
        <section className="mt-16 pb-10">
          <h2 className="font-display mb-6 text-2xl text-ink sm:text-3xl">
            Browse by club
          </h2>
          <ClubAvatarRow />
        </section>
      </div>
    </div>
  );
}
