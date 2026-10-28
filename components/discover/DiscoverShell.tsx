"use client";

import type React from "react";
import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { Sidebar, type SidebarMode } from "./Sidebar";
import { EventSearch } from "./EventSearch";

// Sidebar preference, kept per browser. "auto" (no choice yet) collapses on
// tablet and expands from lg up.
const KEY = "dz-sidebar";
const listeners = new Set<() => void>();
const readMode = (): SidebarMode => {
  try {
    const v = localStorage.getItem(KEY);
    return v === "expanded" || v === "collapsed" ? v : "auto";
  } catch {
    return "auto";
  }
};
const writeMode = (m: SidebarMode) => {
  try {
    localStorage.setItem(KEY, m);
  } catch {
    // storage blocked: the choice just won't survive a reload
  }
  listeners.forEach((l) => l());
};
const subscribeMode = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

const LG = "(min-width: 1024px)";
const subscribeLg = (notify: () => void) => {
  const mq = window.matchMedia(LG);
  mq.addEventListener("change", notify);
  return () => mq.removeEventListener("change", notify);
};

/**
 * App frame for every public page. The left sidebar is the only navigation:
 * fixed and collapsible from md up, a slide-out drawer on phones. Search
 * opens in a dialog (sidebar button or ⌘K / Ctrl+K).
 * The `dark` class makes shadcn components (calendar etc.) use dark tokens.
 */
export function DiscoverShell({
  children,
  bare,
}: {
  children: React.ReactNode;
  /** Regex source; matching paths render full-screen without the sidebar
   * (e.g. a workspace with its own section navigation). */
  bare?: string;
}) {
  const mode = useSyncExternalStore<SidebarMode>(
    subscribeMode,
    readMode,
    () => "auto"
  );
  const isLg = useSyncExternalStore(
    subscribeLg,
    () => window.matchMedia(LG).matches,
    () => false
  );
  const expanded = mode === "expanded" || (mode === "auto" && isLg);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // Dialogs portal into the shell so they keep the dz theme and font.
  const [shell, setShell] = useState<HTMLDivElement | null>(null);
  const pathname = usePathname();

  // Close the drawer when a navigation lands.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setDrawerOpen(false);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const openSearch = () => {
    setDrawerOpen(false);
    setSearchOpen(true);
  };

  if (bare && new RegExp(bare).test(pathname)) {
    return <div className="dz dark">{children}</div>;
  }

  return (
    <div ref={setShell} data-sb={mode} className="dz dark dz-shell">
      {/* useSearchParams in the sidebar needs a Suspense boundary. */}
      <Suspense>
        <Sidebar
          mode={mode}
          expanded={expanded}
          onToggle={() => writeMode(expanded ? "collapsed" : "expanded")}
          onSearch={openSearch}
          className="fixed inset-y-0 left-0 z-40 max-md:hidden"
        />

        {/* Phones: one menu button opens the same sidebar as a drawer. */}
        <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
          <Dialog.Trigger
            aria-label="Open navigation"
            className="dz-icon-btn fixed left-3 top-3 z-40 border border-[var(--dz-border)] bg-[var(--dz-surface-1)] text-white md:hidden"
          >
            <Menu className="size-5" aria-hidden />
          </Dialog.Trigger>
          <Dialog.Portal container={shell}>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 md:hidden" />
            <Dialog.Content
              aria-describedby={undefined}
              className="fixed inset-y-0 left-0 z-50 md:hidden"
            >
              <Dialog.Title className="sr-only">Navigation</Dialog.Title>
              <Sidebar
                mode="expanded"
                expanded
                onSearch={openSearch}
                onNavigate={() => setDrawerOpen(false)}
                className="max-w-[85vw]"
              />
              <Dialog.Close
                aria-label="Close navigation"
                className="dz-icon-btn absolute right-2 top-3"
              >
                <X className="size-5" aria-hidden />
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </Suspense>

      <Dialog.Root open={searchOpen} onOpenChange={setSearchOpen}>
        <Dialog.Portal container={shell}>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
          <Dialog.Content
            aria-describedby={undefined}
            className="dz-glass fixed left-1/2 top-[12vh] z-50 w-[calc(100%-32px)] max-w-lg -translate-x-1/2 rounded-2xl p-3"
          >
            <Dialog.Title className="sr-only">Search events</Dialog.Title>
            <EventSearch onNavigate={() => setSearchOpen(false)} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <main className="min-w-0 transition-[padding] duration-200 md:pl-[var(--sb-w)]">
        <div className="mx-auto w-full max-w-page px-4 pb-12 pt-16 md:px-8 md:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
