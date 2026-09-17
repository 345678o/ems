"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/ui/footer";

const SHOWCASE_PREFIXES = ["/home", "/events", "/clubs", "/register", "/calendar"];

/**
 * The (showcase) route group renders its own SiteFooter (see
 * components/ems/site-shell.tsx) — skip the old global footer there so
 * pages don't end up with two stacked footers.
 */
export default function ConditionalFooter() {
  const pathname = usePathname();
  const inShowcase = SHOWCASE_PREFIXES.some((p) => pathname.startsWith(p));
  if (inShowcase) return null;
  return <Footer />;
}
