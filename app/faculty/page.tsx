"use client";

import { IICEventCalendar } from "@/components/iic-event-calendar";

export default function FacultyPage() {
  // Access is checked by RoleGate in app/faculty/layout.tsx.
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-ui font-medium text-[var(--dz-accent)]">
          Faculty portal
        </p>
        <h1 className="mt-1 text-2xl font-semibold leading-tight tracking-[-0.02em] sm:text-[28px]">
          IIC calendar
        </h1>
        <p className="mt-1.5 text-sm text-zinc-400">
          Plan and track IIC activities by semester and quarter.
        </p>
      </div>

      {/* Same panel as the admin console's IIC section. */}
      <section className="dz-panel dz-calendar rounded-2xl p-5 text-ui max-md:p-3.5">
        <IICEventCalendar />
      </section>
    </div>
  );
}
