"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  CalendarDays,
  Clock,
  MapPin,
  Ticket,
  ArrowLeft,
  ArrowRight,
  Share2,
} from "lucide-react";
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
import { CategoryBadge, toEventCategory } from "@/components/ui/category-badge";
import { ScribbleStar } from "@/components/ui/scribble";

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
  banners: Record<string, string>;
}

const PLACEHOLDER_PASSES = [
  { tier: "Platinum", price: "₹799" },
  { tier: "Gold", price: "₹499" },
  { tier: "Silver", price: "₹299" },
];

function InfoRow({
  icon: Icon,
  children,
}: {
  icon: typeof CalendarDays;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-foreground/80">
      <Icon className="h-4 w-4 shrink-0 text-hotpink" />
      <span>{children}</span>
    </div>
  );
}

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
          .select("id,name,banners")
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-foreground/50">Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <p className="text-foreground/50">Event not found.</p>
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
        <Link
          href="/events"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground/60 hover:text-hotpink"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>

        {/* Banner */}
        <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-3xl border-2 border-ink/80 bg-paper-dim shadow-[0_16px_36px_-16px_rgb(0_0_0_/_0.3)]">
          {heroBanner && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroBanner}
              alt={event.name}
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute left-4 top-4">
            <CategoryBadge category={category} className="shadow-sm" />
          </div>
        </div>

        {/* Title + scribble */}
        <div className="mb-6 flex items-start gap-3">
          <h1 className="font-display text-3xl leading-tight text-ink sm:text-4xl md:text-5xl">
            {event.name}
          </h1>
          <ScribbleStar className="mt-2 hidden h-6 w-6 shrink-0 text-hotpink sm:block" />
        </div>

        {/* Facts row */}
        <div className="mb-8 flex flex-wrap gap-x-8 gap-y-3 rounded-2xl border border-border bg-card p-5">
          <InfoRow icon={CalendarDays}>
            {format(parseISO(event.start_datetime), "MMM d, yyyy")}
            {event.end_datetime &&
              ` - ${format(parseISO(event.end_datetime), "MMM d, yyyy")}`}
          </InfoRow>
          <InfoRow icon={Clock}>
            {format(parseISO(event.start_datetime), "h:mm a")}
          </InfoRow>
          {event.venue && (
            <InfoRow icon={MapPin}>
              {[event.venue, event.city, event.country]
                .filter(Boolean)
                .join(", ")}
            </InfoRow>
          )}
        </div>

        {/* CTAs */}
        <div className="mb-10 flex flex-wrap items-center gap-3">
          <Button
            size="lg"
            disabled
            title="Registration opening soon"
            className="rounded-full bg-ink px-8 text-paper hover:bg-ink/90"
          >
            Registration opening soon
          </Button>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:border-ink/40"
          >
            <Share2 className="h-4 w-4" />
            {shareCopied ? "Link copied!" : "Share"}
          </button>
        </div>

        {/* About */}
        {event.additional_details && (
          <section className="mb-12">
            <h2 className="font-display mb-3 text-2xl text-ink">
              About the Event
            </h2>
            <p className="whitespace-pre-line rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed text-foreground/80">
              {event.additional_details}
            </p>
          </section>
        )}

        {/* Passes — visual-only placeholder, no ticketing backend yet */}
        <section className="mb-12">
          <h2 className="font-display mb-4 flex items-center gap-2 text-2xl text-ink">
            <Ticket className="h-6 w-6 text-hotpink" />
            Passes
          </h2>
          <div className="space-y-3">
            {PLACEHOLDER_PASSES.map((pass) => (
              <div
                key={pass.tier}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3.5"
              >
                <span className="font-semibold text-foreground">
                  {pass.tier}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-foreground/60">{pass.price}</span>
                  <ArrowRight className="h-4 w-4 text-foreground/40" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* About the organizer */}
        {event.clubs && (
          <section className="mb-12">
            <h2 className="font-display mb-4 text-2xl text-ink">
              About the Organizer
            </h2>
            <div className="flex flex-col items-start gap-5 rounded-2xl border border-border bg-card p-6 sm:flex-row">
              <Avatar className="h-20 w-20 shrink-0 border-2 border-ink/70">
                <AvatarImage src={event.clubs.avatar_url ?? undefined} />
                <AvatarFallback className="text-xl">
                  {event.clubs.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-display mb-1.5 text-xl text-ink">
                  {event.clubs.name}
                </p>
                <p className="text-sm text-foreground/70">
                  {event.clubs.about}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Past events */}
        {pastEvents.length > 0 && (
          <section className="mb-6">
            <h2 className="font-display mb-4 text-2xl text-ink">Past Events</h2>
            <Carousel opts={{ align: "start" }}>
              <CarouselContent>
                {pastEvents.map((pe) => (
                  <CarouselItem key={pe.id} className="basis-1/2 md:basis-1/3">
                    <Link href={`/events/${pe.id}`}>
                      <div className="polaroid">
                        <div className="relative aspect-square w-full overflow-hidden bg-paper-dim">
                          {pe.banners?.["1x1"] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={pe.banners["1x1"]}
                              alt={pe.name}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <p className="mt-1 truncate text-center text-sm font-medium text-ink">
                          {pe.name}
                        </p>
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
  );
}
