import type React from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

/** Placeholder with the same footprint as DiscoverEventCard. */
export function EventCardSkeleton() {
  return (
    <div aria-hidden className="dz-card flex flex-col overflow-hidden">
      <div className="aspect-[16/9] animate-pulse bg-[var(--dz-surface-2)]" />
      <div className="flex flex-col gap-2.5 p-4">
        <div className="h-3 w-24 animate-pulse rounded bg-[var(--dz-surface-3)]" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-[var(--dz-surface-3)]" />
        <div className="h-3 w-full animate-pulse rounded bg-[var(--dz-surface-2)]" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-[var(--dz-surface-2)]" />
        <div className="mt-2 h-9 w-full animate-pulse rounded-lg bg-[var(--dz-surface-2)]" />
      </div>
    </div>
  );
}

export function EventGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading events"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {Array.from({ length: count }, (_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ErrorState({
  title,
  message,
  onRetry,
  stacked = false,
  className = "",
}: {
  title: string;
  message: string;
  onRetry: () => void;
  /** Keep the vertical layout at every width (for narrow columns). */
  stacked?: boolean;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={`dz-panel flex flex-col items-start gap-4 p-5 ${
        stacked ? "" : "sm:flex-row sm:items-center"
      } ${className}`}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--destructive-soft)] text-[var(--danger)]">
        <AlertTriangle className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-ui text-zinc-400">{message}</p>
      </div>
      <button type="button" onClick={onRetry} className="dz-btn dz-btn--ghost">
        <RotateCw className="size-4" aria-hidden />
        Try again
      </button>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  message,
  action,
  className = "",
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`dz-panel flex flex-col items-center gap-3 px-6 py-10 text-center ${className}`}
    >
      <span className="grid size-12 place-items-center rounded-full bg-[var(--dz-surface-2)] text-[var(--dz-accent)] ring-1 ring-[var(--dz-border)]">
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mx-auto mt-1 max-w-sm text-ui text-zinc-400">{message}</p>
      </div>
      {action}
    </div>
  );
}
