"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Anton } from "next/font/google";
import { format, parseISO } from "date-fns";
import {
  CalendarDays,
  Clock,
  Globe,
  Ticket,
  ArrowLeft,
  ArrowRight,
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
import { DEFAULT_EVENT_THEME, type EventTheme } from "@/lib/utils/theme-color";

const anton = Anton({ weight: "400", subsets: ["latin"] });

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
  clubs: { name: string; avatar_url: string | null; about: string | null } | null;
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

// Figma reference: hero glow = 3 blurred orbs (the event's 3 extracted colors)
// fading into a flat page background — #141414 in dark mode, #FFF0F0 in light.
function HeroGlow({ theme }: { theme: EventTheme }) {
  const orbs = [
    { color: theme.primary, left: "-8%", top: "-22%" },
    { color: theme.dark, left: "20%", top: "2%" },
    { color: theme.light, left: "57%", top: "-14%" },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {orbs.map((orb, i) => (
        <div
          key={i}
          className="absolute w-[46vw] h-[46vw] max-w-[560px] max-h-[560px] rounded-full blur-[110px]"
          style={{ background: orb.color, left: orb.left, top: orb.top }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#FFF0F0] dark:hidden" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#141414] hidden dark:block" />
    </div>
  );
}

function InfoRow({
  icon: Icon,
  children,
}: {
  icon: typeof CalendarDays;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-neutral-800 dark:text-white/85">
      <Icon className="w-4 h-4 shrink-0" />
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF0F0] dark:bg-[#141414]">
        <p className="text-neutral-500 dark:text-white/60">Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#FFF0F0] dark:bg-[#141414]">
        <p className="text-neutral-500 dark:text-white/60">Event not found.</p>
        <Link href="/events">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to events
          </Button>
        </Link>
      </div>
    );
  }

  const theme = event.theme_colors ?? DEFAULT_EVENT_THEME;
  const heroBanner = event.banners?.["16:9"] || event.banners?.["1x1"];

  return (
    <div className="min-h-screen bg-[#FFF0F0] dark:bg-[#141414] text-neutral-900 dark:text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <HeroGlow theme={theme} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pt-10 md:pt-16 pb-16 md:pb-24">
          <Link
            href="/events"
            className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white hover:underline mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to events
          </Link>

          <div className="grid md:grid-cols-[1fr_360px] gap-10 items-start">
            <div>
              <h1
                className={`${anton.className} uppercase tracking-tight text-5xl sm:text-6xl md:text-7xl leading-[0.95] text-white mb-6`}
              >
                {event.name}
              </h1>

              <Button
                size="lg"
                disabled
                title="Registration opening soon"
                className="bg-neutral-200 text-black hover:bg-neutral-300 mb-8"
              >
                Registration opening soon
              </Button>

              {event.additional_details && (
                <div className="rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/5 backdrop-blur-sm p-5 max-w-md">
                  <p className="text-sm font-medium text-neutral-700 dark:text-white/70 mb-2">
                    About Event
                  </p>
                  <p className="text-sm text-neutral-900 dark:text-white/90 whitespace-pre-line">
                    {event.additional_details}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {heroBanner && (
                <div className="w-full aspect-square rounded-2xl overflow-hidden border border-black/10 dark:border-white/15">
                  <img
                    src={heroBanner}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/5 backdrop-blur-sm p-5 space-y-3">
                <InfoRow icon={CalendarDays}>
                  {format(parseISO(event.start_datetime), "MMM d, yyyy")}
                  {event.end_datetime &&
                    ` - ${format(parseISO(event.end_datetime), "MMM d, yyyy")}`}
                </InfoRow>
                <InfoRow icon={Clock}>
                  {format(parseISO(event.start_datetime), "h:mm a")}
                </InfoRow>
                {event.venue && (
                  <InfoRow icon={Globe}>
                    {[event.venue, event.city, event.country].filter(Boolean).join(", ")}
                  </InfoRow>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Passes — visual-only placeholder, no ticketing backend yet */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-14">
        <h2
          className={`${anton.className} uppercase text-3xl md:text-4xl mb-6 flex items-center gap-3`}
        >
          <Ticket className="w-7 h-7" />
          Passes
        </h2>
        <div className="max-w-xl space-y-3">
          {PLACEHOLDER_PASSES.map((pass) => (
            <div
              key={pass.tier}
              className="flex items-center justify-between rounded-lg border border-neutral-300 dark:border-white/15 bg-white/60 dark:bg-white/5 px-5 py-4"
            >
              <span className="font-semibold">{pass.tier}</span>
              <div className="flex items-center gap-4">
                <span className="text-neutral-600 dark:text-white/70">
                  {pass.price}
                </span>
                <ArrowRight className="w-4 h-4 text-neutral-400 dark:text-white/50" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About the organizer */}
      {event.clubs && (
        <section className="max-w-6xl mx-auto px-4 md:px-6 py-14">
          <h2 className={`${anton.className} uppercase text-3xl md:text-4xl mb-6`}>
            About the Organizer
          </h2>
          <div className="rounded-2xl border border-neutral-300 dark:border-white/15 bg-white/60 dark:bg-white/5 p-8 flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="w-24 h-24 shrink-0">
              <AvatarImage src={event.clubs.avatar_url ?? undefined} />
              <AvatarFallback className="text-2xl">
                {event.clubs.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className={`${anton.className} uppercase text-2xl mb-2`}>
                {event.clubs.name}
              </p>
              <p className="text-sm text-neutral-600 dark:text-white/70">
                {event.clubs.about}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Past events */}
      {pastEvents.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 md:px-6 py-14">
          <h2 className={`${anton.className} uppercase text-3xl md:text-4xl mb-6`}>
            Past Events
          </h2>
          <Carousel opts={{ align: "start" }}>
            <CarouselContent>
              {pastEvents.map((pe) => (
                <CarouselItem key={pe.id} className="basis-1/2 md:basis-1/3">
                  <Link href={`/events/${pe.id}`}>
                    <div className="aspect-square rounded-xl overflow-hidden border border-neutral-300 dark:border-white/15 bg-neutral-200 dark:bg-neutral-800">
                      {pe.banners?.["1x1"] && (
                        <img
                          src={pe.banners["1x1"]}
                          alt={pe.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <p className="mt-2 text-sm font-medium truncate">{pe.name}</p>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </section>
      )}
    </div>
  );
}
