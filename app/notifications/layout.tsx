import type React from "react";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ShowcaseFrame } from "@/components/discover/ShowcaseFrame";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const metadata: Metadata = {
  title: "Notifications | EMS",
  description: "Your event notifications",
};

export default async function NotificationsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    // Signed-out visitors go to sign-in rather than silently home.
    redirect("/register?callbackUrl=/notifications");
  }

  return <ShowcaseFrame>{children}</ShowcaseFrame>;
}
