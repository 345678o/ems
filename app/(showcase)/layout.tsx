import type React from "react";
import { ShowcaseFrame } from "@/components/discover/ShowcaseFrame";

export default function ShowcaseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ShowcaseFrame>{children}</ShowcaseFrame>;
}
