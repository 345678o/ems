"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/ems/site-shell";

// ─── LOCKED ──────────────────────────────────────────────────────────────────
// Non-events pages : fixed full-width navbar.
// /events pages    : fixed navbar animates left→sidebar edge, stays there.
//                    The right side is clipped by setting `right` to match
//                    the page-gutter so it doesn't bleed past the card edge.
// ─────────────────────────────────────────────────────────────────────────────

export function GlobalNav() {
  const pathname = usePathname();
  const isEvents = pathname.startsWith("/events");
  const [leftPx, setLeftPx] = useState(0);
  const [rightPx, setRightPx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function measure() {
    const rail = document.querySelector<HTMLElement>(".event-rail");
    const intro = document.querySelector<HTMLElement>(".event-intro");
    if (rail && intro) {
      setLeftPx(rail.getBoundingClientRect().right);
      setRightPx(window.innerWidth - intro.getBoundingClientRect().right);
    } else {
      requestAnimationFrame(measure);
    }
  }

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (isEvents) {
      timerRef.current = setTimeout(measure, 60);
    } else {
      setLeftPx(0);
      setRightPx(0);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname]);

  useEffect(() => {
    if (!isEvents) return;
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [isEvents]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: leftPx,
        right: rightPx,
        zIndex: 50,
        transition:
          "left 0.65s cubic-bezier(0.4,0,0.2,1), right 0.65s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <SiteHeader className={isEvents ? "event-fixed-header" : ""} />
    </div>
  );
}
