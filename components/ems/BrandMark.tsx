"use client";

import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { to: "/", activeColor: "var(--clr-purple)" },
  { to: "/events", activeColor: "var(--clr-orange)" },
  { to: "/clubs", activeColor: "var(--clr-purple)" },
  { to: "/calendar", activeColor: "var(--clr-orange)" },
] as const;

interface BrandMarkProps {
  pathname: string;
}

/**
 * EMS.MLRIT logo mark — two overlapping circles.
 * Rotates 180° on every route change; colours swap at the halfway point.
 */
export function BrandMark({ pathname }: BrandMarkProps) {
  const active = NAV_LINKS.find((l) =>
    l.to === "/" ? pathname === "/" : pathname.startsWith(l.to)
  );

  const c1 = active?.activeColor ?? "var(--clr-purple)";
  const c2 = c1 === "var(--clr-purple)" ? "var(--clr-orange)" : "var(--clr-purple)";

  const [rotation, setRotation] = useState(0);
  const [colors, setColors] = useState({ c1, c2 });
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;

    setRotation((r) => r + 180);

    const t = setTimeout(() => setColors({ c1, c2 }), 300);
    return () => clearTimeout(t);
  }, [pathname, c1, c2]);

  return (
    <span
      className="site-brand-mark"
      aria-hidden="true"
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      <span style={{ borderColor: colors.c1 }} />
      <span style={{ borderColor: colors.c2 }} />
    </span>
  );
}
