import type React from "react";
import "./ems-showcase.css";
import { AppChrome } from "@/components/ems/AppChrome";

export default function ShowcaseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppChrome>{children}</AppChrome>;
}
