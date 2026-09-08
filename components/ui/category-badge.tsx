import { cn } from "@/lib/utils";

export type EventCategory =
  | "cultural"
  | "tech"
  | "sports"
  | "workshop"
  | "other";

const CATEGORY_STYLES: Record<EventCategory, string> = {
  cultural: "bg-badge-cultural text-badge-cultural-foreground",
  tech: "bg-badge-tech text-badge-tech-foreground",
  sports: "bg-badge-sports text-badge-sports-foreground",
  workshop: "bg-badge-workshop text-badge-workshop-foreground",
  other: "bg-paper-dim text-foreground",
};

const CATEGORY_LABELS: Record<EventCategory, string> = {
  cultural: "Cultural",
  tech: "Tech",
  sports: "Sports",
  workshop: "Workshop",
  other: "Other",
};

/** Normalizes a free-text event type into one of the known badge categories. */
export function toEventCategory(value?: string | null): EventCategory {
  const v = (value ?? "").toLowerCase();
  if (v.includes("cultur")) return "cultural";
  if (v.includes("tech") || v.includes("hack")) return "tech";
  if (v.includes("sport")) return "sports";
  if (v.includes("workshop")) return "workshop";
  return "other";
}

export function CategoryBadge({
  category,
  label,
  className,
}: {
  category: EventCategory;
  /** Override the default label (e.g. keep the club's original casing). */
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold",
        CATEGORY_STYLES[category],
        className
      )}
    >
      {label ?? CATEGORY_LABELS[category]}
    </span>
  );
}
