import type React from "react";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ShowcaseFrame } from "@/components/discover/ShowcaseFrame";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const metadata: Metadata = {
  title: "Dashboard | EMS",
  description: "Your personal event dashboard",
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    // Signed-out visitors go to sign-in rather than silently home.
    redirect("/register?callbackUrl=/dashboard");
  }

  return <ShowcaseFrame>{children}</ShowcaseFrame>;
}
