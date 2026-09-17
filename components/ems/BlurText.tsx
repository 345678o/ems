"use client";

import { useEffect, useRef, useState } from "react";

interface BlurTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  delay?: number; // ms between each word, default 80
  duration?: number; // ms per word animation, default 600
  once?: boolean; // only animate on first view
}

/**
 * ReactBits-style BlurText:
 * Each word fades in from blur(12px) + translateY(8px) → clear, staggered.
 */
export function BlurText({
  text,
  className = "",
  style = {},
  delay = 80,
  duration = 600,
  once = true,
}: BlurTextProps) {
  const words = text.split(" ");
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [once]);

  return (
    <span ref={ref} className={className} style={{ display: "inline", ...style }}>
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            whiteSpace: "pre",
            opacity: visible ? 1 : 0,
            filter: visible ? "blur(0px)" : "blur(12px)",
            transform: visible ? "translateY(0)" : "translateY(10px)",
            transitionProperty: "opacity, filter, transform",
            transitionDuration: `${duration}ms`,
            transitionTimingFunction: "ease",
            transitionDelay: visible ? `${i * delay}ms` : "0ms",
          }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}
