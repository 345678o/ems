"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ArrowLeft, ArrowUpRight, CalendarDays, MapPin, Share2 } from "lucide-react";
import { supabase } from "@/lib/supabase/browserClient";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import type { EventTheme } from "@/lib/utils/theme-color";
import { toEventCategory } from "@/components/ui/category-badge";

interface EventDetail {
  id: string;
  name: string;
  start_datetime: string;
  end_datetime: string;
  event_type: string;
  status: string;
  venue: string;
  city: string;
  country: string;
  additional_details: string;
  banners: Record<string, string>;
  theme_colors: EventTheme | null;
  club_id: string | null;
  clubs: {
    name: string;
    avatar_url: string | null;
    about: string | null;
  } | null;
}

interface PastEvent {
  id: string;
  name: string;
  event_type: string | null;
  end_datetime: string | null;
  banners: Record<string, string>;
}

const PLACEHOLDER_PASSES = [
  { tier: "Platinum", price: "₹799" },
  { tier: "Gold", price: "₹499" },
  { tier: "Silver", price: "₹299" },
];

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [pastEvents, setPastEvents] = useState<PastEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    if (!eventId) return;

    const load = async () => {
      setIsLoading(true);
      const { data: eventData, error } = await supabase
        .from("events")
        .select("*, clubs(name, avatar_url, about)")
        .eq("id", eventId)
        .single();

      if (error) {
        console.error("[event page] fetch error:", error.message);
        setEvent(null);
        setIsLoading(false);
        return;
      }

      setEvent(eventData as EventDetail);

      if (eventData?.club_id) {
        const { data: past } = await supabase
          .from("events")
          .select("id,name,event_type,end_datetime,banners")
          .eq("club_id", eventData.club_id)
          .neq("id", eventId)
          .lt("end_datetime", new Date().toISOString())
          .order("end_datetime", { ascending: false })
          .limit(6);

        setPastEvents((past || []) as PastEvent[]);
      }

      setIsLoading(false);
    };

    load();
  }, [eventId]);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: event?.name, url });
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // clipboard unavailable — nothing more we can do here
    }
  };

  if (isLoading) {
    return (
      <div className="event-world flex min-h-screen items-center justify-center bg-background">
        <p style={{ color: "var(--clr-white)" }}>Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-world flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <p style={{ color: "var(--clr-white)" }}>Event not found.</p>
        <Link href="/events">
          <Button variant="outline" className="rounded-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to events
          </Button>
        </Link>
      </div>
    );
  }

  const heroBanner = event.banners?.["16:9"] || event.banners?.["1x1"];
  const category = toEventCategory(event.event_type);
  const location = [event.venue, event.city, event.country].filter(Boolean).join(", ");

  return (
    <main className="event-world bg-background text-foreground">
      <div className="event-frame page-gutter">
        <aside className="event-rail event-panel event-purple">
          <Link href="/events" className="event-back">
            <ArrowLeft /> All events
          </Link>
          <div className="event-mark" aria-hidden="true">
            <span />
            <span />
          </div>
          <p className="event-rail-kicker">EMS / EVENT DETAIL</p>
          <div className="event-detail-side">
            <p>Type</p>
            <strong>{category.toUpperCase()}</strong>
            <p>Date</p>
            <strong>{format(parseISO(event.start_datetime), "MMM d, yyyy")}</strong>
            <p>Venue</p>
            <strong>{location || "TBA"}</strong>
          </div>
          <button
            type="button"
            disabled
            title="Registration opening soon"
            className="event-cta event-orange"
          >
            Registration opening soon
          </button>
        </aside>

        <div className="event-detail-main">
          <section className="event-detail-hero event-panel event-white">
            <div className="event-detail-hero-copy">
              <p className="event-kicker event-purple-text">Featured experience</p>
              <h1 className="event-display">{event.name}</h1>
              {event.additional_details && <p>{event.additional_details}</p>}
              <button
                type="button"
                onClick={handleShare}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-current px-4 py-2 text-sm font-medium"
              >
                <Share2 className="h-4 w-4" />
                {shareCopied ? "Link copied!" : "Share"}
              </button>
            </div>
            <div className="event-detail-hero-image">
              {heroBanner ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={heroBanner} alt={event.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary via-secondary to-accent text-4xl font-black tracking-[0.2em] text-primary-foreground">
                  EMS
                </div>
              )}
            </div>
          </section>

          <section id="register" className="event-detail-info">
            <div className="event-panel event-orange event-detail-ticket">
              <p className="event-kicker">Save your seat</p>
              <div className="mt-2 space-y-2">
                {PLACEHOLDER_PASSES.map((pass) => (
                  <div key={pass.tier} className="flex items-center justify-between text-sm font-semibold">
                    <span>{pass.tier}</span>
                    <span>{pass.price}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                disabled
                title="Registration opening soon"
                className="event-detail-button"
              >
                Register interest <ArrowUpRight />
              </button>
            </div>
            <div className="event-panel event-purple event-detail-brief">
              <p className="event-kicker">What to expect</p>
              <h2>
                Show up
                <br />
                curious.
              </h2>
              <p>
                Bring your questions, meet your next collaborator, and leave with a practical next
                step.
              </p>
            </div>
            <div className="event-panel event-white event-detail-facts">
              <div>
                <CalendarDays />
                <p className="event-kicker">Date & time</p>
                <strong>
                  {format(parseISO(event.start_datetime), "MMM d, yyyy")}
                  <br />
                  {format(parseISO(event.start_datetime), "h:mm a")}
                  {event.end_datetime &&
                    ` – ${format(parseISO(event.end_datetime), "h:mm a")}`}
                </strong>
              </div>
              <div>
                <MapPin />
                <p className="event-kicker">Where</p>
                <strong>{location || "TBA"}</strong>
              </div>
            </div>
          </section>

          {event.clubs && (
            <section className="event-panel event-white" style={{ padding: "2rem", marginTop: "1.5rem" }}>
              <p className="event-kicker event-purple-text">Organized by</p>
              <div className="mt-3 flex flex-col items-start gap-5 sm:flex-row">
                <Avatar className="h-20 w-20 shrink-0 border-2 border-ink/70">
                  <AvatarImage src={event.clubs.avatar_url ?? undefined} />
                  <AvatarFallback className="text-xl">{event.clubs.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-display mb-1.5 text-xl">{event.clubs.name}</p>
                  <p className="text-sm opacity-70">{event.clubs.about}</p>
                </div>
              </div>
            </section>
          )}

          {pastEvents.length > 0 && (
            <section className="event-related">
              <div className="event-section-heading">
                <p className="event-kicker">Keep exploring</p>
                <h2>More from EMS</h2>
              </div>
              <Carousel opts={{ align: "start" }}>
                <CarouselContent>
                  {pastEvents.map((pe) => (
                    <CarouselItem key={pe.id} className="basis-1/2 md:basis-1/3">
                      <Link href={`/events/${pe.id}`} className="event-panel event-white event-related-card">
                        {pe.banners?.["1x1"] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={pe.banners["1x1"]} alt={`${pe.name} artwork`} loading="lazy" />
                        )}
                        <div>
                          <p className="event-kicker event-purple-text">
                            {toEventCategory(pe.event_type).toUpperCase()}
                            {pe.end_datetime &&
                              ` · ${format(parseISO(pe.end_datetime), "MMM d")}`}
                          </p>
                          <h3>{pe.name}</h3>
                          <ArrowUpRight />
                        </div>
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="border-border bg-card text-foreground" />
                <CarouselNext className="border-border bg-card text-foreground" />
              </Carousel>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
