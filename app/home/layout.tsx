import type React from "react";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import {
  HomeTopBar,
  HomeCategoryNav,
  HOME_TOPBAR_HEIGHT,
} from "@/components/home/HomeHeader";
import { UserAppShell } from "@/components/layout/UserAppShell";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Club Event Dashboard",
  description: "Event management dashboard",
  generator: "v0.app",
};

export default async function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (userId) {
    const { data: club } = await supabaseAdmin
      .from("clubs")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (club) {
      redirect("/club");
    }
  }

  return (
    <UserAppShell topBar={<HomeTopBar />} topBarHeight={HOME_TOPBAR_HEIGHT}>
      <HomeCategoryNav activeCategory="Events" />
      <main className="min-h-screen bg-background text-foreground">
        {children}
      </main>
    </UserAppShell>
  );
}
