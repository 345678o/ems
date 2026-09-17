"use client";

import { useEffect, useRef } from "react";

/**
 * Scroll-driven parallax for a section's inner content.
 * The content shifts vertically as the section enters/leaves the viewport.
 * @param speed  0.1 = subtle, 0.3 = noticeable, 0.5 = strong
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>(speed = 0.2) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onScroll() {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewH = window.innerHeight;
      // -1 = below viewport center, 0 = centered, 1 = above
      const progress = (viewH * 0.5 - (rect.top + rect.height * 0.5)) / viewH;
      const y = progress * speed * 160;
      el.style.transform = `translateY(${y}px)`;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [speed]);

  return ref;
}
