"use client";

import type React from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShieldAlert } from "lucide-react";
import {
  ROLE_HOME,
  useUserRoleState,
  type UserRole,
} from "@/components/discover/useUserRole";

/**
 * Shows its children only to signed-in users whose role is in `allow`.
 * Signed-out visitors go to sign-in (and come back here after); other roles
 * go to their own home. Nothing role-specific renders before the check.
 */
export function RoleGate({
  allow,
  children,
}: {
  allow: UserRole[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { role, status: roleStatus } = useUserRoleState(session?.user?.email);
  const allowed = role !== null && allow.includes(role);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/register?callbackUrl=${encodeURIComponent(pathname)}`);
    } else if (roleStatus === "ready" && role && !allow.includes(role)) {
      router.replace(ROLE_HOME[role]);
    }
  }, [status, roleStatus, role, allow, pathname, router]);

  if (allowed) return <>{children}</>;

  if (roleStatus === "error") {
    return (
      <div
        role="alert"
        className="dz-panel mx-auto mt-10 flex max-w-md flex-col items-center gap-3 p-8 text-center"
      >
        <ShieldAlert className="size-6 text-[var(--danger)]" aria-hidden />
        <p className="font-semibold">We couldn&apos;t check your access</p>
        <p className="text-ui text-zinc-400">
          Your account role didn&apos;t load. Reload the page to try again.
        </p>
      </div>
    );
  }

  return (
    <div role="status" className="py-16 text-center text-ui text-zinc-400">
      Checking access…
    </div>
  );
}
