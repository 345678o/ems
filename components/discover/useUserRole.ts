"use client";

import { useEffect, useState } from "react";
import logger from "@/lib/logger";
import { supabase } from "@/lib/supabase/browserClient";

export type UserRole = "student" | "club" | "admin" | "faculty";
export type RoleStatus = "idle" | "loading" | "ready" | "error";

/** Where each role starts after signing in. */
export const ROLE_HOME: Record<UserRole, string> = {
  student: "/discover",
  club: "/club",
  admin: "/admin",
  faculty: "/faculty",
};

/** users.role values → app roles ("user" rows are students). */
export function toUserRole(raw: string | null | undefined): UserRole {
  return raw === "club" || raw === "admin" || raw === "faculty"
    ? raw
    : "student";
}

/**
 * Role of the signed-in user from the users table (same lookup the profile
 * page uses), with its load state. `status` is "idle" without an email.
 */
export function useUserRoleState(email: string | null | undefined) {
  const [result, setResult] = useState<{
    email: string;
    role: UserRole | null;
    error: boolean;
  } | null>(null);

  useEffect(() => {
    if (!email) return;
    let cancelled = false;
    supabase
      .from("users")
      .select("role")
      .eq("email", email)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          logger.warn("[role] lookup failed:", error.message);
          setResult({ email, role: null, error: true });
          return;
        }
        setResult({ email, role: toUserRole(data?.role), error: false });
      });
    return () => {
      cancelled = true;
    };
  }, [email]);

  if (!email) return { role: null, status: "idle" as RoleStatus };
  if (result?.email !== email)
    return { role: null, status: "loading" as RoleStatus };
  return {
    role: result.role,
    status: (result.error ? "error" : "ready") as RoleStatus,
  };
}

/**
 * Just the role: null while unknown, signed out, or if the lookup fails, so
 * staff-only UI stays hidden unless the role is confirmed.
 */
export function useUserRole(email: string | null | undefined) {
  return useUserRoleState(email).role;
}
