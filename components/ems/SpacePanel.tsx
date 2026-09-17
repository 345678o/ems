"use client";

import { useEffect, useRef } from "react";

const LINES = 7;

/** Scroll-driven marquee panel — alternating lines drift left/right as the
 * panel passes through the viewport. Purely decorative, no data. */
export function SpacePanel() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const lines = Array.from(container.querySelectorAll<HTMLElement>(".space-word-line"));

    function onScroll() {
      const rect = container!.getBoundingClientRect();
      // progress: 0 when panel enters bottom of viewport, 1 when it leaves top
      const viewH = window.innerHeight;
      const progress = (viewH - rect.top) / (viewH + rect.height);
      const clamped = Math.max(0, Math.min(1, progress));
      // max travel: 120px each direction
      const travel = 120;

      lines.forEach((line, i) => {
        const dir = i % 2 === 0 ? -1 : 1; // odd index → right, even → left
        const x = dir * travel * clamped;
        line.style.transform = `translateX(${x}px)`;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // init on mount
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="space-page" ref={containerRef} aria-label="When events need a space">
      <div className="space-word-stack">
        {Array(LINES)
          .fill("when events need a space")
          .map((line, index) => (
            <span key={index} className="space-word-line" style={{ willChange: "transform" }}>
              {line}
            </span>
          ))}
      </div>
    </div>
  );
}
