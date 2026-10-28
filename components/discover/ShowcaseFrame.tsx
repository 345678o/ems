import type React from "react";
import { Inter } from "next/font/google";
import "@/components/discover/discover.css";
import { DiscoverShell } from "@/components/discover/DiscoverShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-dz" });

/**
 * Dark app frame (sidebar + content) shared by every student-facing route
 * group: the public showcase pages and the signed-in pages (dashboard,
 * notifications, profile).
 */
export function ShowcaseFrame({
  children,
  bare,
}: {
  children: React.ReactNode;
  /** Regex source for paths shown without the sidebar (see DiscoverShell). */
  bare?: string;
}) {
  return (
    <div className={inter.variable}>
      <DiscoverShell bare={bare}>{children}</DiscoverShell>
    </div>
  );
}
