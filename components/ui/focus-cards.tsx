"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_EVENT_THEME, type EventTheme } from "@/lib/utils/theme-color";

type CardItem = {
  title: string;
  src: string;
  href?: string;
  colors?: EventTheme;
};

type CardProps = {
  card: CardItem;
  index: number;
  hovered: number | null;
  setHovered: React.Dispatch<React.SetStateAction<number | null>>;
};

type SpinPhase = "idle" | "spinning-in" | "ring" | "spinning-out";

export const Card = React.memo(function Card({
  card,
  index,
  hovered,
  setHovered,
}: CardProps) {
  const isHovered = hovered === index;
  const [phase, setPhase] = useState<SpinPhase>("idle");

  useEffect(() => {
    if (isHovered) {
      if (phase === "idle" || phase === "spinning-out") {
        setPhase("spinning-in");
      }
    } else {
      if (phase === "ring" || phase === "spinning-in") {
        setPhase("spinning-out");
      }
    }
  }, [isHovered]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnimEnd = () => {
    if (phase === "spinning-in") setPhase("ring");
    if (phase === "spinning-out") setPhase("idle");
  };

  const accent = (card.colors ?? DEFAULT_EVENT_THEME).dark;

  const body = (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "group/card rounded-2xl relative overflow-hidden border border-white/10 bg-white/60 dark:bg-neutral-900/80 shadow-sm backdrop-blur",
        "transition-all duration-300 ease-out will-change-transform",
        hovered !== null && hovered !== index && "blur-[2px] scale-[0.96]"
      )}
    >
      {/* Portrait image area — matches Figma's Live Now card proportions */}
      <div className="relative w-full aspect-[4/5] overflow-hidden">
        <img
          src={card.src}
          alt={card.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-[1.02]"
          draggable={false}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-14"
          style={{
            background: `linear-gradient(to top, ${accent}99, transparent)`,
          }}
        />
      </div>

      {/* Content area */}
      <div className="p-3 md:p-4 flex items-center justify-between">
        <div className="text-xs md:text-base font-semibold text-foreground">
          {card.title}
        </div>

        <div className="relative hidden md:flex items-center justify-center size-8 aspect-square shrink-0 rounded-full">
          <ArrowUpRight size={16} className="text-foreground z-10" />

          {/* Dashed spinning border */}
          <span
            onAnimationEnd={handleAnimEnd}
            className={cn(
              "absolute inset-0 rounded-full border-2 border-dashed border-foreground/60",
              phase === "spinning-in" && "animate-spinEaseIn",
              phase === "spinning-out" && "animate-spinEaseOut",
              phase === "ring" &&
                "opacity-0 scale-110 transition-all duration-500"
            )}
          />

          {/* Smooth fading solid ring */}
          <span
            className={cn(
              "absolute inset-0 rounded-full ring-2 opacity-0 scale-90 transition-all duration-200 ring-purple-400",
              phase === "ring" && "opacity-100 scale-100"
            )}
          />
        </div>
      </div>

      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx>{`
        @keyframes spinEaseIn {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(180deg);
          }
        }
        @keyframes spinEaseOut {
          0% {
            transform: rotate(180deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
        .animate-spinEaseIn {
          animation: spinEaseIn 600ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .animate-spinEaseOut {
          animation: spinEaseOut 500ms cubic-bezier(0.65, 0, 0.35, 1) forwards;
        }
      `}</style>
    </div>
  );

  return card.href ? (
    <Link href={card.href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
});

Card.displayName = "Card";

export function FocusCards({ cards }: { cards: CardItem[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-7xl mx-auto px-4 w-full">
      {cards.map((card, index) => (
        <Card
          key={`${card.title}-${index}`}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
        />
      ))}
    </div>
  );
}

/**
 * Horizontal, snap-scrolling poster row with a heading + "See All" link —
 * the BookMyShow-style "Recommended" strip, reusing the same poster Card.
 */
export function FocusCardsRow({
  title,
  cards,
  seeAllHref,
}: {
  title: string;
  cards: CardItem[];
  seeAllHref?: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="w-full">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4">
        <h2 className="font-poppins text-2xl font-bold text-white md:text-3xl">
          {title}
        </h2>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="text-sm font-semibold text-[#D96CE5] transition-colors hover:text-[#FF8AC9]"
          >
            See All &rsaquo;
          </Link>
        )}
      </div>

      <div className="scrollbar-none mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2">
        {cards.map((card, index) => (
          <div
            key={`${card.title}-${index}`}
            className="w-[42vw] shrink-0 snap-start sm:w-[220px]"
          >
            <Card
              card={card}
              index={index}
              hovered={hovered}
              setHovered={setHovered}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
