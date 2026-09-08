"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Anton } from "next/font/google";
import { Search, MapPin, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GradientButton } from "@/components/ui/gradient-button";
import { LoginDialog } from "@/components/ui/login-dialog";
import { ParticipantMenu } from "@/components/ui/participant-menu";
import { cn } from "@/lib/utils";

const anton = Anton({ weight: "400", subsets: ["latin"] });

/** Height (px) of HomeTopBar's content row — keep in sync with UserAppShell's sidebar offset. */
export const HOME_TOPBAR_HEIGHT = 64;

const CATEGORIES: { label: string; href: string }[] = [
  { label: "Events", href: "/events" },
  { label: "Clubs", href: "/clubs" },
  { label: "Fests", href: "/events" },
  { label: "Workshops", href: "/events" },
  { label: "Hackathons", href: "/events" },
  { label: "Sports", href: "/events" },
];

/** Full-width top strip: logo, search, campus pill, auth. Sits above sidebar + content. */
export function HomeTopBar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/events?q=${encodeURIComponent(q)}` : "/events");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#141414]/90 backdrop-blur-xl">
      {/* signature gradient hairline (overlay, doesn't add to row height) */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#FF8AC9] via-[#D96CE5] to-[#7B2FE5]" />

      <div
        className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 md:px-8"
        style={{ height: HOME_TOPBAR_HEIGHT }}
      >
        {/* Wordmark */}
        <Link href="/home" className="flex shrink-0 items-center gap-2">
          <img src="/logos/iic.svg" alt="" className="h-8 w-8" />
          <span
            className={cn(
              anton.className,
              "hidden text-xl tracking-wide text-white sm:inline"
            )}
          >
            IIC<span className="text-[#D96CE5]">.</span>MLRIT
          </span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="min-w-0 flex-1">
          <div className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 transition-colors focus-within:border-[#D96CE5]/60 focus-within:bg-white/[0.07]">
            <Search className="h-4 w-4 shrink-0 text-neutral-500 transition-colors group-focus-within:text-[#D96CE5]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search fests, workshops, clubs…"
              className="w-full min-w-0 bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none"
            />
          </div>
        </form>

        {/* Campus pill */}
        <div className="hidden shrink-0 items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-sm text-neutral-300 lg:flex">
          <MapPin className="h-3.5 w-3.5 text-[#D96CE5]" />
          MLRIT Campus
          <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
        </div>

        {/* Auth */}
        <div className="flex shrink-0 items-center gap-3">
          {session ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger>
                <Avatar className="h-9 w-9 ring-2 ring-white/10">
                  <AvatarImage
                    src={session.user?.image ?? ""}
                    alt={session.user?.name ?? ""}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-[#D96CE5] to-[#7B2FE5] text-white">
                    {session.user?.name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="end">
                <Link href="/user/profile">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-500 hover:text-red-600"
                  onClick={() => signOut()}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <LoginDialog>
              <GradientButton type="button">Sign In</GradientButton>
            </LoginDialog>
          )}
          <div className="md:hidden">
            <ParticipantMenu />
          </div>
        </div>
      </div>
    </header>
  );
}

/** Secondary category chip row — rendered inside the content column, next to the sidebar. */
export function HomeCategoryNav({ activeCategory }: { activeCategory?: string }) {
  return (
    <nav
      className="scrollbar-none sticky z-40 flex gap-1 overflow-x-auto border-b border-white/10 bg-[#141414]/90 px-4 py-3 backdrop-blur-xl md:px-8"
      style={{ top: HOME_TOPBAR_HEIGHT }}
    >
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.label;
        return (
          <Link
            key={cat.label}
            href={cat.href}
            className={cn(
              "relative shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-white/10 text-white"
                : "text-neutral-400 hover:text-white"
            )}
          >
            {cat.label}
            {isActive && (
              <span className="absolute inset-x-3 -bottom-[7px] h-[2px] bg-gradient-to-r from-[#FF8AC9] to-[#7B2FE5]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
