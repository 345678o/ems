import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PosterReveal } from "@/components/discover/PosterReveal";

/**
 * Recommendation card: poster on top (kept unobscured, category chip in the
 * corner), then a two-line title and one metadata line. Fixed slots keep
 * every card in a row the same height.
 */
export function EventCard({
  href,
  title,
  category,
  meta,
  image,
  className = "",
}: {
  href: string;
  title: string;
  category: string;
  meta?: string;
  image: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group dz-card flex min-w-0 flex-col overflow-hidden ${className}`}
    >
      <div className="dz-media aspect-[16/10]">
        <PosterReveal image={image} aspectRatio="16 / 10" />
        <span className="dz-chip dz-dark-chip absolute left-2.5 top-2.5 z-10 max-w-[calc(100%-20px)] truncate">
          {category}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
          {title}
        </h3>
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="min-w-0 truncate text-xs text-zinc-400">{meta}</span>
          <ArrowUpRight
            className="size-4 shrink-0 text-faint transition-colors group-hover:text-white"
            aria-hidden
          />
        </div>
      </div>
    </Link>
  );
}
