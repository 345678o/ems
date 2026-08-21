"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

export const ClubTopBar = ({
  sidebarOpen = false,
}: {
  sidebarOpen?: boolean;
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [vw, setVw] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Left offset reacts to sidebar width on desktop, stays 0 on mobile
  const left = vw >= 768 ? (sidebarOpen ? 200 : 60) : 0; // matches DesktopSidebar widths

  return (
    <div
      className="fixed top-0 right-0 z-[60] ml-[140px] bg-blue-950 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-4"
      style={{ left }}
    >
      <div className="flex items-center justify-between">
        {/* Left side - Logos */}
        <div className="flex items-center gap-6">
          <Image
            src="/logos/iic.png"
            alt="IIC Logo"
            width={100}
            height={100}
            className="object-contain"
          />
        </div>
        {/* Center - Session user name */}
        <div className="flex-1 text-center pointer-events-none">
          <span className="font-medium text-white dark:text-neutral-200 truncate inline-block max-w-[50vw] text-4xl">
            {session?.user?.name ?? "User"}
          </span>
        </div>

        {/* Right side - User Info */}
        <div className="flex items-center gap-3">
          <Image
            src="/logos/mlrit.svg"
            alt="MLRIT Logo"
            width={100}
            height={100}
            className="object-contain"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full">
                <Avatar className="h-9 w-9 cursor-pointer hover:opacity-80 transition-opacity">
                  <AvatarImage
                    src={session?.user?.image ?? ""}
                    alt={session?.user?.name ?? "User"}
                  />
                  <AvatarFallback>
                    {(session?.user?.name?.[0] ?? "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session?.user?.name ?? "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email ?? ""}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    await signOut({ redirect: false });
                  } finally {
                    router.push("/home");
                  }
                }}
                className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
