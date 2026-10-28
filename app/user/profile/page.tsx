"use client";
import logger from "@/lib/logger";
import { Suspense, useEffect, useState } from "react";
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
      router.replace("/register?callbackUrl=/user/profile"); // not logged in → sign in
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
      } else if (data?.role === "faculty") {
        router.replace("/faculty");
      } else {
        setLoading(false); // stay here, show ProfilePage
      }
    };

    checkRole();
  }, [session?.user?.email, status, router]);

  if (loading) {
    return (
      <div
        role="status"
        className="flex min-h-[40vh] items-center justify-center text-ui text-zinc-400"
      >
        Loading…
      </div>
    );
  }

  return (
    <Suspense fallback={null}>
      <ProfilePage />
    </Suspense>
  );
}
