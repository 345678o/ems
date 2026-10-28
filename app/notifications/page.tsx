"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  BellOff,
  CheckCircle2,
  Clock,
  Hourglass,
  PlusCircle,
  XCircle,
} from "lucide-react";
import logger from "@/lib/logger";
import { supabase } from "@/lib/supabase/browserClient";
import { EmptyState, ErrorState } from "@/components/discover/LoadStates";
import { friendlyError } from "@/components/discover/useEvents";
import { useMyBookings } from "@/components/discover/useMyBookings";
import { formatEventTime } from "@/components/discover/types";

type NotificationKind =
  "confirmed" | "pending" | "waitlist" | "rejected" | "reminder" | "new";

type NotificationItem = {
  id: string;
  kind: NotificationKind;
  title: string;
  description: string;
  href: string;
  /** ms epoch, for sorting and the relative label */
  at: number;
};

const KIND_STYLES: Record<
  NotificationKind,
  { icon: React.ElementType; className: string }
> = {
  confirmed: {
    icon: CheckCircle2,
    className: "bg-[var(--success-soft)] text-[var(--success)]",
  },
  pending: {
    icon: Hourglass,
    className: "bg-[var(--info-soft)] text-[var(--info)]",
  },
  waitlist: {
    icon: Hourglass,
    className: "bg-[var(--warning-soft)] text-[var(--warning)]",
  },
  rejected: {
    icon: XCircle,
    className: "bg-[var(--destructive-soft)] text-[var(--danger)]",
  },
  reminder: {
    icon: Clock,
    className: "bg-[rgba(255,117,71,0.14)] text-[var(--dz-accent)]",
  },
  new: {
    icon: PlusCircle,
    className: "bg-white/[0.06] text-zinc-300",
  },
};

const DAY = 24 * 60 * 60 * 1000;
const REMINDER_WINDOW = 7 * DAY;
const NEW_EVENT_WINDOW = 14 * DAY;

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
function relative(at: number, now: number) {
  const diff = at - now;
  const abs = Math.abs(diff);
  if (abs < 60 * 60 * 1000)
    return rtf.format(Math.round(diff / 60000), "minute");
  if (abs < DAY) return rtf.format(Math.round(diff / 3600000), "hour");
  return rtf.format(Math.round(diff / DAY), "day");
}

type NewEvent = {
  id: string;
  name: string;
  created_at: string | null;
  clubs: { name: string } | { name: string }[] | null;
};

/** Recently published events, for "new event" items. */
function useNewEvents(since: number) {
  const [state, setState] = useState<{
    status: "loading" | "error" | "ready";
    events: NewEvent[];
  }>({ status: "loading", events: [] });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("events")
      .select("id,name,created_at,clubs(name)")
      .eq("status", "approved")
      .gte("created_at", new Date(since).toISOString())
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          logger.error("[notifications] new events error:", error.message);
          setState({ status: "error", events: [] });
          return;
        }
        setState({ status: "ready", events: (data as NewEvent[]) ?? [] });
      });
    return () => {
      cancelled = true;
    };
  }, [since, attempt]);

  const retry = () => {
    setState({ status: "loading", events: [] });
    setAttempt((n) => n + 1);
  };
  return { ...state, retry };
}

/**
 * Notifications built from real data: the student's registrations (status
 * and upcoming reminders) and events published in the last two weeks.
 * There is no stored notifications table, so nothing here is "unread".
 */
export default function NotificationsPage() {
  const { data: session } = useSession();
  const [now] = useState(() => Date.now());
  const mine = useMyBookings(session?.user?.email ?? null);
  const fresh = useNewEvents(now - NEW_EVENT_WINDOW);

  const items = useMemo<NotificationItem[]>(() => {
    const out: NotificationItem[] = [];
    for (const b of mine.bookings) {
      const href = `/events/${b.event.id}`;
      const registered = b.registration_date
        ? new Date(b.registration_date).getTime()
        : 0;
      const status = b.registration_status?.toLowerCase();
      const name = b.event.name;
      if (status === "approved")
        out.push({
          id: `${b.id}-status`,
          kind: "confirmed",
          title: "Registration confirmed",
          description: `You're registered for ${name}.`,
          href,
          at: registered,
        });
      else if (status === "rejected")
        out.push({
          id: `${b.id}-status`,
          kind: "rejected",
          title: "Registration not approved",
          description: `Your registration for ${name} wasn't approved.`,
          href,
          at: registered,
        });
      else if (status === "waitlist")
        out.push({
          id: `${b.id}-status`,
          kind: "waitlist",
          title: "You're on the waitlist",
          description: `We'll confirm your spot for ${name} if one opens up.`,
          href,
          at: registered,
        });
      else
        out.push({
          id: `${b.id}-status`,
          kind: "pending",
          title: "Registration received",
          description: `Your registration for ${name} is waiting for approval.`,
          href,
          at: registered,
        });

      const start = b.event.start_datetime
        ? new Date(b.event.start_datetime).getTime()
        : 0;
      if (status !== "rejected" && start > now && start - now < REMINDER_WINDOW)
        out.push({
          id: `${b.id}-reminder`,
          kind: "reminder",
          title: "Event reminder",
          description: `${name} starts ${relative(start, now)}${
            formatEventTime(b.event.start_datetime)
              ? ` at ${formatEventTime(b.event.start_datetime)}`
              : ""
          }.`,
          href,
          // Reminders are about now, so they sit at the top.
          at: now,
        });
    }
    const registeredIds = new Set(mine.bookings.map((b) => b.event.id));
    for (const e of fresh.events) {
      if (registeredIds.has(e.id) || !e.created_at) continue;
      const club = Array.isArray(e.clubs) ? e.clubs[0] : e.clubs;
      out.push({
        id: `${e.id}-new`,
        kind: "new",
        title: "New event added",
        description: `${e.name}${club ? ` was added by ${club.name}` : " was added"}.`,
        href: `/events/${e.id}`,
        at: new Date(e.created_at).getTime(),
      });
    }
    return out.sort((a, b) => b.at - a.at);
  }, [mine.bookings, fresh.events, now]);

  const loading = mine.status === "loading" || fresh.status === "loading";
  const failed = mine.status === "error" || fresh.status === "error";
  const retry = () => {
    if (mine.status === "error") mine.retry();
    if (fresh.status === "error") fresh.retry();
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <p className="text-ui font-medium text-[var(--dz-accent)]">Updates</p>
        <h1 className="mt-1 text-2xl font-semibold leading-tight tracking-[-0.02em] sm:text-[28px]">
          Notifications
        </h1>
        <p className="mt-1.5 text-sm text-zinc-400">
          Your registration updates, upcoming reminders and newly added events.
        </p>
      </div>

      {loading && (
        <div
          role="status"
          aria-label="Loading notifications"
          className="grid gap-3"
        >
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="dz-panel flex items-start gap-4 p-4">
              <span className="size-10 shrink-0 animate-pulse rounded-full bg-[var(--dz-surface-3)]" />
              <span className="flex-1 space-y-2 pt-1">
                <span className="block h-3.5 w-1/3 animate-pulse rounded bg-[var(--dz-surface-3)]" />
                <span className="block h-3 w-2/3 animate-pulse rounded bg-[var(--dz-surface-2)]" />
              </span>
            </div>
          ))}
        </div>
      )}

      {!loading && failed && (
        <ErrorState
          title="Notifications didn't load"
          message={friendlyError(mine.error ?? "network")}
          onRetry={retry}
        />
      )}

      {!loading && !failed && items.length === 0 && (
        <EmptyState
          icon={<BellOff className="size-5" aria-hidden />}
          title="You're all caught up"
          message="Updates about your registrations and new events will show up here."
          action={
            <Link href="/events" className="dz-btn dz-btn--ghost">
              Explore events
            </Link>
          }
        />
      )}

      {!loading && !failed && items.length > 0 && (
        <ul className="grid gap-3">
          {items.map((n) => {
            const { icon: Icon, className } = KIND_STYLES[n.kind];
            return (
              <li key={n.id}>
                <Link
                  href={n.href}
                  className="dz-card flex items-start gap-4 p-4"
                >
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-full ${className}`}
                  >
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold">{n.title}</span>
                      {n.at > 0 && (
                        <span className="shrink-0 text-xs text-faint">
                          {n.kind === "reminder"
                            ? "Upcoming"
                            : relative(n.at, now)}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-ui text-zinc-400">
                      {n.description}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
