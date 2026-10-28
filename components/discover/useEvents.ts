"use client";

import { useCallback, useEffect, useState } from "react";
import logger from "@/lib/logger";
import { supabase } from "@/lib/supabase/browserClient";
import {
  EVENT_FIELDS,
  toDiscoverEvents,
  type DiscoverEvent,
} from "@/components/discover/types";

export type LoadStatus = "loading" | "error" | "ready";

/**
 * Loads events for the public pages and keeps a failed request apart from an
 * empty result, so the UI can show an error with a working retry instead of
 * "No events yet".
 */
export function useEvents({
  approvedOnly = false,
  ascending = false,
}: { approvedOnly?: boolean; ascending?: boolean } = {}) {
  const [events, setEvents] = useState<DiscoverEvent[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setStatus("loading");
      let query = supabase.from("events").select(EVENT_FIELDS);
      if (approvedOnly) query = query.eq("status", "approved");
      const { data, error } = await query.order("start_datetime", {
        ascending,
      });
      if (cancelled) return;
      if (error) {
        logger.error("[events] fetch error:", error.message);
        setError(error.message);
        setStatus("error");
        return;
      }
      setEvents(toDiscoverEvents(data));
      setError(null);
      setStatus("ready");
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [approvedOnly, ascending, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { events, status, error, retry };
}

export type ClubRow = {
  id: string;
  name: string;
  about: string | null;
  avatar_url: string | null;
};

/** Same contract as useEvents, for the clubs table. */
export function useClubs() {
  const [clubs, setClubs] = useState<ClubRow[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setStatus("loading");
      const { data, error } = await supabase
        .from("clubs")
        .select("id,name,about,avatar_url")
        .order("name", { ascending: true });
      if (cancelled) return;
      if (error) {
        logger.error("[clubs] fetch error:", error.message);
        setError(error.message);
        setStatus("error");
        return;
      }
      setClubs((data as ClubRow[]) ?? []);
      setError(null);
      setStatus("ready");
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { clubs, status, error, retry };
}

/** Turns a raw fetch error into something a student can act on. */
export function friendlyError(message: string | null) {
  if (message && /fetch failed|failed to fetch|network/i.test(message))
    return "We couldn't reach the events server. Check your connection and try again.";
  return "Something went wrong while loading. Please try again.";
}
