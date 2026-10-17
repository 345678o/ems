"use client";

import { useSyncExternalStore } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  Ticket01Icon,
  UserCircleIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import GlassIcons from "@/components/ui/glass-icons";

/**
 * "Jump in" row of glass discs under the Discover header. Each disc is a
 * shortcut to a main area of the app. Warm ember glass sits on the dark
 * page; labels stay visible so the row reads on touch screens too.
 */
const SHORTCUTS = [
  {
    icon: <HugeiconsIcon icon={Ticket01Icon} />,
    color: "orange",
    label: "Events",
    href: "/events",
  },
  {
    icon: <HugeiconsIcon icon={UserGroupIcon} />,
    color: "pink",
    label: "Clubs",
    href: "/clubs",
  },
  {
    icon: <HugeiconsIcon icon={Calendar03Icon} />,
    color: "teal",
    label: "Calendar",
    href: "/calendar",
  },
  {
    icon: <HugeiconsIcon icon={UserCircleIcon} />,
    color: "indigo",
    label: "Profile",
    href: "/user/profile",
  },
];

// Phone width: smaller discs and tighter gap so all four fit one row.
const subscribe = (notify: () => void) => {
  const mq = window.matchMedia("(max-width: 480px)");
  mq.addEventListener("change", notify);
  return () => mq.removeEventListener("change", notify);
};
const isCompact = () => window.matchMedia("(max-width: 480px)").matches;

export function JumpIn() {
  const compact = useSyncExternalStore(subscribe, isCompact, () => false);

  return (
    <section className="dz-panel relative overflow-hidden px-5 pb-10 pt-5 sm:px-8">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-semibold tracking-[-0.01em]">Jump in</h2>
        <p className="text-ui text-zinc-400">Where to next?</p>
      </div>
      <div className="mt-8 flex justify-center">
        <GlassIcons
          items={SHORTCUTS}
          size={compact ? 60 : 76}
          gap={compact ? 18 : 44}
          columns={4}
          roundness={0.5}
          refraction={0.8}
          bevel={0.6}
          frost={0.3}
          shine={0.85}
          tint="#ffd2bf"
          tintOpacity={0.16}
          iconColor="#fff8f4"
          plate="circle"
          spread={0.45}
          hover="float"
          parallax={0.6}
          labels="always"
          intro
          theme="dark"
        />
      </div>
    </section>
  );
}
