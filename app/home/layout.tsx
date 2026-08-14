import type React from "react";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import TopBar from "@/components/top-bar";
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
    <>
      <TopBar />
      {/* Spacer to offset the fixed top bar height */}
      <div className="h-16" />
      <main className="min-h-screen bg-background text-foreground">
        {children}
      </main>
    </>
  );
}
