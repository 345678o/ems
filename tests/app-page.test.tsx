/**
 * Smoke test for app/page.tsx
 *
 * app/page.tsx is a Next.js Server Component that immediately calls
 * `redirect("/home")`. We mock next/navigation before importing the
 * component so it can be rendered in a jsdom environment without throwing.
 */

import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render } from "@testing-library/react";

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
import RootPage from "../app/page";
import { redirect } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────

describe("app/page.tsx — smoke test", () => {
  it("renders without throwing", () => {
    expect(() => render(<RootPage />)).not.toThrow();
  });

  it("calls redirect('/home') on render", () => {
    render(<RootPage />);
    expect(redirect).toHaveBeenCalledWith("/home");
  });
});
