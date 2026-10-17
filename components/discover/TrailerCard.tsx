import Link from "next/link";
import { PosterReveal } from "@/components/discover/PosterReveal";

/** 16:9 poster tile with the title and date over a bottom gradient. */
export function TrailerCard({
  href,
  title,
  meta,
  image,
  className = "",
}: {
  href: string;
  title: string;
  meta?: string;
  image: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group dz-media dz-media--caption block aspect-video shrink-0 rounded-xl ring-1 ring-[var(--dz-border)] transition-shadow hover:ring-[var(--dz-border-strong)] ${className}`}
    >
      <PosterReveal image={image} aspectRatio="16 / 9" />
      <span className="absolute inset-x-0 bottom-0 z-10 p-3">
        <span className="line-clamp-2 text-sm font-medium leading-snug text-white">
          {title}
        </span>
        {meta && (
          <span className="mt-0.5 block text-xs text-zinc-300">{meta}</span>
        )}
      </span>
    </Link>
  );
}
