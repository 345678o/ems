"use client";

import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";

interface ScrollCardProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Wraps any card with a scroll-driven entrance animation:
 * slides up + fades in + slight scale when entering viewport.
 */
export function ScrollCard({
  children,
  delay = 0,
  className = "",
  style = {},
}: ScrollCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.style.opacity = "0";
    el.style.transform = "translateY(48px) scale(0.96)";
    el.style.transition = `opacity 0.75s ease ${delay}ms, transform 0.75s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms`;
    el.style.willChange = "transform, opacity";

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0) scale(1)";
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
