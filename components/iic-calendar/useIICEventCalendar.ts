"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/browserClient";
import type { DbEvent, DbClub } from "@/types/database";
import type { AfterEventReportData } from "@/components/event-report-dialog";
import type { IICEventData, IICClub, CreateIICEventForm } from "./types";

/** Translate a "semester-1-quarter-1" key to a human-readable date range. */
export function getDateRange(semesterQuarter: string): string {
  if (semesterQuarter === "semester-1-quarter-1") return "September - November";
  if (semesterQuarter === "semester-1-quarter-2") return "December - February";
  if (semesterQuarter === "semester-2-quarter-3") return "March - May";
  if (semesterQuarter === "semester-2-quarter-4") return "June - August";
  return "";
}

export function useIICEventCalendar() {
  // ── Events ─────────────────────────────────────────────────────────────────
  const [events, setEvents] = useState<IICEventData[]>([]);
  const [selectedSemester, setSelectedSemester] = useState(
    "semester-1-quarter-1"
  );
  const [selectedClubId, setSelectedClubId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchEvents = useCallback(async () => {
    try {
      const parts = selectedSemester.split("-");
      const semester = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : "";
      const quarter = parts.length >= 4 ? `${parts[2]}-${parts[3]}` : "";

      let query = supabase
        .from("events")
        .select(
          `id, name, additional_details, quarter, semester, description,
           date_range, club_id, clubs(name)`
        )
        .eq("hosted", "iic")
        .order("created_at", { ascending: false });

      if (semester) query = query.eq("semester", semester);
      if (quarter) query = query.eq("quarter", quarter);
      if (selectedClubId) query = query.eq("club_id", selectedClubId);

      const { data, error } = await query;
      if (error) throw error;

      const eventIds = (data ?? []).map((e: Pick<DbEvent, "id">) => e.id);
      const { data: reports } = await supabase
        .from("after_event_reports")
        .select("event_id")
        .in("event_id", eventIds);

      const reportedIds = new Set(reports?.map((r) => r.event_id) || []);

      // The clubs(name) select returns an array like [{ name: "Club" }] or []
      type IICEventRow = Pick<
        DbEvent,
        | "id"
        | "name"
        | "additional_details"
        | "quarter"
        | "semester"
        | "description"
        | "date_range"
        | "club_id"
      > & { clubs: { name: string }[] };

      setEvents(
        (data ?? []).map((e: IICEventRow) => ({
          id: e.id,
          title: e.name,
          quarter: e.quarter || "",
          description: e.description || e.additional_details || "",
          semester: e.semester || "",
          dateRange: e.date_range || "",
          club_id: e.club_id,
          club_name: e.clubs[0]?.name || "Unassigned",
          has_report: reportedIds.has(e.id),
        }))
      );
    } catch (e) {
      console.error("Failed to fetch IIC events", e);
      setEvents([]);
    }
  }, [selectedSemester, selectedClubId]);

  useEffect(() => {
    void (async () => {
      await fetchEvents();
    })();
    const onFocus = () => {
      void fetchEvents();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchEvents]);

  // ── Clubs ──────────────────────────────────────────────────────────────────
  const [clubs, setClubs] = useState<IICClub[]>([]);
  const [isLoadingClubs, setIsLoadingClubs] = useState(false);

  const fetchClubs = useCallback(async () => {
    try {
      setIsLoadingClubs(true);
      const { data, error } = await supabase
        .from("clubs")
        .select("id, name, avatar_url")
        .order("name", { ascending: true });
      if (error) throw error;
      setClubs((data as IICClub[]) || []);
    } catch (e: unknown) {
      console.error("Failed to load clubs", e instanceof Error ? e.message : e);
      setClubs([]);
    } finally {
      setIsLoadingClubs(false);
    }
  }, []);

  useEffect(() => {
    void fetchClubs();
  }, [fetchClubs]);

  // ── Delete event ───────────────────────────────────────────────────────────
  const handleDeleteEvent = async (eventId: string) => {
    const ok = window.confirm(
      "Are you sure you want to delete this event? This action cannot be undone."
    );
    if (!ok) return;
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    if (error) {
      console.error("Failed to delete event:", error.message);
      return;
    }
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  // ── View report ────────────────────────────────────────────────────────────
  const [reportOpen, setReportOpen] = useState(false);
  const [reportData, setReportData] = useState<AfterEventReportData | null>(
    null
  );
  const [reportLoading, setReportLoading] = useState(false);

  const handleViewReport = async (eventId: string) => {
    try {
      setReportLoading(true);
      setReportData(null);
      setReportOpen(true);
      const { data, error } = await supabase
        .from("after_event_reports")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) {
        console.error("Failed to load after_event_report:", error.message);
      } else {
        setReportData(data as unknown as AfterEventReportData);
      }
    } finally {
      setReportLoading(false);
    }
  };

  // ── Create event ───────────────────────────────────────────────────────────
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Re-fetch clubs each time the create dialog opens
  useEffect(() => {
    if (!createDialogOpen) return;

    void fetchClubs();
  }, [createDialogOpen, fetchClubs]);

  const handleCreateEvent = async (form: CreateIICEventForm) => {
    setSubmitError(null);
    setSubmitSuccess(null);

    const { title, description, semesterQuarter, clubId } = form;
    if (!title || !description || !semesterQuarter || !clubId) {
      setSubmitError("Please fill all fields.");
      return false;
    }

    const parts = semesterQuarter.split("-");
    const semester = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : "";
    const quarter = parts.length >= 4 ? `${parts[2]}-${parts[3]}` : "";
    const dateRange = getDateRange(semesterQuarter).replace(" - ", "-");

    try {
      setSubmitting(true);
      const start = new Date();
      const end = new Date(start.getTime() + 60 * 60 * 1000);

      const payload = {
        name: title,
        hosted: "iic",
        club_id: clubId,
        semester,
        quarter,
        start_datetime: start.toISOString(),
        end_datetime: end.toISOString(),
        status: "approved",
        event_type: "free",
        venue: "",
        city: "",
        country: "",
        additional_details: description,
        description: description,
        date_range: dateRange,
      };

      const { error } = await supabase.from("events").insert(payload);
      if (error) throw error;

      setSubmitSuccess("Event created successfully.");
      setCreateDialogOpen(false);
      fetchEvents();
      return true;
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : "Failed to create event");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    // filter state
    selectedSemester,
    setSelectedSemester,
    selectedClubId,
    setSelectedClubId,
    searchTerm,
    setSearchTerm,
    // events
    events,
    filteredEvents,
    fetchEvents,
    handleDeleteEvent,
    // clubs
    clubs,
    isLoadingClubs,
    // report dialog
    reportOpen,
    setReportOpen,
    reportData,
    reportLoading,
    handleViewReport,
    // create dialog
    createDialogOpen,
    setCreateDialogOpen,
    submitting,
    submitError,
    submitSuccess,
    handleCreateEvent,
    getDateRange,
  };
}
