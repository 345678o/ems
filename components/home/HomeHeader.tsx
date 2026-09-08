"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useSession, signOut } from "next-auth/react";
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
import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/components/ui/login-dialog";
import { ParticipantMenu } from "@/components/ui/participant-menu";
import { cn } from "@/lib/utils";

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
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-background/95 backdrop-blur-xl">
      <div
        className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 md:px-8"
        style={{ height: HOME_TOPBAR_HEIGHT }}
      >
        {/* Wordmark */}
        <Link href="/home" className="flex shrink-0 items-center gap-2">
          <img src="/logos/iic.svg" alt="" className="h-7 w-7" />
          <span className="font-display hidden text-lg tracking-tight text-ink sm:inline">
            IIC<span className="text-hotpink">.</span>MLRIT
          </span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="min-w-0 flex-1">
          <div className="group flex items-center gap-2 rounded-full border border-ink/10 bg-card px-4 py-2 transition-colors focus-within:border-hotpink/50">
            <Search className="h-4 w-4 shrink-0 text-ink/40 transition-colors group-focus-within:text-hotpink" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search fests, workshops, clubs…"
              className="w-full min-w-0 bg-transparent text-sm text-ink placeholder:text-ink/40 focus:outline-none"
            />
          </div>
        </form>

        {/* Campus pill */}
        <div className="hidden shrink-0 items-center gap-1 rounded-full border border-ink/10 px-3 py-1.5 text-sm text-ink/70 lg:flex">
          <MapPin className="h-3.5 w-3.5 text-hotpink" />
          MLRIT Campus
          <ChevronDown className="h-3.5 w-3.5 text-ink/40" />
        </div>

        {/* Auth */}
        <div className="flex shrink-0 items-center gap-3">
          {session ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger>
                <Avatar className="h-9 w-9 ring-2 ring-ink/10">
                  <AvatarImage
                    src={session.user?.image ?? ""}
                    alt={session.user?.name ?? ""}
                  />
                  <AvatarFallback className="bg-ink font-display text-paper">
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
              <Button type="button" className="rounded-full">
                Sign In
              </Button>
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
export function HomeCategoryNav({
  activeCategory,
}: {
  activeCategory?: string;
}) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/events?q=${encodeURIComponent(q)}` : "/events");
  };

  return (
    <nav
      className="sticky z-40 flex items-center gap-2 border-b border-ink/10 bg-background/95 px-4 py-2.5 backdrop-blur-xl md:px-8"
      style={{ top: HOME_TOPBAR_HEIGHT }}
    >
      <div className="scrollbar-none flex min-w-0 flex-1 gap-1 overflow-x-auto">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.label;
          return (
            <Link
              key={cat.label}
              href={cat.href}
              className="relative shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
            >
              {isActive && (
                <motion.span
                  layoutId="home-category-pill"
                  className="absolute inset-0 rounded-full bg-ink"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              <span
                className={cn(
                  "relative z-10",
                  isActive ? "text-paper" : "text-ink/55 hover:text-ink"
                )}
              >
                {cat.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Compact search toggle — the primary search box lives in HomeTopBar;
          this is the brief's "small search icon/button on the right" for
          quickly filtering within the current category row. */}
      <div className="relative shrink-0">
        {searchOpen ? (
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-1.5 rounded-full border border-ink/15 bg-card py-1 pl-3 pr-1"
          >
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => !query && setSearchOpen(false)}
              placeholder="Search…"
              className="w-32 bg-transparent text-sm text-ink placeholder:text-ink/40 focus:outline-none sm:w-40"
            />
            <button
              type="submit"
              aria-label="Search"
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink text-paper"
            >
              <Search className="h-3 w-3" />
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="grid h-8 w-8 place-items-center rounded-full text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <Search className="h-4 w-4" />
          </button>
        )}
      </div>
    </nav>
  );
}
