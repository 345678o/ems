"use client";

import { useRef, useEffect, ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface AnimatedContentProps {
  children: ReactNode;
  /** Distance in px the element travels before settling. @default 100 */
  distance?: number;
  /** Axis of motion. @default "vertical" */
  direction?: "vertical" | "horizontal";
  /** Reverse the travel direction. @default false */
  reverse?: boolean;
  /** GSAP tween duration in seconds. @default 0.8 */
  duration?: number;
  /** GSAP easing string. @default "power3.out" */
  ease?: string;
  /** Starting opacity (0–1). @default 0 */
  initialOpacity?: number;
  /** Whether to animate opacity. @default true */
  animateOpacity?: boolean;
  /** Starting scale factor. @default 1 */
  scale?: number;
  /**
   * Fraction of the element that must be visible before the animation fires
   * (passed to ScrollTrigger). @default 0.1
   */
  threshold?: number;
  /** Delay in seconds before the tween starts. @default 0 */
  delay?: number;
  /** Callback invoked when the tween completes. */
  onComplete?: () => void;
}

const AnimatedContent = ({
  children,
  distance = 100,
  direction = "vertical",
  reverse = false,
  duration = 0.8,
  ease = "power3.out",
  initialOpacity = 0,
  animateOpacity = true,
  scale = 1,
  threshold = 0.1,
  delay = 0,
  onComplete,
}: AnimatedContentProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const axis = direction === "horizontal" ? "x" : "y";
    const offset = reverse ? -distance : distance;
    const startPct = (1 - threshold) * 100;

    gsap.set(el, {
      [axis]: offset,
      scale,
      opacity: animateOpacity ? initialOpacity : 1,
    });

    gsap.to(el, {
      [axis]: 0,
      scale: 1,
      opacity: 1,
      duration,
      ease,
      delay,
      onComplete,
      scrollTrigger: {
        trigger: el,
        start: `top ${startPct}%`,
        toggleActions: "play none none none",
        once: true,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      gsap.killTweensOf(el);
    };
  }, [
    distance,
    direction,
    reverse,
    duration,
    ease,
    initialOpacity,
    animateOpacity,
    scale,
    threshold,
    delay,
    onComplete,
  ]);

  return <div ref={ref}>{children}</div>;
};

export default AnimatedContent;
