import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type ClubItem = {
  key: string;
  href: string;
  name: string;
  meta: string;
  logo?: string;
};

/** Compact club list: uniform logos, one text column, subtle row separators. */
export function ExploreClubs({
  items,
  className = "",
}: {
  items: ClubItem[];
  className?: string;
}) {
  return (
    <section className={`dz-panel flex min-h-0 flex-col p-4 ${className}`}>
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold">Explore clubs</h2>
        <Link
          href="/clubs"
          className="-my-2 py-2 text-ui text-zinc-400 transition-colors hover:text-white"
        >
          View all
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="px-1 pt-4 text-ui text-faint">No clubs yet.</p>
      ) : (
        <ul className="dz-scroll mt-2 grid min-h-0 flex-1 content-start gap-x-6 overflow-y-auto sm:grid-cols-2 xl:grid-cols-1">
          {items.map((it) => (
            <li key={it.key} className="border-b border-[var(--dz-border)]">
              <Link
                href={it.href}
                className="group flex items-center gap-3 rounded-lg px-1 py-3 transition-colors hover:bg-white/[0.03]"
              >
                <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-[var(--dz-surface-3)] text-ui font-semibold text-zinc-300">
                  {it.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.logo}
                      alt=""
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
