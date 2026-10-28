import type React from "react";
import { ShowcaseFrame } from "@/components/discover/ShowcaseFrame";
import { RoleGate } from "@/components/discover/RoleGate";

export const metadata = {
  title: "Admin — EMS.MLRIT",
  description: "Approve club events and manage the IIC calendar.",
};

/** Admin console: the app's dark frame with the admin menu. */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ShowcaseFrame>
      <RoleGate allow={["admin"]}>{children}</RoleGate>
    </ShowcaseFrame>
  );
}
