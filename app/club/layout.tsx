"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  PillSidebar,
  PILL_SIDEBAR_WIDTH,
  useSidebarCollapsed,
} from "@/components/ui/pill-sidebar";
import { ClubTopBar } from "@/components/ui/club-topbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSession, signOut } from "next-auth/react";
import { CalendarDays, User, LogOut } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function ClubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, toggleCollapsed] = useSidebarCollapsed("club-sidebar-collapsed");
  // Only hide the shared sidebar on the event detail page: /club/event/[id]
  // This will NOT hide it on other subroutes like /club/event/create
  const isEventDetailPage = new RegExp("^/club/event/[^/]+$").test(
    pathname ?? ""
  );

  const items = [
    {
      id: "events",
      label: `${session?.user?.name ?? "Your"}'s Events`,
      href: "/club",
      icon: CalendarDays,
    },
    {
      id: "calendar",
      label: "Events Calendar",
      href: "/events",
      icon: CalendarDays,
    },
    {
      id: "profile",
      label: "Profile",
      href: "/club/profile",
      icon: User,
    },
  ];

  const activeId =
    items.find((item) => pathname?.startsWith(item.href))?.id ?? "events";

  return isEventDetailPage ? (
    <div className="min-h-screen w-full bg-neutral-900">{children}</div>
  ) : (
    <div className="flex min-h-screen w-full bg-neutral-900">
      <div className="sticky top-0 h-screen p-3">
        <PillSidebar
          items={items}
          activeId={activeId}
          collapsed={collapsed}
          onToggle={toggleCollapsed}
          logo={<Logo compact />}
          footer={
            <>
              <div className={collapsed ? "flex justify-center" : "px-1"}>
                <ThemeToggle />
              </div>
              <div
                className={cn(
                  "flex items-center gap-2",
                  collapsed && "justify-center"
                )}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage
                    src={session?.user?.image ?? ""}
                    alt={session?.user?.name ?? "User"}
                  />
                  <AvatarFallback>
                    {(session?.user?.name?.[0] ?? "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <span className="truncate text-sm font-medium text-white">
                    {session?.user?.name ?? "User"}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/home" })}
                className={cn(
                  "flex items-center gap-3 rounded-full px-3.5 py-2 text-sm text-neutral-400 transition-colors hover:bg-white/10 hover:text-white",
                  collapsed && "justify-center"
                )}
                title={collapsed ? "Logout" : undefined}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                {!collapsed && "Logout"}
              </button>
            </>
          }
        />
      </div>
      <div className="flex-1 bg-neutral-900">
        <ClubTopBar
          leftOffset={
            collapsed ? PILL_SIDEBAR_WIDTH.collapsed : PILL_SIDEBAR_WIDTH.expanded
          }
        />
        <div className="pt-[60px]">{children}</div>
      </div>
    </div>
  );
}

export const Logo = ({ compact = false }: { compact?: boolean }) => {
  const size = compact ? 28 : 50;
  return (
    <div className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal">
      <Image
        src="/logos/cie.png"
        alt="CIE Logo"
        width={size}
        height={size}
        className="object-contain"
      />
    </div>
  );
};
