"use client";

import React, { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type CardItem = {
  title: string;
  src: string;
  href?: string;
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

  return (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "group/card rounded-2xl relative overflow-hidden border border-white/10 bg-white/60 dark:bg-neutral-900/80 shadow-sm backdrop-blur",
        "transition-all duration-300 ease-out will-change-transform",
        hovered !== null && hovered !== index && "blur-[2px] scale-[0.96]"
      )}
    >
      {/* 1:1 image area */}
      <div className="relative w-full aspect-square overflow-hidden">
        <img
          src={card.src}
          alt={card.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-[1.02]"
          draggable={false}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/40 to-transparent" />
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
