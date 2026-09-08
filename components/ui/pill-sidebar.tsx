"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScribbleStar } from "@/components/ui/scribble";

export interface PillSidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  onClick?: () => void;
}

interface PillSidebarProps {
  items: PillSidebarItem[];
  activeId: string;
  logo: React.ReactNode;
  footer?: React.ReactNode;
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}

/** Collapsed / expanded pixel widths — keep in sync with any manual offsets elsewhere. */
export const PILL_SIDEBAR_WIDTH = { collapsed: 88, expanded: 248 } as const;

export function useSidebarCollapsed(storageKey: string, defaultValue = false) {
  const [collapsed, setCollapsed] = React.useState(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = window.localStorage.getItem(storageKey);
      return stored !== null ? stored === "1" : defaultValue;
    } catch {
      // localStorage unavailable (e.g. private mode) — fall back to default
      return defaultValue;
    }
  });

  const toggle = React.useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(storageKey, next ? "1" : "0");
      } catch {
        // ignore storage write failures
      }
      return next;
    });
  }, [storageKey]);

  return [collapsed, toggle] as const;
}

export function PillSidebar({
  items,
  activeId,
  logo,
  footer,
  collapsed,
  onToggle,
  className,
}: PillSidebarProps) {
  return (
    <div
      className={cn(
        "flex h-full shrink-0 flex-col items-center py-5 transition-[width] duration-300 ease-out",
        collapsed ? "w-[88px]" : "w-[248px]",
        className
      )}
    >
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[28px] border border-sidebar-foreground/10 bg-sidebar px-3 py-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
        {/* ambient brand glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-4 top-0 h-32 rounded-full bg-hotpink/20 blur-2xl"
        />

        <div className="relative flex items-center justify-between">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sidebar-foreground/5 ring-1 ring-sidebar-foreground/10">
            {logo}
          </div>
          {!collapsed && (
            <button
              type="button"
              onClick={onToggle}
              aria-label="Collapse sidebar"
              className="grid h-8 w-8 place-items-center rounded-full bg-sidebar-foreground/10 text-sidebar-foreground transition-colors hover:bg-sidebar-foreground/20"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {!collapsed && (
          <p className="font-marker relative mt-2 pl-1 text-lg leading-none text-hotpink">
            Good vibes only <ScribbleStar className="ml-0.5 -mt-1 inline h-3 w-3" />
          </p>
        )}

        {collapsed && (
          <button
            type="button"
            onClick={onToggle}
            aria-label="Expand sidebar"
            className="relative mt-3 grid h-8 w-8 place-self-center place-items-center rounded-full bg-sidebar-foreground/10 text-sidebar-foreground transition-colors hover:bg-sidebar-foreground/20"
          >
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </button>
        )}

        <nav className="relative mt-6 flex flex-1 flex-col gap-1.5 overflow-y-auto">
          {items.map((item) => {
            const isActive = item.id === activeId;
            const Icon = item.icon;
            const content = (
              <>
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive
                      ? "text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70"
                  )}
                />
                {!collapsed && (
                  <span
                    className={cn(
                      "truncate text-sm font-medium",
                      isActive
                        ? "text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70"
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </>
            );
            const itemClassName = cn(
              "flex items-center gap-3 rounded-full px-3.5 py-2.5 transition-colors",
              collapsed ? "justify-center" : "justify-start",
              isActive
                ? "bg-sidebar-accent shadow-sm"
                : "hover:bg-sidebar-foreground/10"
            );

            return item.href ? (
              <Link
                key={item.id}
                href={item.href}
                onClick={item.onClick}
                className={itemClassName}
                title={collapsed ? item.label : undefined}
              >
                {content}
              </Link>
            ) : (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className={itemClassName}
                title={collapsed ? item.label : undefined}
              >
                {content}
              </button>
            );
          })}
        </nav>

        {footer && (
          <div className="relative mt-auto flex flex-col gap-2 pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default PillSidebar;
