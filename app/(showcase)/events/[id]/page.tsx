"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Share2,
  Tag,
  Ticket,
} from "lucide-react";
import { supabase } from "@/lib/supabase/browserClient";
import { HeroBanner } from "@/components/discover/HeroBanner";
import { EventCard } from "@/components/discover/EventCard";
import {
  clubLogo,
  eventBlurb,
  eventCategory,
  eventCover,
  formatEventDate,
  type DiscoverEvent,
} from "@/components/discover/types";

interface EventDetail {
  id: string;
  name: string;
  description: string | null;
  start_datetime: string;
  end_datetime: string | null;
  event_type: string | null;
  theme: string | null;
  status: string | null;
  venue: string | null;
  city: string | null;
  country: string | null;
  additional_details: string | null;
  banners: Record<string, string> | null;
  club_id: string | null;
  clubs: {
    name: string;
    avatar_url: string | null;
    about: string | null;
  } | null;
}

const PLACEHOLDER_PASSES = [
  { tier: "Platinum", price: "₹799" },
  { tier: "Gold", price: "₹499" },
  { tier: "Silver", price: "₹299" },
];

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/10 text-white/80">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-faint">{label}</p>
        <p className="mt-0.5 text-ui font-medium leading-snug">{value}</p>
      </div>
    </div>
  );
}

export default function EventDetailPage() {
  const eventId = useParams().id as string;
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [related, setRelated] = useState<DiscoverEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    const load = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
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
      setEvent(data as EventDetail);

      if (data?.club_id) {
        const { data: more } = await supabase
          .from("events")
          .select(
            "id,name,description,start_datetime,event_type,theme,venue,city,banners"
          )
          .eq("club_id", data.club_id)
          .neq("id", eventId)
          .order("start_datetime", { ascending: false })
          .limit(4);
        setRelated(
          ((more as Omit<DiscoverEvent, "club">[]) || []).map((e) => ({
            ...e,
            club: data.clubs ? { name: data.clubs.name } : null,
          }))
        );
      }
      setIsLoading(false);
    };
    load();
  }, [eventId]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
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
      <p className="py-24 text-center text-ui text-zinc-400">
        Loading event…
      </p>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center gap-4 py-24">
        <p className="text-2xl font-semibold">Event not found.</p>
        <Link href="/events" className="dz-btn dz-btn--primary">
          <ArrowLeft className="size-3.5" aria-hidden />
          Back to events
        </Link>
      </div>
    );
  }

  const asDiscover: DiscoverEvent = {
    ...event,
    club: event.clubs ? { name: event.clubs.name } : null,
  };
  const location = [event.venue, event.city, event.country]
    .filter(Boolean)
    .join(", ");
  const start = parseISO(event.start_datetime);
  const end = event.end_datetime ? parseISO(event.end_datetime) : null;
  const about =
    eventBlurb(event) ?? eventBlurb({ description: event.additional_details });
  const organizerLogo =
    event.clubs?.avatar_url ||
    (event.clubs ? clubLogo(event.clubs.name) : undefined);

  return (
    <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-6 grid-cols-1">
      {/* Left column: facts + passes */}
      <aside className="flex flex-col gap-6 max-lg:order-2">
        <section className="dz-panel p-5">
          <Link
            href="/events"
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="size-3" aria-hidden />
            All events
          </Link>
          <h2 className="mt-4 text-lg font-semibold">Event details</h2>
          <div className="mt-4 flex flex-col gap-3.5">
            <DetailRow
              icon={<CalendarDays className="size-3.5" aria-hidden />}
              label="Date"
              value={format(start, "EEE, MMM d, yyyy")}
            />
            <DetailRow
              icon={<Clock className="size-3.5" aria-hidden />}
              label="Time"
              value={`${format(start, "h:mm a")}${end ? ` – ${format(end, "h:mm a")}` : ""}`}
            />
            <DetailRow
              icon={<MapPin className="size-3.5" aria-hidden />}
              label="Venue"
              value={location || "TBA"}
            />
            <DetailRow
              icon={<Tag className="size-3.5" aria-hidden />}
              label="Type"
              value={`${eventCategory(asDiscover)}${event.event_type ? ` · ${event.event_type}` : ""}`}
            />
          </div>
        </section>

        <section id="passes" className="dz-panel p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Ticket className="size-3.5" aria-hidden />
            Passes
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {PLACEHOLDER_PASSES.map((p) => (
              <li
                key={p.tier}
                className="flex items-center justify-between rounded-xl bg-white/[0.06] px-3 py-2 text-xs"
              >
                <span className="text-white/75">{p.tier}</span>
                <span className="font-semibold">{p.price}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled
            title="Registration opening soon"
            className="dz-btn dz-btn--ghost mt-4 w-full"
          >
            Registration opening soon
          </button>
        </section>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-col gap-6 max-lg:order-1">
        <HeroBanner
          titleAs="h1"
          image={eventCover(asDiscover, 0)}
          eyebrow={format(start, "EEEE, MMM d, yyyy")}
          tags={[
            eventCategory(asDiscover),
            event.status
              ? event.status[0].toUpperCase() +
                event.status.slice(1).replace(/_/g, " ")
              : "",
          ].filter(Boolean)}
          title={event.name}
          description={about}
          primary={{ label: "Register", href: "#passes" }}
          secondary={{
            label: shareCopied ? "Link copied!" : "Share",
            onClick: handleShare,
            icon: <Share2 className="size-3.5" strokeWidth={1.8} aria-hidden />,
          }}
        />

        {(about || event.clubs) && (
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_260px]">
            <section className="dz-panel p-5">
              <h2 className="text-lg font-semibold">About this event</h2>
              <p className="mt-2.5 whitespace-pre-line text-ui leading-[1.6] text-zinc-300">
                {about ||
                  "Bring your questions, meet your next collaborator, and leave with a practical next step."}
              </p>
            </section>
            {event.clubs && (
              <section className="dz-panel flex flex-col p-5">
                <h2 className="text-lg font-semibold">Organized by</h2>
                <div className="mt-3 flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/15 text-ui font-semibold">
                    {organizerLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={organizerLogo}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      event.clubs.name[0]
                    )}
                  </span>
                  <p className="min-w-0 text-ui font-semibold leading-snug">
                    {event.clubs.name}
                  </p>
                </div>
                {event.clubs.about && (
                  <p className="mt-2.5 line-clamp-4 text-xs leading-[1.55] text-zinc-400">
                    {event.clubs.about}
                  </p>
                )}
              </section>
            )}
          </div>
        )}

        {related.length > 0 && (
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                More from {event.clubs?.name ?? "this club"}
              </h2>
              <Link
                href="/events"
                className="text-ui text-zinc-400 transition-colors hover:text-white"
              >
                See all
              </Link>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4">
              {related.map((e, i) => (
                <EventCard
                  key={e.id}
                  href={`/events/${e.id}`}
                  title={e.name}
                  meta={formatEventDate(e.start_datetime)}
                  category={eventCategory(e)}
                  image={eventCover(e, i + 1)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
