"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { CalendarDays, LogIn, MapPin, Ticket, Users } from "lucide-react";
import { PosterReveal } from "@/components/discover/PosterReveal";
import { EmptyState, ErrorState } from "@/components/discover/LoadStates";
import { friendlyError } from "@/components/discover/useEvents";
import {
  useMyBookings,
  type Booking,
} from "@/components/discover/useMyBookings";
import {
  eventCover,
  eventLocation,
  formatEventDate,
  formatEventTime,
  isOnlineEvent,
  isUpcomingEvent,
} from "@/components/discover/types";

const TABS = ["Upcoming", "Past"] as const;
type Tab = (typeof TABS)[number];

// registration_status values written by the club-side participants page.
const STATUS: Record<string, { label: string; className: string }> = {
  approved: {
    label: "Confirmed",
    className: "bg-[var(--success-soft)] text-[var(--success)]",
  },
  rejected: {
    label: "Not approved",
    className: "bg-[var(--destructive-soft)] text-[var(--danger)]",
  },
  waitlist: {
    label: "Waitlisted",
    className: "bg-[var(--warning-soft)] text-[var(--warning)]",
  },
};
const PENDING = {
  label: "Pending approval",
  className: "bg-[var(--info-soft)] text-[var(--info)]",
};

const time = (b: Booking) =>
  b.event.start_datetime ? new Date(b.event.start_datetime).getTime() : 0;

function BookingCard({ booking, index }: { booking: Booking; index: number }) {
  const { event } = booking;
  const status =
    STATUS[booking.registration_status?.toLowerCase() ?? ""] ?? PENDING;
  const when = formatEventTime(event.start_datetime);
  const where = isOnlineEvent(event)
    ? "Online"
    : eventLocation(event) || "Venue TBA";

  return (
    <Link
      href={`/events/${event.id}`}
      className="dz-card group flex min-w-0 flex-col overflow-hidden sm:flex-row"
    >
      <div className="dz-media aspect-[16/9] shrink-0 sm:aspect-auto sm:w-56">
        <PosterReveal image={eventCover(event, index)} aspectRatio="16 / 9" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium ${status.className}`}
          >
            {status.label}
          </span>
          {booking.pass_type && (
            <span className="dz-chip capitalize">{booking.pass_type} pass</span>
          )}
        </div>
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug">
          {event.name}
        </h3>
        <dl className="grid gap-1.5 text-xs text-zinc-300 sm:grid-cols-2">
          <div className="flex min-w-0 items-center gap-2">
            <dt className="sr-only">Date</dt>
            <CalendarDays
              className="size-3.5 shrink-0 text-faint"
              aria-hidden
            />
            <dd className="truncate">
              {formatEventDate(event.start_datetime)}
              {when && ` · ${when}`}
            </dd>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <dt className="sr-only">Venue</dt>
            <MapPin className="size-3.5 shrink-0 text-faint" aria-hidden />
            <dd className="truncate">{where}</dd>
          </div>
          {event.club && (
            <div className="flex min-w-0 items-center gap-2">
              <dt className="sr-only">Organizer</dt>
              <Users className="size-3.5 shrink-0 text-faint" aria-hidden />
              <dd className="truncate">{event.club.name}</dd>
            </div>
          )}
          {booking.registration_date && (
            <div className="flex min-w-0 items-center gap-2">
              <dt className="sr-only">Registered</dt>
              <Ticket className="size-3.5 shrink-0 text-faint" aria-hidden />
              <dd className="truncate">
                Registered {formatEventDate(booking.registration_date)}
              </dd>
            </div>
          )}
        </dl>
        <span className="mt-auto text-ui text-zinc-400 transition-colors group-hover:text-white">
          View event →
        </span>
      </div>
    </Link>
  );
}

function BookingSkeleton() {
  return (
    <div
      aria-hidden
      className="dz-card flex flex-col overflow-hidden sm:h-[150px] sm:flex-row"
    >
      <div className="aspect-[16/9] animate-pulse bg-[var(--dz-surface-2)] sm:aspect-auto sm:w-56" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="h-5 w-28 animate-pulse rounded-full bg-[var(--dz-surface-3)]" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-[var(--dz-surface-3)]" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-[var(--dz-surface-2)]" />
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const { data: session, status: authStatus } = useSession();
  const email = session?.user?.email ?? null;
  const { bookings, status, error, retry } = useMyBookings(email);
  const [tab, setTab] = useState<Tab>("Upcoming");
  const [now] = useState(() => Date.now());

  const { upcoming, past } = useMemo(() => {
    const up = bookings
      .filter((b) => isUpcomingEvent(b.event, now))
      .sort((a, b) => time(a) - time(b));
    const done = bookings
      .filter((b) => !isUpcomingEvent(b.event, now))
      .sort((a, b) => time(b) - time(a));
    return { upcoming: up, past: done };
  }, [bookings, now]);
  const visible = tab === "Upcoming" ? upcoming : past;

  const header = (
    <div>
      <p className="text-ui font-medium text-[var(--dz-accent)]">Your events</p>
      <h1 className="mt-1 text-2xl font-semibold leading-tight tracking-[-0.02em] sm:text-[28px]">
        My Bookings
      </h1>
      <p className="mt-1.5 text-sm text-zinc-400">
        Events you registered for, with their approval status.
      </p>
    </div>
  );

  if (authStatus === "unauthenticated") {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <EmptyState
          icon={<LogIn className="size-5" aria-hidden />}
          title="Sign in to see your bookings"
          message="Your registrations are linked to your MLRIT account."
          action={
            <Link
              href="/register?callbackUrl=/bookings"
              className="dz-btn dz-btn--accent"
            >
              Sign in
            </Link>
          }
        />
      </div>
    );
  }

  const loading = authStatus === "loading" || status === "loading";

  return (
    <div className="flex flex-col gap-6">
      {header}

      {!loading && status === "ready" && bookings.length > 0 && (
        <div
          role="group"
          aria-label="Show"
          className="flex w-fit rounded-lg border border-[var(--dz-border)] bg-[var(--dz-surface-1)] p-0.5"
        >
          {TABS.map((t) => {
            const n = t === "Upcoming" ? upcoming.length : past.length;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                aria-pressed={tab === t}
                className={`h-8 rounded-md px-3 text-ui transition-colors ${
                  tab === t
                    ? "bg-white/10 font-medium text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {t} <span className="text-faint">{n}</span>
              </button>
            );
          })}
        </div>
      )}

      {loading && (
        <div role="status" aria-label="Loading bookings" className="grid gap-4">
          <BookingSkeleton />
          <BookingSkeleton />
        </div>
      )}

      {!loading && status === "error" && (
        <ErrorState
          title="Bookings didn't load"
          message={friendlyError(error)}
          onRetry={retry}
        />
      )}

      {!loading && status === "ready" && bookings.length === 0 && (
        <EmptyState
          icon={<Ticket className="size-5" aria-hidden />}
          title="No bookings yet"
          message="Register for an event and it will show up here."
          action={
            <Link href="/events" className="dz-btn dz-btn--accent">
              Explore events
            </Link>
          }
        />
      )}

      {!loading && status === "ready" && bookings.length > 0 && (
        <>
          {visible.length === 0 ? (
            <p className="dz-panel p-5 text-ui text-zinc-400">
              {tab === "Upcoming"
                ? "No upcoming bookings. Your past events are in the Past tab."
                : "No past bookings yet."}
            </p>
          ) : (
            <div className="grid gap-4">
              {visible.map((b, i) => (
                <BookingCard key={b.id} booking={b} index={i} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
