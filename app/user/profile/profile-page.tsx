"use client";
import logger from "@/lib/logger";
import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserProfile } from "@/components/user-profile";
import { ChangePassword } from "@/components/change-password";
import Certificates from "@/components/certificates";
import { useSession } from "next-auth/react";
import Partner from "@/components/partner";
import { supabase } from "@/lib/supabase/browserClient";

// Sections of /user/profile, picked by ?tab=. The app sidebar links to each
// one, so the page has no tab bar of its own. ("my-bookings" redirects to
// /bookings in next.config.ts.)
const SECTIONS = {
  profile: {
    title: "Profile",
    subtitle: "Your name, contact details and password.",
  },
  certificates: {
    title: "Certificates",
    subtitle: "Certificates from events you took part in.",
  },
  partner: {
    title: "Become an Organizer",
    subtitle: "Host events on EMS as a club.",
  },
} as const;
type Section = keyof typeof SECTIONS;

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const section: Section =
    tab && tab in SECTIONS ? (tab as Section) : "profile";
  const { data: session } = useSession();
  const router = useRouter();

  /** 🔑 Check role and redirect */
  useEffect(() => {
    if (!session?.user?.email) return;

    const checkRole = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("email", session.user?.email)
        .single();

      if (error) {
        logger.error("Error fetching role:", error);
        return;
      }

      if (data?.role === "club") {
        router.push("/club");
      } else if (data?.role === "admin") {
        router.push("/admin");
      }
      // else stay here (profile page)
    };

    checkRole();
  }, [session?.user?.email, router]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-ui font-medium text-[var(--dz-accent)]">
          Your account
        </p>
        <h1 className="mt-1 text-2xl font-semibold leading-tight tracking-[-0.02em] sm:text-[28px]">
          {SECTIONS[section].title}
        </h1>
        <p className="mt-1.5 text-sm text-zinc-400">
          {SECTIONS[section].subtitle}
        </p>
      </div>

      {section === "certificates" ? (
        <Certificates />
      ) : section === "partner" ? (
        <Partner />
      ) : (
        <>
          <UserProfile />
          <ChangePassword />
        </>
      )}
    </div>
  );
}
