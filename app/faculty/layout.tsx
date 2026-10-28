import type React from "react";
import { ShowcaseFrame } from "@/components/discover/ShowcaseFrame";
import { RoleGate } from "@/components/discover/RoleGate";

export const metadata = {
  title: "Faculty — EMS.MLRIT",
  description: "Plan and track IIC activities.",
};

/** Faculty portal: the app's dark frame with the faculty menu. */
export default function FacultyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ShowcaseFrame>
      <RoleGate allow={["faculty"]}>{children}</RoleGate>
    </ShowcaseFrame>
  );
}
