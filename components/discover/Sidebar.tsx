"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Heart, Home, Settings, UserRound } from "lucide-react";

const ITEMS = [
  { label: "Home", href: "/discover", icon: Home },
  { label: "Clubs", href: "/clubs", icon: Heart },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Profile", href: "/user/profile", icon: UserRound },
  { label: "Account", href: "/register", icon: Settings },
];

/**
 * Compact icon rail. Lives in its own grid column (no offsets) and sticks
 * to the vertical middle of the viewport. Hidden below lg, where the top
 * navigation carries the same links.
 */
export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:block">
      <nav
        aria-label="Primary"
        className="dz-panel sticky top-1/2 flex -translate-y-1/2 flex-col items-center gap-1 p-1"
      >
        {ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={label}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={`group relative grid size-10 place-items-center rounded-lg transition-colors ${
                active
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {active && (
                <span
                  aria-hidden
                  className="absolute -left-1 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-[var(--dz-accent)]"
                />
              )}
              <Icon className="size-[18px]" strokeWidth={1.75} />
              <span
                role="tooltip"
                className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-md bg-[var(--dz-surface-3)] px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
