"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, Search, UserRound } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

const LINKS = [
  { label: "Home", href: "/discover" },
  { label: "Events", href: "/events" },
  { label: "Clubs", href: "/clubs" },
  { label: "Calendar", href: "/calendar" },
  { label: "Workshops", href: "/events?q=workshop" },
];

export function TopNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the profile menu on outside click / Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const name = session?.user?.name ?? "Guest";
  const handle = session?.user?.email ?? "Sign in";
  const avatar = session?.user?.image;

  const isActive = (href: string) =>
    !href.includes("?") && pathname.startsWith(href);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/events?q=${encodeURIComponent(q)}` : "/events");
  };

  const profileInner = (
    <>
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt="" className="size-8 rounded-full object-cover" />
      ) : (
        <span className="grid size-8 place-items-center rounded-full bg-[var(--dz-accent)] text-sm font-semibold text-[#1a0d06]">
          {name[0]?.toUpperCase()}
        </span>
      )}
      <span className="hidden min-w-0 text-left leading-tight sm:block">
        <span className="block max-w-[120px] truncate text-ui font-medium">
          {name}
        </span>
        <span className="block max-w-[120px] truncate text-xs text-zinc-400">
          {handle}
        </span>
      </span>
      <ChevronDown
        className="hidden size-4 text-zinc-400 sm:block"
        aria-hidden
      />
    </>
  );
  const profileClass =
    "flex h-10 items-center gap-2.5 rounded-lg pl-1 pr-2 transition-colors hover:bg-white/5";

  return (
    <header className="sticky top-0 z-40 -mx-4 border-b border-[var(--dz-border)] bg-[rgba(11,11,13,0.82)] px-4 backdrop-blur-md md:-mx-6 md:px-6 lg:mx-0 lg:px-0">
      <div className="flex h-16 items-center gap-4">
        <Link
          href="/discover"
          className="flex shrink-0 items-center gap-2 text-[15px] font-semibold tracking-tight"
        >
          <span
            aria-hidden
            className="size-2.5 rounded-full bg-[var(--dz-accent)]"
          />
          <span>
            EMS<span className="text-faint">.MLRIT</span>
          </span>
        </Link>

        <nav
          aria-label="Sections"
          className="ml-4 hidden items-center gap-1 xl:flex"
        >
          {LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`flex h-8 items-center rounded-md px-3 text-sm transition-colors ${
                isActive(l.href)
                  ? "bg-white/[0.08] font-medium text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <form
            role="search"
            onSubmit={submitSearch}
            className="dz-input hidden w-64 items-center gap-2 px-3 text-faint md:flex"
          >
            <Search
              className="size-4 shrink-0"
              strokeWidth={1.75}
              aria-hidden
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events"
              aria-label="Search events"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-faint"
            />
          </form>

          <button
            type="button"
            aria-label="Notifications"
            className="dz-icon-btn relative"
          >
            <Bell className="size-[18px]" strokeWidth={1.75} />
            <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-[var(--dz-accent)] ring-2 ring-[var(--dz-bg)]" />
          </button>

          {session ? (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
                className={profileClass}
              >
                {profileInner}
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  className="dz-glass absolute right-0 top-12 z-50 w-48 rounded-xl p-1 text-sm"
                >
                  <Link
                    role="menuitem"
                    href="/user/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex h-9 items-center gap-2 rounded-lg px-3 hover:bg-white/[0.06]"
                  >
                    <UserRound className="size-4" aria-hidden />
                    Profile
                  </Link>
                  <button
                    role="menuitem"
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/discover" })}
                    className="flex h-9 w-full items-center gap-2 rounded-lg px-3 hover:bg-white/[0.06]"
                  >
                    <LogOut className="size-4" aria-hidden />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/register" className={profileClass}>
              {profileInner}
            </Link>
          )}
        </div>
      </div>

      {/* Below xl: section links (and search on phones) get their own rows */}
      <div className="flex flex-col gap-2 pb-3 xl:hidden">
        <form
          role="search"
          onSubmit={submitSearch}
          className="dz-input flex items-center gap-2 px-3 text-faint md:hidden"
        >
          <Search className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events"
            aria-label="Search events"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-faint"
          />
        </form>
        <nav
          aria-label="Sections"
          className="dz-scroll -mx-1 flex gap-1 overflow-x-auto px-1 [mask-image:linear-gradient(to_right,#000_calc(100%-32px),transparent)]"
        >
          {LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`flex h-10 shrink-0 items-center rounded-md px-3 text-sm transition-colors ${
                isActive(l.href)
                  ? "bg-white/[0.08] font-medium text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
