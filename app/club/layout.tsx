import type React from "react";
import { ShowcaseFrame } from "@/components/discover/ShowcaseFrame";
import { RoleGate } from "@/components/discover/RoleGate";

/**
 * Club workspace: the app's dark frame with the club menu. An event's own
 * workspace (/club/event/[id]) keeps its full-screen section navigation.
 */
export default function ClubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ShowcaseFrame bare="^/club/event/(?!create$)[^/]+$">
      <RoleGate allow={["club"]}>{children}</RoleGate>
    </ShowcaseFrame>
  );
}
