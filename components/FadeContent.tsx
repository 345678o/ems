"use client";

import { useRef, useEffect, useState, ReactNode, CSSProperties } from "react";

interface FadeContentProps {
  children: ReactNode;
  /** Blur the element while faded out. @default false */
  blur?: boolean;
  /** Transition duration in milliseconds. @default 1000 */
  duration?: number;
  /** CSS easing function. @default "ease-out" */
  easing?: string;
  /** Delay in milliseconds before fading in once the element enters the
   *  viewport. @default 0 */
  delay?: number;
  /**
   * Fraction of the element that must be visible before the fade starts.
   * Passed to IntersectionObserver. @default 0.1
   */
  threshold?: number;
  /** Opacity before the element is in view (0–1). @default 0 */
  initialOpacity?: number;
  /** Extra class names applied to the wrapper div. @default "" */
  className?: string;
}

const FadeContent = ({
  children,
  blur = false,
  duration = 1000,
  easing = "ease-out",
  delay = 0,
  threshold = 0.1,
  initialOpacity = 0,
  className = "",
}: FadeContentProps) => {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.unobserve(el);
          setTimeout(() => setInView(true), delay);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, delay]);

  const style: CSSProperties = {
    opacity: inView ? 1 : initialOpacity,
    transition: `opacity ${duration}ms ${easing}, filter ${duration}ms ${easing}`,
    filter: blur ? (inView ? "blur(0px)" : "blur(10px)") : "none",
  };

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
};

export default FadeContent;
