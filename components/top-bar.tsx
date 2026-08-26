// TopBar.tsx
"use client";

import React, { useState } from "react";
import {
  Search,
  Inbox,
  MoveRight,
  Calendar,
  Users,
  ArrowLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "./theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "next-auth/react";
import { GradientButton } from "@/components/ui/gradient-button";
import { LoginDialog } from "@/components/ui/login-dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";

const clubLinks = [
  "APEX",
  "AREO",
  "CAME",
  "CIE",
  "CODE",
  "EWB",
  "LIT",
  "MUN",
  "NSS",
  "SCOPE",
];

export function TopBar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [clubsOpen, setClubsOpen] = useState(false);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/home");
    }
  };

  return (
    <div className="w-full fixed top-0 left-0 right-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-background/80 dark:supports-[backdrop-filter]:bg-background/40 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 py-4">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            title="Go back"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Link href="/home" className="h-8 w-16 rounded-sm bg-primary/80 dark:bg-white/20 block" />

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/events"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent"
            >
              <Calendar className="h-4 w-4" />
              Events
            </Link>
            <div
              className="group relative"
              onMouseLeave={() => setClubsOpen(false)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setClubsOpen(false);
                }
              }}
            >
              <button
                type="button"
                onClick={() => setClubsOpen((open) => !open)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-haspopup="true"
                aria-expanded={clubsOpen}
              >
                <Users className="h-4 w-4" />
                Clubs
              </button>
              <div className={`invisible absolute left-0 top-full z-50 w-56 translate-y-2 rounded-xl border border-border bg-background p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 ${clubsOpen ? "visible translate-y-0 opacity-100" : ""}`}>
                <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Browse clubs
                </p>
                <div className="max-h-56 overflow-y-auto pr-1">
                  {clubLinks.map((clubName) => (
                    <Link
                      key={clubName}
                      href={`/clubs/view/${clubName.toLowerCase()}`}
                      className="block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                    >
                      {clubName}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          <div className="flex-1">
            <div className="relative mx-auto max-w-2xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search for events..."
                className="h-10 w-full rounded-full bg-white/90 pl-9 pr-4 text-sm dark:border-gray-700 dark:bg-gray-800/90 focus-visible:ring-primary/40"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {session && (
              <div className="relative grid h-9 w-9 place-items-center rounded-full transition hover:bg-gray-100 dark:hover:bg-white/5">
                <Inbox className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <span className="absolute -right-[2px] -top-[2px] h-2.5 w-2.5 rounded-full bg-orange-400 ring-2 ring-white dark:ring-gray-900" />
              </div>
            )}

            {session ? (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger>
                  <Avatar>
                    <AvatarImage
                      src={session.user?.image ?? ""}
                      alt={session.user?.name ?? ""}
                    />
                    <AvatarFallback>{session.user?.name?.[0]}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <a href="/user/profile">
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                  </a>
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
                <GradientButton type="button" style={{ maxWidth: "240px" }}>
                  <span className="flex items-center">
                    Login
                    <MoveRight className="ml-1 h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-2" />
                  </span>
                </GradientButton>
              </LoginDialog>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopBar;
