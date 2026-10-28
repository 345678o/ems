"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/ui/footer";

// Routes in the dark app frame (ShowcaseFrame) — they have no global footer.
const SHOWCASE_PREFIXES = [
  "/home",
  "/events",
  "/clubs",
  "/register",
  "/calendar",
  "/discover",
  "/bookings",
  "/dashboard",
  "/notifications",
  "/user/profile",
];

/**
 * The (showcase) route group renders its own SiteFooter (see
 * components/ems/site-shell.tsx) and /discover is a full-screen app window — skip the old global footer there so
 * pages don't end up with two stacked footers.
 */
export default function ConditionalFooter() {
  const pathname = usePathname();
  // "/" is the landing page, which renders its own footer.
  const inShowcase =
    pathname === "/" || SHOWCASE_PREFIXES.some((p) => pathname.startsWith(p));
  if (inShowcase) return null;
  return <Footer />;
}
