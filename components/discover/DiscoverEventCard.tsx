import Link from "next/link";
import { CalendarDays, Globe, MapPin, Users } from "lucide-react";
import { PosterReveal } from "@/components/discover/PosterReveal";
import {
  eventBlurb,
  eventCategory,
  eventCover,
  eventLocation,
  formatEventDate,
  formatEventTime,
  isOnlineEvent,
  isUpcomingEvent,
  type DiscoverEvent,
} from "@/components/discover/types";

/**
 * Full event card for grids: poster, category and status chips, title,
 * blurb, when / where / who, and the action into the event page (where the
 * existing registration flow lives). The whole card is one link.
 */
export function DiscoverEventCard({
  event,
  index,
  now,
  className = "",
}: {
  event: DiscoverEvent;
  index: number;
  now: number;
  className?: string;
}) {
  const upcoming = isUpcomingEvent(event, now);
  const online = isOnlineEvent(event);
  const time = formatEventTime(event.start_datetime);
  const where = online ? "Online" : eventLocation(event) || "Venue TBA";
  const blurb = eventBlurb(event);

  return (
    <Link
      href={`/events/${event.id}`}
      className={`group dz-card flex min-w-0 flex-col overflow-hidden ${className}`}
    >
      <div className="dz-media aspect-[16/9]">
        <PosterReveal image={eventCover(event, index)} aspectRatio="16 / 9" />
        <span className="dz-chip dz-dark-chip absolute left-2.5 top-2.5 z-10 max-w-[calc(100%-110px)] truncate">
          {eventCategory(event)}
        </span>
        <span
          className={`dz-chip dz-dark-chip absolute right-2.5 top-2.5 z-10 ${
            upcoming ? "!text-[var(--success)]" : "!text-zinc-300"
          }`}
        >
          <span
            aria-hidden
            className={`size-1.5 rounded-full ${
              upcoming ? "bg-[var(--success)]" : "bg-zinc-500"
            }`}
          />
          {upcoming ? "Upcoming" : "Ended"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug">
          {event.name}
        </h3>
        {blurb && (
          <p className="mt-1.5 line-clamp-2 text-ui leading-snug text-zinc-400">
            {blurb}
          </p>
        )}

        <dl className="mt-3 flex flex-col gap-1.5 text-xs text-zinc-300">
          <div className="flex min-w-0 items-center gap-2">
            <dt className="sr-only">Date</dt>
            <CalendarDays
              className="size-3.5 shrink-0 text-faint"
              aria-hidden
            />
            <dd className="truncate">
              {formatEventDate(event.start_datetime)}
              {time && ` · ${time}`}
            </dd>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <dt className="sr-only">Venue</dt>
            {online ? (
              <Globe className="size-3.5 shrink-0 text-faint" aria-hidden />
            ) : (
              <MapPin className="size-3.5 shrink-0 text-faint" aria-hidden />
            )}
            <dd className="truncate">{where}</dd>
          </div>
          {event.club && (
            <div className="flex min-w-0 items-center gap-2">
              <dt className="sr-only">Organizer</dt>
              <Users className="size-3.5 shrink-0 text-faint" aria-hidden />
              <dd className="truncate">{event.club.name}</dd>
            </div>
          )}
        </dl>

        <span
          className={`mt-4 flex h-9 items-center justify-center rounded-lg text-ui font-medium transition-colors ${
            upcoming
              ? "bg-[var(--dz-accent)] text-[#1a0d06] group-hover:bg-[#ff8f6b]"
              : "bg-white/[0.06] text-zinc-300 group-hover:bg-white/[0.1]"
          }`}
        >
          {upcoming ? "View & register" : "View details"}
        </span>
      </div>
    </Link>
  );
}
