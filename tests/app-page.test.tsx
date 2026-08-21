/**
 * Smoke test for app/page.tsx
 *
 * app/page.tsx is a Next.js Server Component that immediately calls
 * `redirect("/home")`. Since it's a server component that performs a redirect,
 * we test that the redirect function is called correctly.
 */

import { describe, it, expect, vi } from "vitest";

// ── Hoist mocks before any imports ───────────────────────────────────────────
// vi.mock is automatically hoisted to the top of the file by Vitest.
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn() })),
  usePathname: vi.fn(() => "/"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  notFound: vi.fn(),
}));

// Also mock next/headers in case it's transitively imported
vi.mock("next/headers", () => ({
  headers: vi.fn(() => new Map()),
  cookies: vi.fn(() => new Map()),
}));

// ── Import component after mocks are hoisted ──────────────────────────────────
import RootPage from "@/app/page";
import { redirect } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────

describe("app/page.tsx — smoke test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls redirect('/home') when executed", () => {
    // Execute the component function directly
    RootPage();
    expect(redirect).toHaveBeenCalledWith("/home");
  });
});
