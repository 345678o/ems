"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, MoveDown } from "lucide-react";
import logger from "@/lib/logger";
import { supabase } from "@/lib/supabase/browserClient";
import { toEventCategory } from "@/components/ui/category-badge";
import { SpacePanel } from "@/components/ems/SpacePanel";

type EventRow = {
  id: string;
  name: string;
  description: string | null;
  event_type: string | null;
  venue: string | null;
  city: string | null;
  start_datetime: string | null;
  club: { name: string } | null;
};

function eventLocation(e: Pick<EventRow, "venue" | "city">) {
  return Array.from(
    new Set([e.venue, e.city].filter((v): v is string => v != null && v.trim().toLowerCase() !== "tbd"))
  ).join(", ");
}

function formatEventTime(iso: string | null) {
  if (!iso) return "Time TBA";
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [participants, setParticipants] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id,name,description,event_type,venue,city,start_datetime,clubs(name)")
        .order("start_datetime", { ascending: true });

      if (error) {
        logger.error("[events] fetch error:", error.message);
        setEvents([]);
        return;
      }

      type RawEvent = {
        id: string;
        name: string;
        description: string | null;
        event_type: string | null;
        venue: string | null;
        city: string | null;
        start_datetime: string | null;
        clubs: { name: string } | { name: string }[] | null;
      };

      setEvents(
        ((data as unknown as RawEvent[]) || []).map((e) => ({
          ...e,
          club: Array.isArray(e.clubs) ? (e.clubs[0] ?? null) : e.clubs,
        }))
      );
    };
    load();

    supabase
      .from("event_participants")
      .select("id", { count: "exact", head: true })
      .then(({ count, error }) => {
        if (error) {
          logger.error("[events] participants count error:", error.message);
          return;
        }
        setParticipants(count ?? null);
      });
  }, []);

  useEffect(() => {
    const rows = document.querySelectorAll<HTMLElement>(".event-row-reveal");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = el.style.getPropertyValue("--row-delay") || "0ms";
            setTimeout(() => el.classList.add("is-visible"), parseInt(delay));
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.1 }
    );
    rows.forEach((r) => obs.observe(r));
    return () => obs.disconnect();
  }, [events]);

  const now = new Date();
  const nextEvent =
    events.find((e) => e.start_datetime && new Date(e.start_datetime) >= now) ?? events[0];

  return (
    <main className="event-world bg-background text-foreground">
      <div className="event-frame page-gutter">
        <aside className="event-rail event-panel event-purple">
          <div className="event-mark" aria-hidden="true">
            <span />
            <span />
          </div>
          <p className="event-rail-kicker">EMS / MLRIT</p>
          <nav className="event-rail-nav" aria-label="Event sections">
            <a href="#about">About</a>
            <a href="#schedule">Events</a>
            <a href="#community">Community</a>
            <a href="#contact">Contact</a>
          </nav>
          <a href="#schedule" className="event-cta event-orange">
            Explore schedule <ArrowUpRight />
          </a>
        </aside>

        <section id="about" className="event-intro">
          <p className="event-kicker event-purple-text">Campus experiences / 2026</p>
          <h1 className="event-display">
            Make room
            <br />
            <span>for what&apos;s next.</span>
          </h1>
          <p className="event-intro-copy">
            A living programme of workshops, challenges, summits and showcases for the people
            building the next chapter of campus.
          </p>
          <a className="event-scroll-cue" href="#schedule">
            <MoveDown /> Scroll to explore
          </a>
        </section>

        <div className="event-schedule-pair">
          <section id="schedule" className="event-schedule">
            <div className="event-section-heading">
              <p className="event-kicker">Upcoming schedule</p>
              <h2>
                Meetups &<br />
                workshops
              </h2>
            </div>
            {events.length === 0 ? (
              <p className="event-row-description">No events on the schedule yet.</p>
            ) : (
              events.map((event, index) => {
                const d = event.start_datetime ? new Date(event.start_datetime) : null;
                return (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="event-row event-panel event-purple event-row-reveal"
                    style={{ "--row-delay": `${index * 80}ms` } as React.CSSProperties}
                  >
                    <div className="event-date event-white">
                      <strong>{d ? String(d.getDate()).padStart(2, "0") : "—"}</strong>
                      <span>{d ? d.toLocaleDateString("en-IN", { month: "short" }).toUpperCase() : "TBA"}</span>
                    </div>
                    <div className="event-row-content">
                      <ArrowUpRight className="event-row-arrow" />
                      <p className="event-kicker">{toEventCategory(event.name).toUpperCase()}</p>
                      <h3>{event.name}</h3>
                      <p className="event-row-description">{event.description}</p>
                      <div className="event-row-meta">
                        <span>{event.club?.name ?? "EMS"}</span>
                        <span>{formatEventTime(event.start_datetime)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </section>
          <SpacePanel />
        </div>

        <section id="community" className="event-community">
          <div className="event-panel event-orange event-stat">
            <strong>{participants === null ? "—" : `${participants}+`}</strong>
            <span>active participants</span>
          </div>
          <div className="event-panel event-white event-stat">
            <strong>06</strong>
            <span>ways to get involved</span>
          </div>
          <div className="event-panel event-purple event-community-copy">
            <p className="event-kicker">The EMS spirit</p>
            <h2>
              Bring an idea.
              <br />
              Leave with momentum.
            </h2>
            <p>Meet curious people, learn in public, and turn campus energy into something real.</p>
          </div>
        </section>

        <footer id="contact" className="event-footer">
          <div className="event-panel event-purple">
            <p className="event-kicker">Get in touch</p>
            <h2>
              See you
              <br />
              at EMS.
            </h2>
            <a href="mailto:hello@ems.mlrit.in">
              hello@ems.mlrit.in <ArrowUpRight />
            </a>
          </div>
          {nextEvent && (
            <div className="event-panel event-orange event-footer-next">
              <p className="event-kicker">Next event</p>
              <h3>{nextEvent.name}</h3>
              <p>
                {nextEvent.start_datetime
                  ? new Date(nextEvent.start_datetime).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })
                  : "TBA"}{" "}
                · {eventLocation(nextEvent) || "Venue TBA"}
              </p>
              <Link href={`/events/${nextEvent.id}`}>
                View event <ArrowUpRight />
              </Link>
            </div>
          )}
        </footer>
      </div>
    </main>
  );
}
