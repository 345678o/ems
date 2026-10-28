import type React from "react";
import Link from "next/link";
import { Inter } from "next/font/google";
import "@/components/discover/discover.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-dz" });

export const metadata = {
  title: "Sign in — EMS.MLRIT",
  description: "Sign in or create your EMS.MLRIT account.",
};

/**
 * Standalone frame for sign-in / sign-up: the same dark theme as the app,
 * but no sidebar or app navigation before authentication. Content is
 * centred and sits near the top of the viewport.
 */
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={`${inter.variable} dz dark`}>
      <div className="mx-auto w-full max-w-[1200px] px-4 pb-12 pt-[6vh] md:px-8">
        {/* Brand only — links back to the landing page, no app navigation. */}
        <header className="mb-6">
          <Link
            href="/"
            aria-label="EMS.MLRIT home"
            className="inline-flex items-center gap-2.5 rounded-lg text-[15px] font-semibold tracking-tight"
          >
            <span
              aria-hidden
              className="grid size-8 place-items-center rounded-lg bg-[rgba(255,117,71,0.14)] ring-1 ring-[rgba(255,117,71,0.3)]"
            >
              <span className="size-2.5 rounded-full bg-[var(--dz-accent)]" />
            </span>
            <span>
              EMS<span className="text-faint">.MLRIT</span>
            </span>
          </Link>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
