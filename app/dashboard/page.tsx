"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { isSameDay } from "date-fns";
import { ArrowRight, CalendarX2, MapPin } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { EmptyState, ErrorState } from "@/components/discover/LoadStates";
import { friendlyError } from "@/components/discover/useEvents";
import {
  useMyBookings,
  type Booking,
} from "@/components/discover/useMyBookings";
import {
  eventLocation,
  formatEventDate,
  formatEventTime,
  isUpcomingEvent,
} from "@/components/discover/types";

function StatTile({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="dz-panel flex-1 px-5 py-4">
      <p className="text-ui text-zinc-400">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums">
        {value === null ? (
          <span className="inline-block h-8 w-10 animate-pulse rounded bg-[var(--dz-surface-3)] align-middle" />
        ) : (
          value
        )}
      </p>
    </div>
  );
}

function EventRow({ booking }: { booking: Booking }) {
  const e = booking.event;
  const d = e.start_datetime ? new Date(e.start_datetime) : null;
  const location = eventLocation(e);
  const time = formatEventTime(e.start_datetime);
  return (
    <Link
      href={`/events/${e.id}`}
      className="dz-card flex items-center gap-4 p-3.5"
    >
      <span className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-[var(--dz-surface-2)] py-1.5 leading-none ring-1 ring-[var(--dz-border)]">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--dz-accent)]">
          {d ? d.toLocaleDateString("en-IN", { month: "short" }) : "TBA"}
        </span>
        <span className="mt-1 text-lg font-semibold">
          {d?.getDate() ?? "–"}
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{e.name}</span>
        <span className="mt-0.5 flex items-center gap-1 truncate text-xs text-zinc-400">
          {time && <span>{time}</span>}
          {time && location && <span aria-hidden>·</span>}
          {location && (
            <>
              <MapPin className="size-3 shrink-0" aria-hidden />
              <span className="truncate">{location}</span>
            </>
          )}
        </span>
      </span>
      <ArrowRight className="size-4 shrink-0 text-faint" aria-hidden />
    </Link>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { bookings, status, error, retry } = useMyBookings(
    session?.user?.email ?? null
  );
  const [now] = useState(() => Date.now());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    () => new Date()
  );

  // Rejected registrations aren't events the student is going to.
  const going = useMemo(
    () =>
      bookings.filter(
        (b) => b.registration_status?.toLowerCase() !== "rejected"
      ),
    [bookings]
  );
  const upcoming = useMemo(
    () =>
      going
        .filter((b) => isUpcomingEvent(b.event, now))
        .sort(
          (a, b) =>
            new Date(a.event.start_datetime!).getTime() -
            new Date(b.event.start_datetime!).getTime()
        ),
    [going, now]
  );
  const pastCount = going.length - upcoming.length;
  const eventDays = useMemo(
    () =>
      going
        .filter((b) => b.event.start_datetime)
        .map((b) => new Date(b.event.start_datetime!)),
    [going]
  );
  const onSelectedDay = selectedDate
    ? going.filter(
        (b) =>
          b.event.start_datetime &&
          isSameDay(new Date(b.event.start_datetime), selectedDate)
      )
    : [];

  const ready = status === "ready";
  const firstName =
    session?.user?.name?.split(" ")[0] || session?.user?.email || "there";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-ui font-medium text-[var(--dz-accent)]">Dashboard</p>
        <h1 className="mt-1 text-2xl font-semibold leading-tight tracking-[-0.02em] sm:text-[28px]">
          Hey {firstName}
        </h1>
        <p className="mt-1.5 text-sm text-zinc-400">
          Here&apos;s what&apos;s happening with your events.
        </p>
      </div>

      {status === "error" ? (
        <ErrorState
          title="Your events didn't load"
          message={friendlyError(error)}
          onRetry={retry}
        />
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row">
          <StatTile label="Upcoming" value={ready ? upcoming.length : null} />
          <StatTile label="Registered" value={ready ? going.length : null} />
          <StatTile label="Attended / past" value={ready ? pastCount : null} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-labelledby="upcoming-heading" className="min-w-0">
          <div className="flex items-center justify-between">
            <h2 id="upcoming-heading" className="text-lg font-semibold">
              Upcoming events
            </h2>
            <Link
              href="/bookings"
              className="-my-2 py-2 text-ui text-zinc-400 transition-colors hover:text-white"
            >
              All bookings
            </Link>
          </div>
          <div className="mt-3 grid gap-3">
            {status === "loading" &&
              Array.from({ length: 3 }, (_, i) => (
                <div
                  key={i}
                  aria-hidden
                  className="dz-panel h-[74px] animate-pulse"
                />
              ))}
            {ready && upcoming.length === 0 && (
              <EmptyState
                icon={<CalendarX2 className="size-5" aria-hidden />}
                title="Nothing coming up"
                message="Register for an event and it will show up here."
                action={
                  <Link href="/events" className="dz-btn dz-btn--accent">
                    Explore events
                  </Link>
                }
              />
            )}
            {ready && upcoming.map((b) => <EventRow key={b.id} booking={b} />)}
          </div>
        </section>

        <section
          aria-label="Your event calendar"
          className="dz-panel self-start p-3"
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{ hasEvent: eventDays }}
            modifiersClassNames={{
              hasEvent:
                "[&>button]:font-semibold [&>button]:text-[var(--dz-accent)]",
            }}
            className="mx-auto"
          />
          <div className="border-t border-[var(--dz-border)] px-2 pb-1 pt-3">
            <p className="text-xs text-faint">
              {selectedDate
                ? formatEventDate(selectedDate.toISOString())
                : "Pick a day"}
            </p>
            {ready && onSelectedDay.length === 0 && (
              <p className="mt-1 text-ui text-zinc-400">
                None of your events on this day.
              </p>
            )}
            <ul className="mt-1 grid gap-1">
              {onSelectedDay.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/events/${b.event.id}`}
                    className="block truncate rounded-md py-1 text-ui hover:text-[var(--dz-accent)]"
                  >
                    {b.event.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
