"use client";

import type React from "react";
import { Sidebar } from "./Sidebar";
import { TopNavigation } from "./TopNavigation";

/**
 * App frame for every public page: icon rail on the left (desktop only) and
 * a main column with the sticky top navigation above the page content.
 * The `dark` class makes shadcn components (calendar etc.) use dark tokens.
 */
export function DiscoverShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="dz dark">
      <div className="mx-auto grid w-full max-w-page grid-cols-1 gap-x-6 px-4 md:px-6 lg:grid-cols-[48px_minmax(0,1fr)] lg:px-8">
        <Sidebar />
        <div className="min-w-0 pb-12">
          <TopNavigation />
          <div className="pt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
