"use client";

import { useCallback, useEffect, useState } from "react";
import logger from "@/lib/logger";
import { supabase } from "@/lib/supabase/browserClient";
import {
  EVENT_FIELDS,
  toDiscoverEvents,
  type DiscoverEvent,
} from "@/components/discover/types";
import type { LoadStatus } from "@/components/discover/useEvents";

type Registration = {
  id: string;
  event_id: string;
  registration_status: string | null;
  registration_date: string | null;
  pass_type: string | null;
};
export type Booking = Registration & { event: DiscoverEvent };

/**
 * The signed-in student's registrations (event_participants, matched by
 * email) joined with their events. Pass null while the session is unknown.
 */
export function useMyBookings(email: string | null) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [attempt, setAttempt] = useState(0);
  // The result belongs to one email + attempt; anything else is loading.
  const [result, setResult] = useState<{
    key: string;
    status: Exclude<LoadStatus, "loading">;
    error: string | null;
  } | null>(null);

  const key = `${email}|${attempt}`;
  const status: LoadStatus = result?.key === key ? result.status : "loading";

  useEffect(() => {
    if (!email) return;
    let cancelled = false;
    const load = async () => {
      const fail = (message: string) => {
        logger.error("[bookings] fetch error:", message);
        if (!cancelled) setResult({ key, status: "error", error: message });
      };

      const { data: rows, error } = await supabase
        .from("event_participants")
        .select("id,event_id,registration_status,registration_date,pass_type")
        .eq("email", email);
      if (cancelled) return;
      if (error) return fail(error.message);

      const regs = (rows ?? []) as Registration[];
      const ids = [...new Set(regs.map((r) => r.event_id))];
      let events: DiscoverEvent[] = [];
      if (ids.length) {
        const { data, error: eventsError } = await supabase
          .from("events")
          .select(EVENT_FIELDS)
          .in("id", ids);
        if (cancelled) return;
        if (eventsError) return fail(eventsError.message);
        events = toDiscoverEvents(data);
      }

      const byId = new Map(events.map((e) => [e.id, e]));
      setBookings(
        regs.flatMap((r) => {
          const event = byId.get(r.event_id);
          // Registrations for deleted events have nothing to show.
          return event ? [{ ...r, event }] : [];
        })
      );
      setResult({ key, status: "ready", error: null });
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [email, key]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { bookings, status, error: result?.error ?? null, retry };
}
