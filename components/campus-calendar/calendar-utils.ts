import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { toEventCategory } from "@/components/ui/category-badge";
import type { DiscoverEvent } from "@/components/discover/types";

export type CalView = "month" | "week" | "day";

/** Weeks run Monday → Sunday, as on printed college calendars. */
export const WEEK = { weekStartsOn: 1 } as const;
export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Every day shown in the month grid: whole weeks covering the month. */
export function monthGrid(date: Date) {
  const start = startOfWeek(startOfMonth(date), WEEK);
  const end = endOfWeek(endOfMonth(date), WEEK);
  const days: Date[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);
  return days;
}

export function weekDays(date: Date) {
  const start = startOfWeek(date, WEEK);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function rangeLabel(date: Date, view: CalView) {
  if (view === "month") return format(date, "MMMM yyyy");
  if (view === "day") return format(date, "EEEE, d MMMM yyyy");
  const [first, last] = [weekDays(date)[0], weekDays(date)[6]];
  return first.getMonth() === last.getMonth()
    ? `${format(first, "d")} – ${format(last, "d MMMM yyyy")}`
    : `${format(first, "d MMM")} – ${format(last, "d MMM yyyy")}`;
}

// ── Categories ──────────────────────────────────────────────────────────────

export type CalCategory = "tech" | "cultural" | "sports" | "workshop" | "club";

export const CATEGORIES: { key: CalCategory; label: string }[] = [
  { key: "tech", label: "Technical" },
  { key: "cultural", label: "Cultural" },
  { key: "sports", label: "Sports" },
  { key: "workshop", label: "Workshops" },
  { key: "club", label: "Club events" },
];

export const CATEGORY_LABEL = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c.label])
) as Record<CalCategory, string>;

/** Theme first, then the name; anything unclassified is a club event. */
export function calCategory(e: DiscoverEvent): CalCategory {
  const fromTheme = toEventCategory(e.theme);
  const c = fromTheme !== "other" ? fromTheme : toEventCategory(e.name);
  return c === "other" ? "club" : c;
}

export function eventsOn(events: DiscoverEvent[], day: Date) {
  return events.filter(
    (e) => e.start_datetime && isSameDay(new Date(e.start_datetime), day)
  );
}

// ── Month artwork + palette ─────────────────────────────────────────────────

const ART = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];
export const monthArt = (date: Date) => `/calendar/${ART[date.getMonth()]}.jpg`;

/** Panel colours cycle lime → cobalt → yellow → pink, like the artwork. */
const TONES = ["lime", "cobalt", "yellow", "pink"] as const;
export const monthTone = (date: Date) => TONES[date.getMonth() % 4];

/** "Add to Google Calendar" link for one event (1 h if no end time). */
export function googleCalendarUrl(e: DiscoverEvent, venue: string) {
  if (!e.start_datetime) return null;
  const start = new Date(e.start_datetime);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const stamp = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.name,
    dates: `${stamp(start)}/${stamp(end)}`,
    location: venue,
    details: e.description ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
