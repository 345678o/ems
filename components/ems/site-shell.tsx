"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/ems/BrandMark";

const links = [
  { to: "/home", label: "Home", activeColor: "var(--clr-purple)" },
  { to: "/events", label: "Events", activeColor: "var(--clr-orange)" },
  { to: "/clubs", label: "Clubs", activeColor: "var(--clr-purple)" },
  { to: "/calendar", label: "Calendar", activeColor: "var(--clr-orange)" },
] as const;

export function SiteHeader({
  inverse = false,
  className = "",
}: {
  inverse?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const menuVideoRef = useRef<HTMLVideoElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
    document.body.style.overflow = "";
  }, [pathname]);

  useEffect(() => {
    const video = menuVideoRef.current;
    if (!video) return;
    if (open) {
      video.currentTime = 0;
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const mobileMenuClasses = [
    "site-mobile-menu fixed inset-0 z-40 transition-all duration-500 ease-out",
    open
      ? "translate-y-0 opacity-100 pointer-events-auto visible"
      : "-translate-y-full opacity-0 pointer-events-none invisible",
  ].join(" ");

  return (
    <>
      <header
        className={`site-header absolute inset-x-0 top-0 z-50 px-4 py-4 md:px-8 ${inverse ? "site-header--inverse" : "site-header--light"} ${className}`}
      >
        <div className="site-nav-shell mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 md:px-5">
          <Link href="/home" className="site-brand group flex min-w-0 items-center gap-2">
            <BrandMark pathname={pathname} />
            <span className="truncate">
              EMS<span style={{ color: "var(--clr-orange)" }}>.</span>MLRIT
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            {links.map((link) => {
              const isActive =
                link.to === "/home" ? pathname === "/home" : pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  href={link.to}
                  className="site-nav-link"
                  style={
                    isActive
                      ? {
                          background: link.activeColor,
                          color: "#E9ECEF",
                        }
                      : {}
                  }
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/register" className="site-sign-in hidden sm:inline-flex">
              Sign in <span aria-hidden="true">↗</span>
            </Link>
            <Button
              type="button"
              className="site-menu-button"
              variant="ghost"
              size="icon"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((current) => !current)}
            >
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </header>
      <div className={mobileMenuClasses} aria-hidden={!open}>
        <video
          ref={menuVideoRef}
          className="site-menu-video"
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source src="/ems/Scene.mp4" type="video/mp4" />
        </video>
        <div className="site-menu-video-overlay" aria-hidden="true" />
        <nav
          className="relative flex h-full flex-col justify-end gap-2 px-6 pb-16 md:px-16 md:pb-20"
          aria-label="Menu"
        >
          {links.map((link) => {
            const isActive =
              link.to === "/home" ? pathname === "/home" : pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                href={link.to}
                onClick={() => setOpen(false)}
                className="font-display font-semibold leading-none transition-colors duration-200"
                style={{
                  fontSize: "clamp(2.8rem,7vw,6rem)",
                  color: isActive ? link.activeColor : "var(--clr-white)",
                }}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/register"
            onClick={() => setOpen(false)}
            className="font-display font-semibold leading-none transition-colors duration-200"
            style={{ fontSize: "clamp(2.8rem,7vw,6rem)", color: "var(--clr-purple)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--clr-orange)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--clr-purple)")}
          >
            Sign in
          </Link>
        </nav>
      </div>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer
      className="page-gutter py-16 md:py-20"
      style={{ background: "var(--clr-black)", color: "var(--clr-white)" }}
    >
      <div className="mx-auto grid max-w-[1400px] gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="font-display text-4xl font-bold">
            EMS<span style={{ color: "var(--clr-orange)" }}>.</span>MLRIT
          </p>
          <p className="mt-4 max-w-sm" style={{ color: "rgba(233,236,239,0.6)" }}>
            Event Management System
            <br />
            MLR Institute of Technology
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-3 font-display text-2xl font-medium md:col-span-3">
          {[
            { to: "/events", label: "Events" },
            { to: "/clubs", label: "Clubs" },
            { to: "/calendar", label: "Calendar" },
            { to: "/register", label: "Sign in" },
          ].map(({ to, label }) => (
            <Link
              key={to}
              href={to}
              className="transition-colors duration-200"
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--clr-purple)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "")}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="md:col-span-4 md:col-start-9">
          <h3 className="font-display text-3xl font-semibold">Every idea needs a room.</h3>
          <p className="mt-4" style={{ color: "rgba(233,236,239,0.6)" }}>
            Find yours across the campus.
          </p>
          <Link
            href="/events"
            className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-display text-sm font-bold uppercase tracking-wide transition-all duration-300 hover:-translate-y-0.5"
            style={{ background: "var(--clr-purple)", color: "var(--clr-white)" }}
          >
            Browse events ↗
          </Link>
        </div>
      </div>
      <div
        className="mx-auto mt-14 flex max-w-[1400px] items-center justify-between border-t pt-8"
        style={{ borderColor: "rgba(233,236,239,0.1)" }}
      >
        <p className="meta" style={{ opacity: 0.35 }}>
          © {new Date().getFullYear()} MLRIT EMS
        </p>
        <p className="meta" style={{ color: "var(--clr-orange)", opacity: 0.7 }}>
          Campus Events, Reframed.
        </p>
      </div>
    </footer>
  );
}
