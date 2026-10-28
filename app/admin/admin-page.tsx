"use client";

import { useSearchParams } from "next/navigation";
import { IICEventCalendar } from "@/components/iic-event-calendar";
import { ManageSelfHostedEvents } from "@/components/manage-self-hosted-events";

// Sections of the admin console, picked by ?tab= from the sidebar.
const SECTIONS = {
  approvals: {
    title: "Event approvals",
    subtitle: "Review events clubs submitted and approve or reject them.",
  },
  iic: {
    title: "IIC calendar",
    subtitle: "Plan and track IIC activities by semester and quarter.",
  },
} as const;
type Section = keyof typeof SECTIONS;

export default function AdminPage() {
  const tab = useSearchParams().get("tab");
  const section: Section = tab === "iic" ? "iic" : "approvals";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-ui font-medium text-[var(--dz-accent)]">
          Admin console
        </p>
        <h1 className="mt-1 text-2xl font-semibold leading-tight tracking-[-0.02em] sm:text-[28px]">
          {SECTIONS[section].title}
        </h1>
        <p className="mt-1.5 text-sm text-zinc-400">
          {SECTIONS[section].subtitle}
        </p>
      </div>

      {/* The shell's `dark` class switches the shadcn pieces to dark tokens;
          dz-calendar trims the older components' own page wrappers. */}
      <section className="dz-panel dz-calendar rounded-2xl p-5 text-ui max-md:p-3.5">
        {section === "iic" ? <IICEventCalendar /> : <ManageSelfHostedEvents />}
      </section>
    </div>
  );
}
