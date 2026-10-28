/**
 * Smoke test for app/page.tsx (the public landing page).
 *
 * app/page.tsx is an async Server Component. It loads the session and a few
 * counts from Supabase; both are mocked here. We check that it renders the
 * hero without redirecting, and that a database failure hides the stats
 * instead of showing made-up numbers.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

// ── Hoist mocks before any imports ───────────────────────────────────────────
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn() })),
  usePathname: vi.fn(() => "/"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  notFound: vi.fn(),
}));

vi.mock("next/font/google", () => ({
  Inter: () => ({ variable: "font-inter", className: "font-inter" }),
}));

vi.mock("next-auth", () => ({ getServerSession: vi.fn(async () => null) }));
vi.mock("@/app/api/auth/[...nextauth]/route", () => ({ authOptions: {} }));

// The WebGL background can't run in jsdom; it is decoration only.
vi.mock("@/components/ui/gradient-ascii", () => ({ default: () => null }));
// Stylesheets and the poster card (canvas + CSS) aren't under test here.
vi.mock("@/components/discover/discover.css", () => ({}));
vi.mock("@/components/discover/DiscoverEventCard", () => ({
  DiscoverEventCard: () => null,
}));

const supabaseState = { fail: false };
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => {
    // Every query chain resolves to the same canned result.
    const result = () =>
      supabaseState.fail
        ? { data: null, count: null, error: { message: "down" } }
        : { data: [], count: 7, error: null };
    const chain: Record<string, unknown> = {};
    for (const m of ["select", "eq", "gte", "order", "limit"])
      chain[m] = () => chain;
    chain.then = (resolve: (v: unknown) => void) => resolve(result());
    return { from: () => chain };
  }),
}));

// ── Import component after mocks are hoisted ──────────────────────────────────
import LandingPage from "@/app/page";
import { redirect } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────

describe("app/page.tsx — landing page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseState.fail = false;
  });

  it("renders the hero and real counts without redirecting", async () => {
    const html = renderToStaticMarkup(await LandingPage());
    expect(redirect).not.toHaveBeenCalled();
    expect(html).toContain("Every campus event, in one place.");
    expect(html).toContain('href="/discover"');
    expect(html).toContain(">7<");
  });

  it("hides the stats when the database is unreachable", async () => {
    supabaseState.fail = true;
    const html = renderToStaticMarkup(await LandingPage());
    expect(html).toContain("Every campus event, in one place.");
    expect(html).not.toContain("Coming up");
  });
});
