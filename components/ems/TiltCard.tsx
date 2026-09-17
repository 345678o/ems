"use client";

import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Max tilt angle in degrees */
  maxTilt?: number;
  /** Glare overlay intensity 0–1 */
  glare?: number;
}

/**
 * ReactBits-inspired 3D tilt card.
 * - Mouse-tracking perspective tilt
 * - Moving glare overlay
 */
export function TiltCard({
  children,
  className = "",
  style = {},
  maxTilt = 12,
  glare = 0.25,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  // 3D tilt on mouse move
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onEnter() {
      el!.style.transition = "transform 0.1s ease, box-shadow 0.3s ease";
    }

    function onMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const rotX = -dy * maxTilt;
      const rotY = dx * maxTilt;

      el!.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.03,1.03,1.03)`;
      el!.style.boxShadow = `${-rotY * 1.5}px ${rotX * 1.5}px 40px rgba(0,0,0,0.25)`;

      // Glare
      if (glareRef.current) {
        const gx = ((dx + 1) / 2) * 100;
        const gy = ((dy + 1) / 2) * 100;
        glareRef.current.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,${glare}), transparent 70%)`;
      }
    }

    function onLeave() {
      el!.style.transition =
        "transform 0.6s cubic-bezier(0.23,1,0.32,1), box-shadow 0.6s ease";
      el!.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
      el!.style.boxShadow = "";
      if (glareRef.current) glareRef.current.style.background = "none";
    }

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mousemove", onMove as EventListener);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mousemove", onMove as EventListener);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [maxTilt, glare]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        position: "relative",
        willChange: "transform",
        transformStyle: "preserve-3d",
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
      {/* Glare overlay */}
      <div
        ref={glareRef}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          pointerEvents: "none",
          zIndex: 2,
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
}
