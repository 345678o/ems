"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  PermanentSidebar,
  PermanentSidebarLink,
} from "@/components/ui/permanent-sidebar";
import { ClubTopBar } from "@/components/ui/club-topbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSession } from "next-auth/react";
import { CalendarDays, User } from "lucide-react";
import Image from "next/image";

export default function ClubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  // Only hide the shared sidebar on the event detail page: /club/event/[id]
  // This will NOT hide it on other subroutes like /club/event/create
  const isEventDetailPage = new RegExp("^/club/event/[^/]+$").test(
    pathname ?? ""
  );

  const links = [
    {
      label: `${session?.user?.name}'s Events`,
      href: "/club",
      icon: (
        <CalendarDays className="h-5 w-5 shrink-0 dark:text-neutral-200 text-neutral-600" />
      ),
      id: "events",
    },
    {
      label: "Profile",
      href: "/club/profile",
      icon: (
        <User className="h-5 w-5 shrink-0 dark:text-neutral-200 text-neutral-600" />
      ),
      id: "profile",
    },
  ];

  return isEventDetailPage ? (
    <div className="min-h-screen w-full bg-neutral-900">{children}</div>
  ) : (
    <div className="flex min-h-screen w-full bg-neutral-900">
      <div className="sticky top-0 h-screen">
        <PermanentSidebar className="justify-between gap-10 dark:bg-neutral-900 dark:border-r dark:border-neutral-800 bg-white h-full">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <Logo />
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link) => (
                <PermanentSidebarLink key={link.id} link={link} />
              ))}
            </div>
          </div>
          <div className="flex flex-col items-start align-middle gap-2">
            <div className="-ml-1">
              <ThemeToggle />
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={session?.user?.image ?? ""}
                  alt={session?.user?.name ?? "User"}
                />
                <AvatarFallback>
                  {(session?.user?.name?.[0] ?? "U").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium whitespace-pre dark:text-white text-neutral-800">
                {session?.user?.name ?? "User"}
              </span>
            </div>
          </div>
        </PermanentSidebar>
      </div>
      <div className="flex-1 bg-neutral-900">
        <ClubTopBar />
        <div className="pt-[60px]">{children}</div>
      </div>
    </div>
  );
}

export const Logo = () => {
  return (
    <div className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal">
      <Image
        src="/logos/cie.png"
        alt="CIE Logo"
        width={50}
        height={50}
        className="object-contain"
      />
    </div>
  );
};
