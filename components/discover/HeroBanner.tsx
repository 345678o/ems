import type React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Ellipsis } from "lucide-react";

type HeroAction = {
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
};

function ActionButton({
  action,
  variant,
}: {
  action: HeroAction;
  variant: "primary" | "ghost";
}) {
  const cls = `dz-btn dz-btn--${variant}`;
  if (action.href && !action.disabled) {
    return (
      <Link href={action.href} className={cls}>
        {action.icon}
        {action.label}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={action.onClick}
      disabled={action.disabled}
      className={cls}
    >
      {action.icon}
      {action.label}
    </button>
  );
}

/**
 * Featured banner: real artwork as an object-cover image, a left scrim for
 * the copy block (eyebrow, tags, title, description, actions) and optional
 * carousel arrows bottom-right.
 */
export function HeroBanner({
  image,
  eyebrow,
  tags = [],
  title,
  titleAs: Title = "h2",
  description,
  primary,
  secondary,
  moreHref,
  onPrev,
  onNext,
  className = "",
}: {
  image?: string;
  eyebrow?: string;
  tags?: string[];
  title: string;
  titleAs?: "h1" | "h2";
  description?: string | null;
  primary: HeroAction;
  secondary?: HeroAction;
  moreHref?: string;
  onPrev?: () => void;
  onNext?: () => void;
  className?: string;
}) {
  return (
    <section
      className={`dz-media relative flex min-h-[400px] flex-col justify-end overflow-hidden rounded-2xl border border-[var(--dz-border)] md:min-h-0 md:h-[340px] md:justify-center ${className}`}
    >
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" />
      )}
      <div aria-hidden className="dz-hero-shade" />

      <div className="relative min-w-0 max-w-[480px] p-6 md:px-8 md:py-6">
        {eyebrow && (
          <p className="flex items-center gap-2 text-ui font-medium text-zinc-300">
            <span
              aria-hidden
              className="size-1.5 rounded-full bg-[var(--dz-accent)]"
            />
            {eyebrow}
          </p>
        )}
        <Title className="mt-3 line-clamp-2 text-2xl font-semibold leading-tight tracking-[-0.02em] md:text-[28px]">
          {title}
        </Title>
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="dz-chip dz-dark-chip max-w-[220px] truncate"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        {description && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-zinc-300">
            {description}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <ActionButton action={primary} variant="primary" />
          {secondary && <ActionButton action={secondary} variant="ghost" />}
          {moreHref && (
            <Link
              href={moreHref}
              aria-label="More details"
              className="dz-btn dz-btn--ghost !w-10 !px-0 max-sm:hidden"
            >
              <Ellipsis className="size-4" aria-hidden />
            </Link>
          )}
        </div>
      </div>

      {onPrev && onNext && (
        <div className="absolute right-4 top-4 flex gap-2 md:bottom-6 md:right-6 md:top-auto">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous"
            className="dz-dark-chip grid size-10 place-items-center rounded-full transition-colors hover:bg-black/70"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next"
            className="dz-dark-chip grid size-10 place-items-center rounded-full transition-colors hover:bg-black/70"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </section>
  );
}
