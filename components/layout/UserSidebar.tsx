"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Compass,
  CalendarDays,
  Ticket,
  Bell,
  Award,
  UserRound,
  Users,
  Handshake,
  LogOut,
} from "lucide-react";
import {
  PillSidebar,
  type PillSidebarItem,
} from "@/components/ui/pill-sidebar";

const NAV_ITEMS: (PillSidebarItem & { href: string })[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  { id: "browse", label: "Browse Events", href: "/home", icon: Compass },
  {
    id: "calendar",
    label: "Events Calendar",
    href: "/events",
    icon: CalendarDays,
  },
  {
    id: "bookings",
    label: "My Bookings",
    href: "/user/profile?tab=my-bookings",
    icon: Ticket,
  },
  {
    id: "notifications",
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
  {
    id: "certificates",
    label: "Certificates",
    href: "/user/profile?tab=certificates",
    icon: Award,
  },
  {
    id: "profile",
    label: "My Profile",
    href: "/user/profile?tab=profile",
    icon: UserRound,
  },
  { id: "clubs", label: "Club Directory", href: "/clubs", icon: Users },
];

function basePath(href: string) {
  return href.split("?")[0];
}

export function UserSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname() ?? "";

  const activeId =
    NAV_ITEMS.find((item) => basePath(item.href) === pathname)?.id ?? "browse";

  return (
    <PillSidebar
      items={NAV_ITEMS}
      activeId={activeId}
      collapsed={collapsed}
      onToggle={onToggle}
      logo={<img src="/logos/iic.svg" alt="" className="h-6 w-6" />}
      footer={
        <>
          <a
            href="/user/profile?tab=partner"
            className={`flex items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/10 hover:text-white ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? "Become an Organizer" : undefined}
          >
            <Handshake className="h-4 w-4 shrink-0" />
            {!collapsed && "Become an Organizer"}
          </a>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className={`flex items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-medium text-neutral-400 transition-colors hover:bg-white/10 hover:text-white ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? "Sign Out" : undefined}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && "Sign Out"}
          </button>
        </>
      }
    />
  );
}

export default UserSidebar;
