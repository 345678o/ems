import type React from "react";
import type { Metadata } from "next";
import { UserAppShell } from "@/components/layout/UserAppShell";

export const metadata: Metadata = {
  title: "Events | Event Management System",
  description: "Browse and discover events",
};

export default function EventsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <UserAppShell>{children}</UserAppShell>;
}
