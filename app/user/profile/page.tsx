"use client";
import logger from "@/lib/logger";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase/browserClient";
import ProfilePage from "./profile-page"; // 👈 move your full UI here

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return; // wait for next-auth
    if (!session?.user?.email) {
      router.push("/"); // not logged in
      return;
    }

    const checkRole = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("email", session.user?.email)
        .single();

      if (error) {
        logger.error("Error fetching role:", error);
        setLoading(false);
        return;
      }

      if (data?.role === "club") {
        router.replace("/club"); // 🚀 instant redirect
      } else if (data?.role === "admin") {
        router.replace("/admin");
      } else {
        setLoading(false); // stay here, show ProfilePage
      }
    };

    checkRole();
  }, [session?.user?.email, status, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-[#0A0B1E] bg-[#FAF9F6]">
        <p className="text-neutral-700 dark:text-neutral-200">Loading...</p>
      </div>
    );
  }

  return <ProfilePage />;
}
