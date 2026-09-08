"use client";

import logger from "@/lib/logger";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { MapPin, CalendarDays, Compass, Ticket } from "lucide-react";
import { supabase } from "@/lib/supabase/browserClient";
import { TornCard } from "@/components/ui/torn-card";
import { ScribbleStar } from "@/components/ui/scribble";
import { Calendar } from "@/components/ui/calendar";

type DashboardEvent = {
  id: string;
  name: string;
  venue: string | null;
  city: string | null;
  start_datetime: string;
  end_datetime: string;
};

const QUICK_LINKS = [
  { label: "Browse Events", href: "/events", icon: Compass },
  { label: "My Bookings", href: "/user/profile?tab=my-bookings", icon: Ticket },
  { label: "Event Calendar", href: "/calendar", icon: CalendarDays },
];

function StatTile({ label, value }: { label: string; value: number | null }) {
  return (
    <TornCard className="flex-1 px-6 py-5 text-center">
      <p className="font-display text-4xl text-ink">
        {value === null ? "—" : value}
      </p>
      <p className="mt-1 text-sm text-foreground/60">{label}</p>
    </TornCard>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [registeredEvents, setRegisteredEvents] = useState<DashboardEvent[]>(
    []
  );
  const [upcoming, setUpcoming] = useState<DashboardEvent[]>([]);
  const [pastCount, setPastCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  useEffect(() => {
    const email = session?.user?.email;
    if (!email) return;

    const load = async () => {
      setLoading(true);
      try {
        const { data: participantRows, error: participantError } =
          await supabase
            .from("event_participants")
            .select("event_id")
            .eq("email", email);

        if (participantError) {
          logger.error(
            "[dashboard] participant fetch error:",
            participantError.message
          );
          setRegisteredEvents([]);
          setUpcoming([]);
          setPastCount(0);
          return;
        }

        const eventIds = Array.from(
          new Set((participantRows || []).map((r) => r.event_id))
        );

        if (eventIds.length === 0) {
          setRegisteredEvents([]);
          setUpcoming([]);
          setPastCount(0);
          return;
        }

        const { data: events, error: eventsError } = await supabase
          .from("events")
          .select("id,name,venue,city,start_datetime,end_datetime")
          .in("id", eventIds);

        if (eventsError) {
          logger.error("[dashboard] events fetch error:", eventsError.message);
          setRegisteredEvents([]);
          setUpcoming([]);
          setPastCount(0);
          return;
        }

        const rows = (events || []) as DashboardEvent[];
        setRegisteredEvents(rows);

        // Classify here (in the effect, not during render) since it
        // depends on the current wall-clock time.
        const now = Date.now();
        setUpcoming(
          rows
            .filter((e) => new Date(e.start_datetime).getTime() >= now)
            .sort(
              (a, b) =>
                new Date(a.start_datetime).getTime() -
                new Date(b.start_datetime).getTime()
            )
        );
        setPastCount(
          rows.filter((e) => new Date(e.end_datetime).getTime() < now).length
        );
      } catch (err: unknown) {
        logger.error(
          "[dashboard] unexpected error:",
          err instanceof Error ? err.message : err
        );
        setRegisteredEvents([]);
        setUpcoming([]);
        setPastCount(0);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [session?.user?.email]);

  const displayName =
    session?.user?.name?.split(" ")[0] || session?.user?.email || "there";

  return (
    <div className="paper-grain min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <h1 className="font-display text-3xl text-ink sm:text-4xl">
          Hey {displayName}! <span aria-hidden>👋</span>
        </h1>
        <p className="font-marker mt-1 text-lg text-hotpink">
          Here&apos;s what&apos;s happening with your events.
        </p>

        {/* Stat tiles */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <StatTile
            label="Upcoming Events"
            value={loading ? null : upcoming.length}
          />
          <StatTile
            label="Registered Events"
            value={loading ? null : registeredEvents.length}
          />
          <StatTile label="Past Events" value={loading ? null : pastCount} />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Upcoming events list */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <ScribbleStar className="h-4 w-4 text-hotpink" />
              <h2 className="font-display text-2xl text-ink">
                Upcoming Events
              </h2>
            </div>

            {!loading && upcoming.length === 0 && (
              <TornCard className="px-6 py-8 text-center">
                <p className="text-foreground/70">
                  No registrations yet — browse events to get started.
                </p>
                <Link
                  href="/events"
                  className="mt-3 inline-block rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
                >
                  Browse Events
                </Link>
              </TornCard>
            )}

            <div className="space-y-3">
              {upcoming.map((e) => {
                const d = new Date(e.start_datetime);
                const location = [e.venue, e.city]
                  .filter((v): v is string => Boolean(v && v.trim()))
                  .join(", ");
                return (
                  <div
                    key={e.id}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
                  >
                    <div className="flex w-14 shrink-0 flex-col items-center rounded-lg border border-ink/10 bg-secondary py-1.5 leading-none shadow-sm">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-hotpink">
                        {d.toLocaleDateString("en-IN", { month: "short" })}
                      </span>
                      <span className="font-display mt-1 text-lg text-ink">
                        {d.getDate()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-display text-base text-foreground">
                        {e.name}
                      </h3>
                      {location && (
                        <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-foreground/60">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {location}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 rounded-full bg-badge-sports px-3 py-1 text-xs font-semibold text-badge-sports-foreground">
                      Registered
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar: calendar + quick links */}
          <div className="space-y-6">
            <TornCard className="px-3 pt-3">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="mx-auto"
              />
            </TornCard>

            <TornCard className="px-5 py-5">
              <h3 className="font-display mb-3 text-lg text-ink">
                Quick Links
              </h3>
              <ul className="space-y-1">
                {QUICK_LINKS.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-paper-dim hover:text-ink"
                      >
                        <Icon className="h-4 w-4 text-hotpink" />
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </TornCard>
          </div>
        </div>
      </div>
    </div>
  );
}
