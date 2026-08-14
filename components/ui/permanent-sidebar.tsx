"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

export const PermanentSidebar = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "h-full px-4 py-4 flex flex-col bg-neutral-100 dark:bg-neutral-800 w-[200px] shrink-0",
        className
      )}
    >
      {children}
    </div>
  );
};

export const PermanentSidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) => {
  return (
    <a
      href={link.href}
      data-sidebar-link
      className={cn(
        "flex items-center justify-start gap-2 group/sidebar py-2",
        className
      )}
      {...props}
    >
      {link.icon}
      <span className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block">
        {link.label}
      </span>
    </a>
  );
};
