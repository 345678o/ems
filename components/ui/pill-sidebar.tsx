"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScribbleStar } from "@/components/ui/scribble";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

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
export const PILL_SIDEBAR_WIDTH = { collapsed: 76, expanded: 224 } as const;

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
        collapsed ? "w-[76px]" : "w-[224px]",
        className
      )}
    >
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[24px] bg-sidebar px-2.5 py-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
        {/* ambient brand glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-4 top-0 h-32 rounded-full bg-hotpink/20 blur-2xl"
        />

        <div className="relative flex items-center justify-between">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sidebar-foreground/5 ring-1 ring-sidebar-foreground/10">
            {logo}
          </div>
          {!collapsed && (
            <button
              type="button"
              onClick={onToggle}
              aria-label="Collapse sidebar"
              className="grid h-7 w-7 place-items-center rounded-full bg-sidebar-foreground/10 text-sidebar-foreground transition-all duration-150 hover:scale-105 hover:bg-sidebar-foreground/20"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {!collapsed && (
          <p className="font-marker relative mt-2 pl-1 text-lg leading-none text-hotpink">
            Good vibes only{" "}
            <ScribbleStar className="ml-0.5 -mt-1 inline h-3 w-3" />
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

        <nav className="relative mt-6 flex flex-1 flex-col gap-1 overflow-y-auto">
          {items.map((item) => {
            const isActive = item.id === activeId;
            const Icon = item.icon;
            const content = (
              <>
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 rounded-full bg-sidebar-accent shadow-sm"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <Icon
                  className={cn(
                    "relative z-10 h-[18px] w-[18px] shrink-0 transition-colors",
                    isActive
                      ? "text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/65 group-hover:text-sidebar-foreground"
                  )}
                />
                {!collapsed && (
                  <span
                    className={cn(
                      "relative z-10 truncate text-sm font-medium transition-colors",
                      isActive
                        ? "text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/65 group-hover:text-sidebar-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </>
            );
            const itemClassName = cn(
              "group relative flex items-center gap-3 rounded-full px-3.5 py-2.5 transition-colors duration-150",
              collapsed ? "justify-center" : "justify-start",
              !isActive && "hover:bg-sidebar-foreground/10"
            );

            const el = item.href ? (
              <Link
                href={item.href}
                onClick={item.onClick}
                className={itemClassName}
              >
                {content}
              </Link>
            ) : (
              <button
                type="button"
                onClick={item.onClick}
                className={itemClassName}
              >
                {content}
              </button>
            );

            return (
              <Tooltip key={item.id} delayDuration={300}>
                <TooltipTrigger asChild>{el}</TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
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
