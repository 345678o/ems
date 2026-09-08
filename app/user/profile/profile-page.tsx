"use client";
import logger from "@/lib/logger";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserProfile } from "@/components/user-profile";
import MyBookings from "@/components/my-bookings";
import Certificates from "@/components/certificates";
import { useSession } from "next-auth/react";
import Partner from "@/components/partner";
import { supabase } from "@/lib/supabase/browserClient"; // ✅ make sure your supabase client path is correct

const VALID_TABS = ["profile", "my-bookings", "certificates", "partner"];

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [currentPage, setCurrentPage] = useState(
    initialTab && VALID_TABS.includes(initialTab) ? initialTab : "profile"
  );
  const { data: session } = useSession();
  const router = useRouter();

  // Re-sync the active tab whenever the ?tab= param changes — e.g. clicking
  // a sidebar link while already on this page doesn't remount the component.
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && VALID_TABS.includes(tab)) {
      setCurrentPage(tab);
    }
  }, [searchParams]);

  /** 🔑 Check role and redirect */
  useEffect(() => {
    if (!session?.user?.email) return;

    const checkRole = async () => {
      const { data, error } = await supabase
        .from("users") // make sure your table is named correctly (users or public.users)
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

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "profile":
        return <UserProfile />;
      case "my-bookings":
        return <MyBookings />;
      case "certificates":
        return <Certificates />;
      case "partner":
        return <Partner />;
      default:
        return <UserProfile />;
    }
  };

  return (
    <div className="min-h-screen w-full dark:bg-[#0A0B1E] bg-[#FAF9F6]">
      {renderCurrentPage()}
    </div>
  );
}
