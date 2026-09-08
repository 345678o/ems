"use client";

import * as React from "react";
import Link from "next/link";
import { X, Menu as MenuIcon, Handshake, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NAV_ITEMS } from "@/components/layout/UserSidebar";
import { ScribbleStar } from "@/components/ui/scribble";

interface ActionRow {
  label: string;
  icon: typeof Handshake;
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
          className="flex h-8 items-center gap-2 rounded-full border border-ink/15 bg-card px-4 text-xs font-semibold tracking-wide text-ink transition-colors hover:bg-paper-dim"
        >
          <MenuIcon className="h-3.5 w-3.5" />
          MENU
        </button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="inset-0 top-0 left-0 h-screen w-screen max-w-none translate-x-0 translate-y-0 gap-0 overflow-y-auto rounded-none border-0 bg-background p-0 sm:max-w-none"
      >
        <DialogTitle className="sr-only">Menu</DialogTitle>

        <div className="paper-grain relative mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-8 md:px-10 md:py-12">
          <div className="flex items-center justify-between">
            <span className="font-marker text-xl text-hotpink">
              Good vibes only <ScribbleStar className="-mt-1 inline h-3 w-3" />
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 bg-card text-ink transition-colors hover:bg-paper-dim"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={close}
                  className="group relative flex min-h-[130px] flex-col justify-between overflow-hidden rounded-2xl border border-ink/10 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-hotpink/40"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-paper">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-display text-lg leading-tight text-balance text-ink">
                    {item.label}
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
                className="flex items-center justify-between rounded-xl border border-ink/10 bg-card px-5 py-4 text-left shadow-sm transition-colors hover:bg-paper-dim"
              >
                <span className="flex items-center gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-hotpink text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-base font-semibold text-ink">
                    {label}
                  </span>
                </span>
                <span aria-hidden className="text-ink/40">
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
