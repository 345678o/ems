"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarPlus } from "lucide-react";
import { HeroBanner } from "@/components/discover/HeroBanner";
import { clubHref, clubLogo } from "@/components/discover/types";
import { ErrorState } from "@/components/discover/LoadStates";
import {
  friendlyError,
  useClubs,
  type ClubRow,
} from "@/components/discover/useEvents";

type Club = ClubRow;

function ClubCard({ club }: { club: Club }) {
  const logo = club.avatar_url || clubLogo(club.name);
  return (
    <Link
      href={clubHref(club.name)}
      className="dz-card group flex min-h-[136px] flex-col gap-4 p-4 sm:h-[168px] sm:gap-0"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-[var(--dz-surface-3)] text-ui font-semibold text-zinc-300">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo}
              alt=""
              className="size-full bg-white object-cover"
            />
          ) : (
            club.name.slice(0, 2).toUpperCase()
          )}
        </span>
        <span
          className="grid size-8 shrink-0 place-items-center rounded-lg text-faint transition-colors group-hover:bg-white/[0.06] group-hover:text-white"
          aria-hidden
        >
          <ArrowUpRight className="size-4" />
        </span>
      </div>
      <h3 className="mt-auto truncate text-[15px] font-semibold">
        {club.name}
      </h3>
      <p className="mt-1 line-clamp-2 text-ui leading-snug text-zinc-400">
        {club.about || "Student community at MLRIT."}
      </p>
    </Link>
  );
}

export default function ClubsPage() {
  const { clubs, status, error, retry } = useClubs();
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? clubs.filter((c) =>
          [c.name, c.about].some((v) => v?.toLowerCase().includes(q))
        )
      : clubs;
  }, [clubs, query]);

  return (
    <div className="flex flex-col gap-6">
      <HeroBanner
        titleAs="h1"
        image="/events/welcome-gate.jpg"
        eyebrow="Campus communities"
        tags={[`${clubs.length || "—"} clubs`, "MLRIT"]}
        title="Find your circle"
        description="Active clubs and communities across campus, from code and robotics to debate and service."
        primary={{ label: "Browse events", href: "/events" }}
        secondary={{
          label: "Calendar",
          href: "/calendar",
          icon: (
            <CalendarPlus className="size-3.5" strokeWidth={1.8} aria-hidden />
          ),
        }}
      />

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">All clubs</h2>
          <div className="flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter clubs"
              aria-label="Filter clubs"
              className="dz-input w-48 px-3"
            />
            <span className="dz-chip">
              {visible.length} club{visible.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {status === "loading" ? (
          <div
            role="status"
            aria-label="Loading clubs"
            className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4"
          >
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className="dz-card h-[168px] animate-pulse bg-[var(--dz-surface-2)]"
              />
            ))}
          </div>
        ) : status === "error" ? (
          <ErrorState
            className="mt-3"
            title="Clubs didn't load"
            message={friendlyError(error)}
            onRetry={retry}
          />
        ) : visible.length === 0 ? (
          <p className="dz-panel mt-3 p-6 text-ui text-zinc-400">
            No clubs found.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
            {visible.map((c) => (
              <ClubCard key={c.id} club={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
