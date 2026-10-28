import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Ticket,
  UserRound,
  UsersRound,
} from "lucide-react";

/**
 * "Jump in" shortcuts under the Discover header: one row of compact tiles
 * (two columns on phones). Each tile is a single link with one icon in the
 * accent tint, so the row stays quiet next to the event artwork below.
 */
const SHORTCUTS = [
  {
    icon: Ticket,
    label: "Events",
    hint: "Browse everything on campus",
    href: "/events",
  },
  {
    icon: UsersRound,
    label: "Clubs",
    hint: "Find your community",
    href: "/clubs",
  },
  {
    icon: CalendarDays,
    label: "Calendar",
    hint: "See what's on each day",
    href: "/calendar",
  },
  {
    icon: UserRound,
    label: "Profile",
    hint: "Your account and events",
    href: "/user/profile",
  },
];

export function JumpIn() {
  return (
    <section aria-labelledby="jump-in-heading">
      <h2 id="jump-in-heading" className="sr-only">
        Jump in
      </h2>
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {SHORTCUTS.map(({ icon: Icon, label, hint, href }) => (
          <li key={label} className="min-w-0">
            <Link
              href={href}
              className="dz-card group flex h-full items-center gap-3 p-3 sm:p-4"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[rgba(255,122,80,0.12)] text-[var(--dz-accent)] ring-1 ring-[rgba(255,122,80,0.2)] transition-colors group-hover:bg-[rgba(255,122,80,0.18)]">
                <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{label}</span>
                <span className="block truncate text-xs text-zinc-400 max-sm:hidden">
                  {hint}
                </span>
              </span>
              <ArrowUpRight
                className="size-4 shrink-0 text-faint transition-colors group-hover:text-white max-sm:hidden"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
