"use client";

import "./campus-calendar.css";
import type React from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import {
  addDays,
  addMonths,
  addWeeks,
  format,
  isSameDay,
  isSameMonth,
  isToday,
} from "date-fns";
import {
  AlertTriangle,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  MapPin,
  Plus,
  RotateCw,
  Search,
  Tag,
  Users,
  X,
} from "lucide-react";
import { friendlyError, useEvents } from "@/components/discover/useEvents";
import {
  eventBlurb,
  eventCover,
  eventLocation,
  formatEventTime,
  isOnlineEvent,
  type DiscoverEvent,
} from "@/components/discover/types";
import {
  CATEGORIES,
  CATEGORY_LABEL,
  WEEKDAYS,
  calCategory,
  eventsOn,
  googleCalendarUrl,
  monthArt,
  monthGrid,
  monthTone,
  rangeLabel,
  weekDays,
  type CalCategory,
  type CalView,
} from "./calendar-utils";

const VIEWS: { key: CalView; label: string }[] = [
  { key: "month", label: "Month" },
  { key: "week", label: "Week" },
  { key: "day", label: "Day" },
];

const time = (e: DiscoverEvent) =>
  e.start_datetime ? new Date(e.start_datetime).getTime() : 0;
const venueOf = (e: DiscoverEvent) =>
  isOnlineEvent(e) ? "Online" : eventLocation(e) || "Venue TBA";

// ── Small pieces ────────────────────────────────────────────────────────────

function EventChip({
  event,
  onOpen,
  withTime = false,
  className = "",
}: {
  event: DiscoverEvent;
  onOpen: (e: DiscoverEvent) => void;
  withTime?: boolean;
  className?: string;
}) {
  const t = formatEventTime(event.start_datetime);
  return (
    <button
      type="button"
      onClick={() => onOpen(event)}
      className={`cc-chip cc-cat-${calCategory(event)} block w-full truncate rounded-md px-1.5 py-0.5 text-left text-[11px] font-semibold leading-tight ${className}`}
      title={event.name}
    >
      {withTime && t && <span className="mr-1 opacity-75">{t}</span>}
      {event.name}
    </button>
  );
}

/** Abstract shapes on the board edges; purely decorative. */
function BoardShapes() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <svg
        viewBox="0 0 40 40"
        className="absolute right-6 top-5 size-14 text-[var(--cc-yellow)] sm:size-20"
      >
        <path
          fill="currentColor"
          d="M20 0l4.7 13.5L39 15l-11.3 9 4 15L20 30.6 8.3 39l4-15L1 15l14.3-1.5z"
        />
      </svg>
      <svg
        viewBox="0 0 120 40"
        className="absolute right-28 top-3 hidden h-8 w-28 text-[var(--cc-pink)] sm:block"
      >
        <path
          d="M2 20c10-16 20-16 30 0s20 16 30 0 20-16 30 0 18 14 26 4"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute -bottom-12 -right-12 size-32 rounded-full bg-[var(--cc-lime)]" />
    </div>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border-2 border-dashed border-[rgba(22,32,122,0.2)] px-4 py-6 text-center text-sm font-medium text-[rgba(22,32,122,0.75)]">
      {children}
    </p>
  );
}

function AgendaItem({
  event,
  index,
  onOpen,
}: {
  event: DiscoverEvent;
  index: number;
  onOpen: (e: DiscoverEvent) => void;
}) {
  const cat = calCategory(event);
  return (
    <button
      type="button"
      onClick={() => onOpen(event)}
      className="group flex w-full items-stretch gap-3 rounded-2xl p-2 text-left transition-colors hover:bg-[rgba(47,75,211,0.07)]"
    >
      <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-[rgba(22,32,122,0.08)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={eventCover(event, index)}
          alt=""
          loading="lazy"
          className="size-full object-cover"
        />
      </span>
      <span className="min-w-0 flex-1 py-0.5">
        <span
          className={`cc-chip cc-cat-${cat} inline-block rounded-full px-2 py-px text-[10px] font-bold uppercase tracking-wide`}
        >
          {CATEGORY_LABEL[cat]}
        </span>
        <span className="mt-1 block truncate text-sm font-bold">
          {event.name}
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-[rgba(22,32,122,0.7)]">
          <Clock className="size-3 shrink-0" aria-hidden />
          {formatEventTime(event.start_datetime) ?? "Time TBA"}
          <span aria-hidden>·</span>
          <span className="truncate">{venueOf(event)}</span>
        </span>
      </span>
    </button>
  );
}

// ── Views ───────────────────────────────────────────────────────────────────

function MonthView({
  date,
  events,
  ready,
  selected,
  onSelect,
  onOpen,
}: {
  date: Date;
  events: DiscoverEvent[];
  ready: boolean;
  selected: Date;
  onSelect: (d: Date) => void;
  onOpen: (e: DiscoverEvent) => void;
}) {
  const days = monthGrid(date);
  const tone = monthTone(date);
  const monthEvents = events
    .filter(
      (e) => e.start_datetime && isSameMonth(new Date(e.start_datetime), date)
    )
    .sort((a, b) => time(a) - time(b));
  const inMonth = monthEvents.length;
  const highlights = monthEvents.slice(0, 4);

  return (
    <div
      className={`cc-tone-${tone} grid overflow-hidden rounded-[22px] shadow-[0_18px_40px_-18px_rgba(8,14,60,0.7)] lg:grid-cols-[minmax(0,5fr)_minmax(0,9fr)]`}
    >
      {/* Artwork side — the illustration carries the month name. */}
      <div className="flex flex-col bg-[var(--cc-paper)] text-[var(--cc-ink)]">
        {/* Full artwork, never cropped (it is 352×300). */}
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={monthArt(date)}
            alt={`${format(date, "MMMM")} illustration`}
            width={352}
            height={300}
            className="block h-auto w-full"
          />
          <span className="cc-display absolute bottom-3 right-3 rounded-full bg-[var(--cc-paper)] px-3 py-1 text-lg shadow">
            {format(date, "yyyy")}
          </span>
        </div>
        {/* Month highlights fill the rest of the column on desktop. */}
        <div className="hidden flex-1 flex-col p-4 lg:flex">
          <p className="text-xs font-bold uppercase tracking-wider text-[rgba(22,32,122,0.6)]">
            This month
          </p>
          {ready && highlights.length === 0 && (
            <p className="mt-2 text-sm text-[rgba(22,32,122,0.7)]">
              No events this month yet.
            </p>
          )}
          <ul className="mt-2 grid grid-cols-[minmax(0,1fr)] gap-2">
            {highlights.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => onOpen(e)}
                  className="flex w-full items-center gap-2.5 rounded-xl p-1.5 text-left transition-colors hover:bg-[rgba(47,75,211,0.07)]"
                >
                  <span className="cc-display w-8 shrink-0 text-center text-2xl">
                    {format(new Date(e.start_datetime!), "d")}
                  </span>
                  <span
                    aria-hidden
                    className={`cc-dot cc-cat-${calCategory(e)} size-2 shrink-0 rounded-full`}
                  />
                  <span className="min-w-0 truncate text-sm font-semibold">
                    {e.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {inMonth > highlights.length && (
            <p className="mt-2 px-1.5 text-xs font-semibold text-[rgba(22,32,122,0.6)]">
              and {inMonth - highlights.length} more this month
            </p>
          )}
        </div>
      </div>

      {/* Date panel */}
      <div className="cc-panel flex min-w-0 flex-col p-4 sm:p-6">
        <div className="flex items-end justify-between gap-3">
          <h2 className="cc-display text-5xl sm:text-6xl">
            {format(date, "MMMM")}
          </h2>
          <p className="pb-1 text-xs font-bold uppercase tracking-wider opacity-75">
            {inMonth} event{inMonth === 1 ? "" : "s"}
          </p>
        </div>

        <div
          role="grid"
          aria-label={format(date, "MMMM yyyy")}
          className="mt-5 grid grid-cols-7 gap-1"
        >
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              role="columnheader"
              className="pb-1 text-center text-[11px] font-bold uppercase tracking-wider opacity-70"
            >
              {d}
            </div>
          ))}
          {days.map((day) => {
            const list = eventsOn(events, day).sort(
              (a, b) => time(a) - time(b)
            );
            const isSel = isSameDay(day, selected);
            return (
              <div
                key={day.toISOString()}
                role="gridcell"
                aria-selected={isSel}
                data-outside={!isSameMonth(day, date)}
                data-selected={isSel}
                className="cc-day flex min-h-[52px] min-w-0 flex-col gap-1 p-1 sm:min-h-[84px]"
              >
                <button
                  type="button"
                  onClick={() => onSelect(day)}
                  aria-label={`${format(day, "EEEE d MMMM")}${
                    list.length
                      ? `, ${list.length} event${list.length === 1 ? "" : "s"}`
                      : ""
                  }`}
                  className={`grid size-7 place-items-center self-center rounded-full text-sm font-bold sm:self-start ${
                    isToday(day) ? "cc-today-ring" : ""
                  }`}
                >
                  {format(day, "d")}
                </button>
                {/* Phones: dots. Larger screens: up to two labels. */}
                {list.length > 0 && (
                  <div className="flex justify-center gap-0.5 sm:hidden">
                    {list.slice(0, 3).map((e) => (
                      <span
                        key={e.id}
                        aria-hidden
                        className={`cc-dot cc-cat-${calCategory(e)} size-1.5 rounded-full`}
                      />
                    ))}
                  </div>
                )}
                <div className="hidden flex-col gap-0.5 sm:flex">
                  {list.slice(0, 2).map((e) => (
                    <EventChip key={e.id} event={e} onOpen={onOpen} />
                  ))}
                  {list.length > 2 && (
                    <button
                      type="button"
                      onClick={() => onSelect(day)}
                      className="text-left text-[11px] font-bold opacity-80 hover:underline"
                    >
                      +{list.length - 2} more
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WeekView({
  date,
  events,
  onSelectDay,
  onOpen,
}: {
  date: Date;
  events: DiscoverEvent[];
  onSelectDay: (d: Date) => void;
  onOpen: (e: DiscoverEvent) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-7">
      {weekDays(date).map((day) => {
        const list = eventsOn(events, day).sort((a, b) => time(a) - time(b));
        return (
          <section
            key={day.toISOString()}
            aria-label={format(day, "EEEE d MMMM")}
            className="cc-paper flex min-w-0 flex-col p-3 md:min-h-[260px]"
          >
            <button
              type="button"
              onClick={() => onSelectDay(day)}
              className="flex items-baseline gap-2 rounded-lg text-left md:flex-col md:gap-0"
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-[rgba(22,32,122,0.6)]">
                {format(day, "EEE")}
              </span>
              <span
                className={`cc-display text-3xl ${
                  isToday(day) ? "rounded-lg bg-[var(--cc-lime)] px-1.5" : ""
                }`}
              >
                {format(day, "d")}
              </span>
            </button>
            <div className="mt-2 flex flex-col gap-1.5">
              {list.length === 0 ? (
                <p className="text-xs text-[rgba(22,32,122,0.45)]">No events</p>
              ) : (
                list.map((e) => (
                  <EventChip
                    key={e.id}
                    event={e}
                    onOpen={onOpen}
                    withTime
                    className="whitespace-normal !py-1 [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical]"
                  />
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function DayView({
  date,
  events,
  onOpen,
}: {
  date: Date;
  events: DiscoverEvent[];
  onOpen: (e: DiscoverEvent) => void;
}) {
  const list = eventsOn(events, date).sort((a, b) => time(a) - time(b));
  const tone = monthTone(date);
  return (
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <div
        className={`cc-tone-${tone} cc-panel flex flex-row items-center gap-4 rounded-[22px] p-5 lg:flex-col lg:items-start lg:self-start`}
      >
        <span className="cc-display text-[88px] leading-none">
          {format(date, "d")}
        </span>
        <span>
          <span className="cc-display block text-3xl">
            {format(date, "EEEE")}
          </span>
          <span className="text-sm font-semibold opacity-80">
            {format(date, "MMMM yyyy")}
          </span>
        </span>
      </div>
      <div className="cc-paper p-3 sm:p-4">
        {list.length === 0 ? (
          <EmptyNote>Nothing scheduled on this day.</EmptyNote>
        ) : (
          <ul className="grid grid-cols-[minmax(0,1fr)] gap-1">
            {list.map((e, i) => (
              <li key={e.id}>
                <AgendaItem event={e} index={i} onOpen={onOpen} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── Details dialog ──────────────────────────────────────────────────────────

function EventDialog({
  event,
  container,
  onClose,
}: {
  event: DiscoverEvent | null;
  container: HTMLElement | null;
  onClose: () => void;
}) {
  const cat = event ? calCategory(event) : "club";
  const venue = event ? venueOf(event) : "";
  const gcal = event ? googleCalendarUrl(event, venue) : null;
  const blurb = event ? eventBlurb(event) : null;

  return (
    <Dialog.Root open={!!event} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal container={container}>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[rgba(8,12,48,0.7)]" />
        {event && (
          <Dialog.Content className="cc fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-24px)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[24px] bg-[var(--cc-paper)] text-[var(--cc-ink)] shadow-2xl">
            <div className="relative aspect-[16/8] bg-[var(--cc-cobalt)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={eventCover(event, 0)}
                alt=""
                className="size-full object-cover"
              />
              <span
                className={`cc-chip cc-cat-${cat} absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide`}
              >
                {CATEGORY_LABEL[cat]}
              </span>
              <Dialog.Close
                aria-label="Close"
                className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-[var(--cc-paper)] text-[var(--cc-ink)] shadow"
              >
                <X className="size-4" aria-hidden />
              </Dialog.Close>
            </div>
            <div className="p-5 sm:p-6">
              <Dialog.Title className="cc-display text-4xl">
                {event.name}
              </Dialog.Title>
              <dl className="mt-4 grid gap-2.5 text-sm">
                <div className="flex items-center gap-2.5">
                  <dt className="sr-only">Date and time</dt>
                  <Clock className="size-4 shrink-0 opacity-70" aria-hidden />
                  <dd className="font-semibold">
                    {event.start_datetime
                      ? format(
                          new Date(event.start_datetime),
                          "EEEE, d MMMM yyyy"
                        )
                      : "Date TBA"}
                    {formatEventTime(event.start_datetime) &&
                      ` · ${formatEventTime(event.start_datetime)}`}
                  </dd>
                </div>
                <div className="flex items-center gap-2.5">
                  <dt className="sr-only">Venue</dt>
                  <MapPin className="size-4 shrink-0 opacity-70" aria-hidden />
                  <dd>{venue}</dd>
                </div>
                <div className="flex items-center gap-2.5">
                  <dt className="sr-only">Organizer</dt>
                  <Users className="size-4 shrink-0 opacity-70" aria-hidden />
                  <dd>{event.club?.name ?? "Organizer TBA"}</dd>
                </div>
                <div className="flex items-center gap-2.5">
                  <dt className="sr-only">Category</dt>
                  <Tag className="size-4 shrink-0 opacity-70" aria-hidden />
                  <dd>{event.theme?.trim() || CATEGORY_LABEL[cat]}</dd>
                </div>
              </dl>
              <Dialog.Description className="mt-4 text-sm leading-relaxed text-[rgba(22,32,122,0.8)]">
                {blurb ?? "No description yet."}
              </Dialog.Description>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  href={`/events/${event.id}`}
                  className="cc-btn bg-[var(--cc-ink)] text-[var(--cc-paper)] hover:bg-[var(--cc-cobalt)]"
                >
                  View event & register
                </Link>
                {gcal && (
                  <a
                    href={gcal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cc-btn bg-[rgba(22,32,122,0.08)] text-[var(--cc-ink)] hover:bg-[rgba(22,32,122,0.14)]"
                  >
                    <CalendarPlus className="size-4" aria-hidden />
                    Google Calendar
                    <ExternalLink className="size-3 opacity-60" aria-hidden />
                  </a>
                )}
              </div>
            </div>
          </Dialog.Content>
        )}
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ── Page component ──────────────────────────────────────────────────────────

/**
 * Campus Calendar: month / week / day views over approved events, with
 * search, category filters and an event details dialog.
 */
export function CampusCalendar({
  createHref,
  initialDate,
  initialView,
}: {
  /** Shown as "Create Event" only for organizers / admins. */
  createHref?: string | null;
  /** Day to open on (e.g. from ?date=); defaults to today. */
  initialDate?: Date | null;
  initialView?: CalView | null;
}) {
  const { events, status, error, retry } = useEvents({
    approvedOnly: true,
    ascending: true,
  });
  const [view, setView] = useState<CalView>(initialView ?? "month");
  const [selected, setSelected] = useState(() => initialDate ?? new Date());
  const [query, setQuery] = useState("");
  const [hidden, setHidden] = useState<Set<CalCategory>>(new Set());
  const [open, setOpen] = useState<DiscoverEvent | null>(null);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      if (hidden.has(calCategory(e))) return false;
      if (!q) return true;
      return [e.name, e.description, e.club?.name, e.venue, e.theme]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q));
    });
  }, [events, query, hidden]);

  const step = (dir: 1 | -1) =>
    setSelected((d) =>
      view === "month"
        ? addMonths(d, dir)
        : view === "week"
          ? addWeeks(d, dir)
          : addDays(d, dir)
    );

  const toggleCat = (c: CalCategory) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });

  const dayList = eventsOn(filtered, selected).sort(
    (a, b) => time(a) - time(b)
  );
  const periodHasEvents =
    view === "month"
      ? filtered.some(
          (e) =>
            e.start_datetime &&
            isSameMonth(new Date(e.start_datetime), selected)
        )
      : view === "week"
        ? weekDays(selected).some((d) => eventsOn(filtered, d).length > 0)
        : dayList.length > 0;
  const filtering = query.trim() !== "" || hidden.size > 0;

  return (
    <div ref={setRoot} className="cc">
      <div className="cc-board px-4 pb-6 pt-6 sm:px-8 sm:pb-8 sm:pt-8">
        <BoardShapes />

        {/* Header */}
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="cc-display text-5xl sm:text-7xl">
              Campus <span className="text-[var(--cc-lime)]">Calendar</span>
            </h1>
            <p className="mt-2 text-base font-medium text-[rgba(255,253,246,0.85)]">
              Discover what&apos;s happening around campus.
            </p>
          </div>
          {createHref && (
            <Link href={createHref} className="cc-btn cc-btn--lime h-11 px-5">
              <Plus className="size-4" aria-hidden />
              Create Event
            </Link>
          )}
        </div>

        {/* Toolbar */}
        <div className="relative mt-6 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label={`Previous ${view}`}
              className="cc-btn cc-btn--ghost cc-icon-btn"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label={`Next ${view}`}
              className="cc-btn cc-btn--ghost cc-icon-btn"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Date())}
              className="cc-btn cc-btn--paper"
            >
              Today
            </button>
          </div>
          <p
            aria-live="polite"
            className="cc-display mx-1 text-2xl text-[var(--cc-yellow)] sm:text-3xl"
          >
            {rangeLabel(selected, view)}
          </p>

          <div
            role="group"
            aria-label="View"
            className="ml-auto flex rounded-full bg-[rgba(255,255,255,0.12)] p-1"
          >
            {VIEWS.map((v) => (
              <button
                key={v.key}
                type="button"
                aria-pressed={view === v.key}
                onClick={() => setView(v.key)}
                className={`h-8 rounded-full px-4 text-sm font-semibold transition-colors ${
                  view === v.key
                    ? "bg-[var(--cc-paper)] text-[var(--cc-ink)]"
                    : "text-[var(--cc-paper)] hover:bg-white/10"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search + category filters */}
        <div className="relative mt-4 flex flex-wrap items-center gap-2">
          <label className="flex h-10 w-full items-center gap-2 rounded-full bg-[var(--cc-paper)] px-4 text-[var(--cc-ink)] sm:w-64">
            <Search className="size-4 shrink-0 opacity-60" aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events"
              aria-label="Search calendar events"
              className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-[rgba(22,32,122,0.5)]"
            />
          </label>
          <div
            role="group"
            aria-label="Categories"
            className="flex flex-wrap gap-1.5"
          >
            {CATEGORIES.map((c) => {
              const on = !hidden.has(c.key);
              return (
                <button
                  key={c.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleCat(c.key)}
                  className={`flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-bold transition-opacity ${
                    on
                      ? "bg-[rgba(255,255,255,0.14)] text-[var(--cc-paper)]"
                      : "bg-transparent text-[rgba(255,253,246,0.5)] line-through ring-1 ring-[rgba(255,255,255,0.2)]"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`cc-dot cc-cat-${c.key} size-2.5 rounded-full ${on ? "" : "opacity-40"}`}
                  />
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="relative mt-6">
          <div aria-busy={status === "loading"} className="grid gap-5">
            {status === "error" && (
              <div
                role="alert"
                className="cc-paper flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center"
              >
                <AlertTriangle
                  className="size-6 shrink-0 text-[#d1345b]"
                  aria-hidden
                />
                <div className="flex-1">
                  <p className="font-bold">
                    The calendar couldn&apos;t load events
                  </p>
                  <p className="text-sm opacity-75">{friendlyError(error)}</p>
                </div>
                <button
                  type="button"
                  onClick={retry}
                  className="cc-btn bg-[var(--cc-ink)] text-[var(--cc-paper)]"
                >
                  <RotateCw className="size-4" aria-hidden />
                  Try again
                </button>
              </div>
            )}
            {status === "loading" && (
              <p
                role="status"
                className="text-sm font-semibold text-[var(--cc-yellow)]"
              >
                Loading events…
              </p>
            )}

            {view === "month" && (
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                <MonthView
                  date={selected}
                  events={filtered}
                  ready={status === "ready"}
                  selected={selected}
                  onSelect={setSelected}
                  onOpen={setOpen}
                />
                <aside
                  aria-label={`Events on ${format(selected, "d MMMM")}`}
                  className="cc-paper flex flex-col p-4 xl:self-start"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-[rgba(22,32,122,0.6)]">
                    {isToday(selected) ? "Today" : format(selected, "EEEE")}
                  </p>
                  <p className="cc-display text-3xl">
                    {format(selected, "d MMMM")}
                  </p>
                  <div className="mt-3">
                    {status === "ready" && dayList.length === 0 ? (
                      <EmptyNote>Nothing scheduled on this day.</EmptyNote>
                    ) : (
                      <ul className="grid grid-cols-[minmax(0,1fr)] gap-1">
                        {dayList.map((e, i) => (
                          <li key={e.id}>
                            <AgendaItem event={e} index={i} onOpen={setOpen} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </aside>
              </div>
            )}

            {view === "week" && (
              <WeekView
                date={selected}
                events={filtered}
                onSelectDay={(d) => {
                  setSelected(d);
                  setView("day");
                }}
                onOpen={setOpen}
              />
            )}

            {view === "day" && (
              <DayView date={selected} events={filtered} onOpen={setOpen} />
            )}

            {status === "ready" &&
              !periodHasEvents &&
              (view === "week" || (view === "month" && filtering)) && (
                <p className="rounded-2xl bg-[rgba(255,255,255,0.1)] px-4 py-3 text-sm font-medium">
                  {filtering
                    ? "No events match your search or filters in this period."
                    : `No events scheduled this ${view}.`}{" "}
                  {filtering && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setHidden(new Set());
                      }}
                      className="font-bold text-[var(--cc-yellow)] underline-offset-2 hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </p>
              )}
          </div>
        </div>
      </div>

      <EventDialog
        event={open}
        container={root}
        onClose={() => setOpen(null)}
      />
    </div>
  );
}
