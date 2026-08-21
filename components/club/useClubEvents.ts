"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/browserClient";
import type { ClubEvent, CalendarEvent } from "./types";

export function useClubEvents(sessionUserId: string | null) {
  const [iicEvents, setIicEvents] = useState<ClubEvent[]>([]);
  const [selfEvents, setSelfEvents] = useState<ClubEvent[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    if (!sessionUserId) return;
    setIsLoading(true);

    try {
      // IIC events for this club
      const { data: iicData, error: iicErr } = await supabase
        .from("events")
        .select(
          "id, name, start_datetime, end_datetime, event_type, status, created_at, description, semester, quarter, date_range, hosted, clubs(owner_id), club_id"
        )
        .eq("hosted", "iic")
        .eq("club_id", sessionUserId)
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (iicErr) console.error("IIC error:", iicErr.message);
      setIicEvents((iicData || []) as ClubEvent[]);

      // Self-hosted events
      const { data: selfData, error: selfErr } = await supabase
        .from("events")
        .select(
          "id, name, start_datetime, end_datetime, event_type, status, created_at, clubs(owner_id), club_id"
        )
        .eq("hosted", "self")
        .eq("club_id", sessionUserId)
        .order("created_at", { ascending: false });
      if (selfErr) console.error("Self-hosted error:", selfErr.message);
      setSelfEvents((selfData || []) as ClubEvent[]);

      // Calendar events with nested event data
      const { data: calendarData, error: calendarErr } = await supabase
        .from("club_event_calendar")
        .select(
          `id, event_id, club_id, added_at, report_status, reviewer_comment, review_request,
          events (
            id, name, start_datetime, end_datetime, event_type, status,
            description, semester, quarter, date_range, hosted
          )`
        )
        .eq("club_id", sessionUserId)
        .order("added_at", { ascending: false });
      if (calendarErr) console.error("Calendar error:", calendarErr.message);

      // Enrich each calendar entry with its after_event_report
      const enriched = await Promise.all(
        (calendarData || []).map(
          async (item) => {
            const { data: reportData } = await supabase
              .from("after_event_reports")
              .select("report_submitted, media_uploaded, social_media_promoted")
              .eq("event_id", item.event_id)
              .eq("submitted_by", sessionUserId)
              .maybeSingle();
            // Extract the first event from the array (or undefined if empty/null)
            const eventData = Array.isArray(item.events) && item.events.length > 0
              ? item.events[0]
              : (item.events ?? undefined);
            return {
              ...item,
              event: eventData,
              after_event_report: reportData || null,
            };
          }
        )
      );
      setCalendarEvents(enriched);
    } catch (error) {
      console.error("Error fetching events:", error);
      setIicEvents([]);
      setSelfEvents([]);
      setCalendarEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionUserId]);

  // Initial fetch + re-fetch when auth resolves
  useEffect(() => {
    if (!sessionUserId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
      return;
    }

    fetchEvents();
  }, [sessionUserId, fetchEvents]);

  // Re-fetch when window regains focus
  useEffect(() => {
    const onFocus = () => {
      if (sessionUserId) fetchEvents();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [sessionUserId, fetchEvents]);

  // Calendar mutations — kept here so they share the same fetchEvents reference
  const addToCalendar = async (eventId: string) => {
    if (!sessionUserId) return;
    const { data: existing } = await supabase
      .from("club_event_calendar")
      .select("id")
      .eq("event_id", eventId)
      .eq("club_id", sessionUserId)
      .maybeSingle();
    if (existing) {
      alert("This event is already in your calendar");
      return;
    }
    const { error } = await supabase.from("club_event_calendar").insert({
      event_id: eventId,
      club_id: sessionUserId,
      report_status: "Not Submitted",
    });
    if (error) {
      console.error("Error adding to calendar:", error);
      alert("Failed to add event to calendar");
      return;
    }
    await fetchEvents();
  };

  const removeFromCalendar = async (eventId: string) => {
    if (!sessionUserId) return;
    const { data: entry } = await supabase
      .from("club_event_calendar")
      .select("id")
      .eq("event_id", eventId)
      .eq("club_id", sessionUserId)
      .maybeSingle();
    if (!entry) {
      alert("Event not found in calendar");
      return;
    }
    const { error } = await supabase
      .from("club_event_calendar")
      .delete()
      .eq("id", entry.id);
    if (error) {
      console.error("Error removing from calendar:", error);
      alert("Failed to remove event from calendar");
      return;
    }
    await fetchEvents();
  };

  const removeFromCalendarById = async (calendarRowId: string) => {
    const { error } = await supabase
      .from("club_event_calendar")
      .delete()
      .eq("id", calendarRowId);
    if (!error) await fetchEvents();
  };

  const isEventInCalendar = (eventId: string) =>
    calendarEvents.some((ce) => ce.event_id === eventId);

  return {
    iicEvents,
    selfEvents,
    calendarEvents,
    isLoading,
    fetchEvents,
    addToCalendar,
    removeFromCalendar,
    removeFromCalendarById,
    isEventInCalendar,
  };
}
