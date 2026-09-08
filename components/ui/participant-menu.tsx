"use client";

import * as React from "react";
import Link from "next/link";
import { Anton } from "next/font/google";
import {
  X,
  Menu as MenuIcon,
  Handshake,
  LogOut,
  Compass,
  CalendarDays,
  Ticket,
  Award,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const anton = Anton({ weight: "400", subsets: ["latin"] });

interface NavCard {
  label: string;
  href: string;
  icon: LucideIcon;
}

const NAV_CARDS: NavCard[] = [
  { label: "Browse Events", href: "/home", icon: Compass },
  { label: "Events Calendar", href: "/events", icon: CalendarDays },
  { label: "My Bookings", href: "/user/profile?tab=my-bookings", icon: Ticket },
  { label: "Certificates", href: "/user/profile?tab=certificates", icon: Award },
  { label: "My Profile", href: "/user/profile?tab=profile", icon: UserRound },
  { label: "Club Directory", href: "/home#clubs", icon: Users },
];

interface ActionRow {
  label: string;
  icon: LucideIcon;
  onSelect: (close: () => void) => void;
}

export function ParticipantMenu() {
  const [open, setOpen] = React.useState(false);
  const close = React.useCallback(() => setOpen(false), []);

  const actionRows: ActionRow[] = [
    {
      label: "Become an Organizer",
      icon: Handshake,
      onSelect: (done) => {
        done();
        window.location.href = "/user/profile?tab=partner";
      },
    },
    {
      label: "Sign Out",
      icon: LogOut,
      onSelect: (done) => {
        done();
        signOut({ callbackUrl: "/" });
      },
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex h-8 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-xs font-semibold tracking-wide text-white transition-colors hover:bg-white/10"
        >
          <MenuIcon className="h-3.5 w-3.5" />
          MENU
        </button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="inset-0 top-0 left-0 h-screen w-screen max-w-none translate-x-0 translate-y-0 gap-0 overflow-y-auto rounded-none border-0 bg-[#141414] p-0 sm:max-w-none"
      >
        <DialogTitle className="sr-only">Menu</DialogTitle>

        {/* ambient brand glow */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 h-[420px] opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(55% 55% at 15% 10%, #7B2FE5 0%, transparent 70%), radial-gradient(45% 45% at 90% 0%, #D96CE5 0%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-8 md:px-10 md:py-12">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-[0.2em] text-neutral-500">
              CLOSE
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white transition-colors hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {NAV_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.label}
                  href={card.href}
                  onClick={close}
                  className="group relative flex min-h-[130px] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:-translate-y-0.5 hover:border-[#D96CE5]/40 hover:bg-white/[0.06]"
                >
                  {/* corner glow on hover */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-[#FF8AC9] to-[#7B2FE5] opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-30"
                  />
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#FF8AC9] via-[#D96CE5] to-[#7B2FE5] text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span
                    className={cn(
                      anton.className,
                      "text-lg leading-tight tracking-wide text-white text-balance"
                    )}
                  >
                    {card.label}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="flex flex-col gap-3">
            {actionRows.map(({ label, icon: Icon, onSelect }) => (
              <button
                key={label}
                type="button"
                onClick={() => onSelect(close)}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-left transition-colors hover:bg-white/[0.07]"
              >
                <span className="flex items-center gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#FF8AC9] via-[#D96CE5] to-[#7B2FE5] text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-base font-semibold text-white">
                    {label}
                  </span>
                </span>
                <span aria-hidden className="text-neutral-500">
                  &rsaquo;
                </span>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ParticipantMenu;
