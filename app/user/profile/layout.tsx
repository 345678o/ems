import type React from "react";
import { UserAppShell } from "@/components/layout/UserAppShell";

export default function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <UserAppShell>{children}</UserAppShell>;
}
