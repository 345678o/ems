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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScribbleStar } from "@/components/ui/scribble";
import { cn } from "@/lib/utils";

const VALID_TABS = ["profile", "my-bookings", "certificates", "partner"];

const TAB_LABELS: Record<(typeof VALID_TABS)[number], string> = {
  profile: "Profile",
  "my-bookings": "My Bookings",
  certificates: "Certificates",
  partner: "Partner",
};

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

  const handleTabChange = (tab: string) => {
    setCurrentPage(tab);
    router.push(`/user/profile?tab=${tab}`, { scroll: false });
  };

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

  const displayName =
    session?.user?.name || session?.user?.email || "Your Profile";

  return (
    <div className="paper-grain min-h-screen w-full bg-background">
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-ink shadow-sm">
            <AvatarImage
              src={session?.user?.image ?? undefined}
              alt={displayName}
            />
            <AvatarFallback className="bg-badge-workshop text-badge-workshop-foreground font-display text-xl">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <h1 className="font-display truncate text-3xl leading-tight text-ink sm:text-4xl">
              {displayName}
              <ScribbleStar className="ml-2 -mt-2 inline h-4 w-4 text-hotpink" />
            </h1>
            {session?.user?.email && session?.user?.name && (
              <p className="mt-1 truncate text-sm text-foreground/60">
                {session.user.email}
              </p>
            )}
          </div>
        </div>

        {/* Tab pills */}
        <div className="mb-8 flex flex-wrap gap-2">
          {VALID_TABS.map((tab) => {
            const isActive = tab === currentPage;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  isActive
                    ? "border-ink bg-ink text-background"
                    : "border-border bg-card text-foreground hover:border-ink/40"
                )}
              >
                {TAB_LABELS[tab]}
              </button>
            );
          })}
        </div>

        {renderCurrentPage()}
      </div>
    </div>
  );
}
