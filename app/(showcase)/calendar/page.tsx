"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { CampusCalendar } from "@/components/campus-calendar/CampusCalendar";
import { CalendarIntegration } from "@/components/calendar-integration";
import { useUserRole } from "@/components/discover/useUserRole";
import type { CalView } from "@/components/campus-calendar/calendar-utils";

/** ?date=2026-01 or ?date=2026-01-15 opens that month / day; ?view= picks the view. */
function parseDateParam(v: string | null) {
  const m = v?.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, m[3] ? +m[3] : 1);
  return Number.isNaN(d.getTime()) ? null : d;
}

function CalendarView() {
  const { data: session } = useSession();
  const params = useSearchParams();
  const initialDate = parseDateParam(params.get("date"));
  const v = params.get("view");
  const initialView: CalView | null =
    v === "month" || v === "week" || v === "day" ? v : null;
  const role = useUserRole(session?.user?.email);

  // Clubs create events through their workspace; admins and faculty use the
  // IIC management tools below (semester calendar, add/delete, reports).
  const isStaff = role === "admin" || role === "faculty";
  const createHref =
    role === "club" ? "/club/event/create" : isStaff ? "#manage" : null;

  return (
    <div className="flex flex-col gap-8">
      <CampusCalendar
        createHref={createHref}
        initialDate={initialDate}
        initialView={initialView}
      />

      {isStaff && (
        <section
          id="manage"
          aria-label="Manage IIC calendar"
          className="dz-panel dz-calendar scroll-mt-6 rounded-2xl p-5 text-ui max-md:p-3.5"
        >
          {/* The shell's `dark` class switches the shadcn calendar to dark
              tokens; the panel just gives it the glass surface. */}
          <CalendarIntegration />
        </section>
      )}
    </div>
  );
}

export default function CalendarPage() {
  // useSearchParams needs a Suspense boundary for static rendering.
  return (
    <Suspense>
      <CalendarView />
    </Suspense>
  );
}
