import Link from "next/link";
import { ChevronRight, UsersRound } from "lucide-react";
import type { LoadStatus } from "@/components/discover/useEvents";
import { EmptyState, ErrorState } from "@/components/discover/LoadStates";

export type ClubItem = {
  key: string;
  href: string;
  name: string;
  about?: string | null;
  meta: string;
  logo?: string | null;
};

/**
 * Club discovery list: logo, name, short description and upcoming-event
 * count, one row per club. Handles loading / error / empty itself so the
 * page can drop it in with just the fetch status.
 */
export function ExploreClubs({
  items,
  status = "ready",
  onRetry,
  className = "",
}: {
  items: ClubItem[];
  status?: LoadStatus;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <section
      aria-labelledby="explore-clubs-heading"
      className={`dz-panel flex min-h-0 flex-col p-4 ${className}`}
    >
      <div className="flex items-center justify-between px-1">
        <h2 id="explore-clubs-heading" className="text-lg font-semibold">
          Explore clubs
        </h2>
        <Link
          href="/clubs"
          className="-my-2 py-2 text-ui text-zinc-400 transition-colors hover:text-white"
        >
          View all clubs
        </Link>
      </div>

      {status === "loading" && (
        <ul aria-hidden className="mt-2">
          {Array.from({ length: 4 }, (_, i) => (
            <li key={i} className="flex items-center gap-3 px-1 py-3">
              <span className="size-10 animate-pulse rounded-lg bg-[var(--dz-surface-3)]" />
              <span className="flex-1 space-y-2">
                <span className="block h-3 w-1/2 animate-pulse rounded bg-[var(--dz-surface-3)]" />
                <span className="block h-3 w-3/4 animate-pulse rounded bg-[var(--dz-surface-2)]" />
              </span>
            </li>
          ))}
        </ul>
      )}

      {status === "error" && onRetry && (
        <ErrorState
          className="mt-3 !border-0 !bg-transparent !p-1"
          stacked
          title="Clubs didn't load"
          message="We couldn't fetch the club list."
          onRetry={onRetry}
        />
      )}

      {status === "ready" && items.length === 0 && (
        <EmptyState
          className="mt-3 !border-0 !bg-transparent !py-6"
          icon={<UsersRound className="size-5" aria-hidden />}
          title="No clubs yet"
          message="Clubs will appear here once they are added."
        />
      )}

      {status === "ready" && items.length > 0 && (
        <ul className="dz-scroll mt-2 grid min-h-0 flex-1 content-start gap-x-6 overflow-y-auto sm:grid-cols-2 xl:grid-cols-1">
          {items.map((it) => (
            <li
              key={it.key}
              className="border-b border-[var(--dz-border)] last:border-0"
            >
              <Link
                href={it.href}
                aria-label={`View ${it.name}`}
                className="group flex items-center gap-3 rounded-lg px-1 py-3 transition-colors hover:bg-white/[0.03]"
              >
                <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-[var(--dz-surface-3)] text-ui font-semibold text-zinc-300">
                  {it.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.logo}
                      alt=""
                      loading="lazy"
                      className="size-full bg-white object-cover"
                    />
                  ) : (
                    it.name.slice(0, 2).toUpperCase()
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {it.name}
                  </span>
                  {it.about && (
                    <span className="block truncate text-xs text-zinc-400">
                      {it.about}
                    </span>
                  )}
                  <span className="block truncate text-xs text-faint">
                    {it.meta}
                  </span>
                </span>
                <ChevronRight
                  className="size-4 shrink-0 text-zinc-600 transition-colors group-hover:text-zinc-300"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
