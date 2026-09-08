import type React from "react";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { UserAppShell } from "@/components/layout/UserAppShell";
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
    redirect("/");
  }

  return (
    <UserAppShell>
      <main className="min-h-screen bg-background text-foreground">
        {children}
      </main>
    </UserAppShell>
  );
}
