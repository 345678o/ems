import { toEventCategory } from "@/components/ui/category-badge";

export type DiscoverEvent = {
  id: string;
  name: string;
  description: string | null;
  start_datetime: string | null;
  event_type: string | null;
  theme: string | null;
  venue: string | null;
  city: string | null;
  banners: Record<string, string> | null;
  club: { name: string } | null;
};

/** Column list for `supabase.from("events").select(...)` → DiscoverEvent. */
export const EVENT_FIELDS =
  "id,name,description,start_datetime,event_type,theme,venue,city,banners,clubs(name)";

type RawEvent = Omit<DiscoverEvent, "club"> & {
  clubs: { name: string } | { name: string }[] | null;
};

/** Flattens the embedded `clubs` relation (object or 1-item array). */
export function toDiscoverEvents(data: unknown): DiscoverEvent[] {
  return ((data as RawEvent[] | null) ?? []).map(({ clubs, ...e }) => ({
    ...e,
    club: Array.isArray(clubs) ? (clubs[0] ?? null) : clubs,
  }));
}

/** Description worth showing — some rows hold placeholders like "-". */
export function eventBlurb(e: Pick<DiscoverEvent, "description">) {
  const d = e.description?.trim();
  return d && /[a-z]{3}/i.test(d) ? d : null;
}

export function eventLocation(e: {
  venue: string | null;
  city: string | null;
}) {
  return Array.from(
    new Set(
      [e.venue, e.city].filter(
        (v): v is string => v != null && v.trim().toLowerCase() !== "tbd"
      )
    )
  ).join(", ");
}

// Club logos shipped in /public/clubs (extensionless JPEGs), keyed by the
// first word of the club name.
const CLUB_LOGOS: Record<string, string> = {
  APEX: "/clubs/apex",
  AREO: "/clubs/areo",
  CAME: "/clubs/came",
  CIE: "/clubs/cie",
  CODE: "/clubs/code",
  EWB: "/clubs/EWB",
  LIT: "/clubs/lit",
  MUN: "/clubs/mun",
  NSS: "/clubs/nss",
  SCOPE: "/clubs/scope",
};

export function clubLogo(name: string) {
  return CLUB_LOGOS[name.split(/\s+/)[0].toUpperCase()];
}

// Local artwork used when an event has no uploaded banner.
const FALLBACK_COVERS = [
  "/events/metaloop.png",
  "/events/equniox.png",
  "/events/gi.png",
  "/events/hustle mania.png",
  "/events/B2B.png",
  "/events/wc 2.0.png",
  "/events/wc.png",
];

export function eventCover(e: DiscoverEvent, index: number) {
  const b = e.banners ?? {};
  return (
    b["16:9"] || b["1x1"] || FALLBACK_COVERS[index % FALLBACK_COVERS.length]
  );
}

export function eventCategory(e: DiscoverEvent) {
  // Long themes ("Artificial Intelligence & Machine Learning") are cut off
  // by the pill's CSS truncation.
  const theme = e.theme?.trim();
  if (theme) return theme;
  // event_type is only "free"/"paid", so fall back to a guess from the name.
  const guess = toEventCategory(e.name);
  return guess === "other" ? "Event" : guess[0].toUpperCase() + guess.slice(1);
}

export function formatEventTime(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Venue text that names an online platform rather than a place. */
export function isOnlineEvent(e: Pick<DiscoverEvent, "venue">) {
  return /\b(online|virtual|zoom|google meet|teams|webinar)\b/i.test(
    e.venue ?? ""
  );
}

export function isUpcomingEvent(
  e: Pick<DiscoverEvent, "start_datetime">,
  now: number
) {
  return !!e.start_datetime && new Date(e.start_datetime).getTime() >= now;
}

export function clubHref(name: string) {
  return `/clubs/${encodeURIComponent(name.toLowerCase())}`;
}

export function formatEventDate(iso: string | null) {
  if (!iso) return "Date TBA";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
