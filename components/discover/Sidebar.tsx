"use client";

import type React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Award,
  Bell,
  BadgeCheck,
  Building2,
  CalendarCheck,
  CalendarPlus,
  CalendarDays,
  GraduationCap,
  Handshake,
  Home,
  LayoutList,
  LayoutDashboard,
  LogIn,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Ticket,
  UsersRound,
} from "lucide-react";
import {
  ROLE_HOME,
  useUserRoleState,
  type UserRole,
} from "@/components/discover/useUserRole";

export type SidebarMode = "auto" | "expanded" | "collapsed";

type Item = {
  label: string;
  href: string;
  icon: React.ElementType;
  isActive: (path: string, params: URLSearchParams) => boolean;
  /** Only shown to signed-in students. */
  auth?: boolean;
};

const isWorkshops = (path: string, params: URLSearchParams) =>
  path === "/events" && params.get("q")?.toLowerCase() === "workshop";

const MAIN: Item[] = [
  {
    label: "Home",
    href: "/discover",
    icon: Home,
    isActive: (p) => p.startsWith("/discover"),
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    isActive: (p) => p.startsWith("/dashboard"),
    auth: true,
  },
  {
    label: "Events",
    href: "/events",
    icon: Ticket,
    isActive: (p, q) => p.startsWith("/events") && !isWorkshops(p, q),
  },
  // Registered events. There is no saved/bookmarked-events table yet, so
  // this is the closest real "my events" list.
  {
    label: "My Bookings",
    href: "/bookings",
    icon: CalendarCheck,
    isActive: (p) => p.startsWith("/bookings"),
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: CalendarDays,
    isActive: (p) => p.startsWith("/calendar"),
  },
  {
    label: "Clubs",
    href: "/clubs",
    icon: UsersRound,
    isActive: (p) => p.startsWith("/clubs"),
  },
  {
    label: "Workshops",
    href: "/events?q=workshop",
    icon: GraduationCap,
    isActive: isWorkshops,
  },
  {
    label: "Certificates",
    href: "/user/profile?tab=certificates",
    icon: Award,
    isActive: (p, q) =>
      p === "/user/profile" && q.get("tab") === "certificates",
    auth: true,
  },
];

// Club workspace. /club/event/[id] (an event's own workspace) counts as
// "My events".
const CLUB_MAIN: Item[] = [
  {
    label: "My events",
    href: "/club",
    icon: LayoutList,
    isActive: (p) =>
      p === "/club" ||
      (p.startsWith("/club/event/") && p !== "/club/event/create"),
  },
  {
    label: "Create event",
    href: "/club/event/create",
    icon: CalendarPlus,
    isActive: (p) => p === "/club/event/create",
  },
  {
    label: "Club profile",
    href: "/club/profile",
    icon: Building2,
    isActive: (p) => p.startsWith("/club/profile"),
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: CalendarDays,
    isActive: (p) => p.startsWith("/calendar"),
  },
  {
    label: "Browse events",
    href: "/events",
    icon: Ticket,
    isActive: (p) => p.startsWith("/events"),
  },
  {
    label: "Clubs",
    href: "/clubs",
    icon: UsersRound,
    isActive: (p) => p.startsWith("/clubs"),
  },
];

// Admin console: sections of /admin picked by ?tab= (approvals is default).
const ADMIN_MAIN: Item[] = [
  {
    label: "Approvals",
    href: "/admin?tab=approvals",
    icon: BadgeCheck,
    isActive: (p, q) => p === "/admin" && q.get("tab") !== "iic",
  },
  {
    label: "IIC calendar",
    href: "/admin?tab=iic",
    icon: CalendarCheck,
    isActive: (p, q) => p === "/admin" && q.get("tab") === "iic",
  },
  {
    label: "Campus calendar",
    href: "/calendar",
    icon: CalendarDays,
    isActive: (p) => p.startsWith("/calendar"),
  },
  {
    label: "Events",
    href: "/events",
    icon: Ticket,
    isActive: (p) => p.startsWith("/events"),
  },
  {
    label: "Clubs",
    href: "/clubs",
    icon: UsersRound,
    isActive: (p) => p.startsWith("/clubs"),
  },
];

/** Menu per role. Faculty pages aren't built into this frame yet. */
const NAV: Record<UserRole, Item[]> = {
  student: MAIN,
  faculty: MAIN,
  club: CLUB_MAIN,
  admin: ADMIN_MAIN,
};

// Where the avatar row links for each role.
const ACCOUNT_HREF: Record<UserRole, string> = {
  student: "/user/profile",
  faculty: "/faculty",
  club: "/club/profile",
  admin: "/admin",
};

const ORGANIZER: Item = {
  label: "Become an Organizer",
  href: "/user/profile?tab=partner",
  icon: Handshake,
  isActive: (p, q) => p === "/user/profile" && q.get("tab") === "partner",
};

const NOTIFICATIONS: Item = {
  label: "Notifications",
  href: "/notifications",
  icon: Bell,
  isActive: (p) => p.startsWith("/notifications"),
};

// Shared row look: icon sits at the same x in both widths (48px row in the
// 72px rail → 15px side padding around the 18px icon).
const rowClass =
  "group relative flex h-10 w-full items-center gap-3 rounded-lg px-[15px] text-sm transition-colors";
const tipClass =
  "dz-sb-tip pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-md border border-[var(--dz-border)] bg-[var(--dz-surface-3)] px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100";

function NavRow({
  item,
  active,
  onNavigate,
}: {
  item: Item;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      className={`${rowClass} ${
        active
          ? "bg-white/[0.07] font-medium text-white"
          : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      {active && (
        <span
          aria-hidden
          className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[var(--dz-accent)]"
        />
      )}
      <Icon
        className={`size-[18px] shrink-0 ${active ? "text-[var(--dz-accent)]" : ""}`}
        strokeWidth={1.75}
        aria-hidden
      />
      <span className="dz-sb-label truncate">{item.label}</span>
      <span role="tooltip" className={tipClass}>
        {item.label}
      </span>
    </Link>
  );
}

function ActionRow({
  label,
  icon: Icon,
  onClick,
  hint,
}: {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`${rowClass} text-zinc-400 hover:bg-white/[0.04] hover:text-white`}
    >
      <Icon className="size-[18px] shrink-0" strokeWidth={1.75} aria-hidden />
      <span className="dz-sb-label flex-1 truncate text-left">{label}</span>
      {hint && (
        <kbd className="dz-sb-label rounded border border-[var(--dz-border)] px-1.5 text-[11px] text-faint">
          {hint}
        </kbd>
      )}
      <span role="tooltip" className={tipClass}>
        {label}
      </span>
    </button>
  );
}

/**
 * The app's only navigation: brand, search, sections, then notifications,
 * account and the collapse toggle pinned to the bottom. Rendered fixed on
 * md+ (see DiscoverShell) and inside the mobile drawer.
 */
export function Sidebar({
  mode,
  expanded,
  onToggle,
  onSearch,
  onNavigate,
  className = "",
}: {
  mode: SidebarMode;
  /** Whether the rail is showing labels right now (resolves "auto"). */
  expanded: boolean;
  /** Omitted in the drawer, which has no collapsed state. */
  onToggle?: () => void;
  onSearch: () => void;
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const { data: session, status } = useSession();

  const name = session?.user?.name ?? "Guest";
  const email = session?.user?.email;
  const avatar = session?.user?.image;
  const signedIn = status === "authenticated";
  const roleState = useUserRoleState(signedIn ? email : null);
  // Guests and signed-in students share the student menu; staff menus wait
  // for the role so a club never sees student links flash first.
  const role: UserRole = roleState.role ?? "student";
  const roleKnown = !signedIn || roleState.status !== "loading";
  const items = NAV[role].filter((item) => !item.auth || signedIn);
  const homeHref = signedIn ? ROLE_HOME[role] : "/discover";
  const accountHref = ACCOUNT_HREF[role];
  const accountLabel =
    role === "club"
      ? "Club profile"
      : role === "admin"
        ? "Admin console"
        : "Profile";
  const isStudent = role === "student";
  const profileActive =
    role === "student"
      ? pathname === "/user/profile" &&
        !["certificates", "partner"].includes(params.get("tab") ?? "")
      : role === "club"
        ? pathname.startsWith("/club/profile")
        : false;

  return (
    <aside
      data-sb={mode}
      className={`dz-sb flex h-full flex-col border-r border-[var(--dz-border)] bg-[var(--dz-surface-1)] ${className}`}
    >
      <div className="flex h-16 shrink-0 items-center px-[18px]">
        <Link
          href={homeHref}
          onClick={onNavigate}
          aria-label="EMS.MLRIT home"
          className="flex min-w-0 items-center gap-3 rounded-lg"
        >
          <span
            aria-hidden
            className="grid size-9 shrink-0 place-items-center rounded-lg bg-[rgba(255,117,71,0.14)] ring-1 ring-[rgba(255,117,71,0.3)]"
          >
            <span className="size-2.5 rounded-full bg-[var(--dz-accent)]" />
          </span>
          <span className="dz-sb-label truncate text-[15px] font-semibold tracking-tight">
            EMS<span className="text-faint">.MLRIT</span>
          </span>
        </Link>
      </div>

      <nav
        aria-label="Primary"
        className="flex flex-1 flex-col gap-1 px-3 pt-2"
      >
        <ActionRow
          label="Search events"
          icon={Search}
          onClick={onSearch}
          hint="⌘K"
        />
        <div className="my-2 h-px bg-[var(--dz-border)]" />
        {signedIn && role !== "student" && (
          <p className="dz-sb-label px-[15px] pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-faint">
            {role === "club" ? "Club workspace" : "Admin console"}
          </p>
        )}
        {roleKnown
          ? items.map((item) => (
              <NavRow
                key={item.label}
                item={item}
                active={item.isActive(pathname, params)}
                onNavigate={onNavigate}
              />
            ))
          : Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                aria-hidden
                className="mx-[6px] my-1 block h-8 animate-pulse rounded-lg bg-white/[0.04]"
              />
            ))}
      </nav>

      <div className="flex shrink-0 flex-col gap-1 border-t border-[var(--dz-border)] px-3 py-3">
        {/* Notifications are built from student registrations. */}
        {isStudent && (
          <NavRow
            item={NOTIFICATIONS}
            active={NOTIFICATIONS.isActive(pathname, params)}
            onNavigate={onNavigate}
          />
        )}

        {/* Profile / account */}
        {signedIn ? (
          <>
            {isStudent && (
              <NavRow
                item={ORGANIZER}
                active={ORGANIZER.isActive(pathname, params)}
                onNavigate={onNavigate}
              />
            )}
            <Link
              href={accountHref}
              onClick={onNavigate}
              aria-label={`${accountLabel} — ${name}`}
              aria-current={profileActive ? "page" : undefined}
              className={`group relative flex h-12 items-center gap-3 rounded-lg px-[10px] transition-colors ${
                profileActive ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"
              }`}
            >
              {profileActive && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[var(--dz-accent)]"
                />
              )}
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatar}
                  alt=""
                  className="size-7 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--dz-accent)] text-xs font-semibold text-[#1a0d06]">
                  {name[0]?.toUpperCase()}
                </span>
              )}
              <span className="dz-sb-label min-w-0 leading-tight">
                <span className="block truncate text-ui font-medium text-white">
                  {name}
                </span>
                {email && (
                  <span className="block truncate text-xs text-zinc-400">
                    {email}
                  </span>
                )}
              </span>
              <span role="tooltip" className={tipClass}>
                {accountLabel}
              </span>
            </Link>
            <ActionRow
              label="Sign out"
              icon={LogOut}
              onClick={() => signOut({ callbackUrl: "/discover" })}
            />
          </>
        ) : (
          <NavRow
            item={{
              label: status === "loading" ? "Account" : "Sign in",
              href: "/register",
              icon: LogIn,
              isActive: (p) => p.startsWith("/register"),
            }}
            active={pathname.startsWith("/register")}
            onNavigate={onNavigate}
          />
        )}

        {onToggle && (
          <ActionRow
            label={expanded ? "Collapse sidebar" : "Expand sidebar"}
            icon={expanded ? PanelLeftClose : PanelLeftOpen}
            onClick={onToggle}
          />
        )}
      </div>
    </aside>
  );
}
