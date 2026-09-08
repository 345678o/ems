"use client";

import * as React from "react";
import { UserSidebar } from "@/components/layout/UserSidebar";
import {
  PILL_SIDEBAR_WIDTH,
  useSidebarCollapsed,
} from "@/components/ui/pill-sidebar";

/** Shared shell: persistent pill sidebar (desktop) for every general user-facing page. */
export function UserAppShell({
  topBar,
  topBarHeight = 0,
  children,
}: {
  /** Optional full-width bar rendered above the sidebar + content row. */
  topBar?: React.ReactNode;
  /** Height (px) of `topBar`, so the sidebar can offset itself below it. */
  topBarHeight?: number;
  children: React.ReactNode;
}) {
  const [collapsed, toggle] = useSidebarCollapsed("user-sidebar-collapsed");

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#141414]">
      {topBar}
      <div className="flex flex-1">
        <div
          className="sticky hidden shrink-0 p-3 md:block"
          style={{
            top: topBarHeight,
            height: `calc(100vh - ${topBarHeight}px)`,
          }}
        >
          <UserSidebar collapsed={collapsed} onToggle={toggle} />
        </div>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

export { PILL_SIDEBAR_WIDTH };
export default UserAppShell;
