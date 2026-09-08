"use client";
import logger from "@/lib/logger";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Eye,
  Check,
  X,
  CalendarDays,
  Users,
  DollarSign,
  FileText,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/lib/supabase/browserClient";
type DBEvent = {
  id: string;
  name: string;
  status: string;
  start_datetime: string;
  end_datetime?: string | null;
  theme?: string | null;
  event_type?: string | null;
  additional_details?: string | null;
  estimated_budget?: number | string | null;
  estimated_participants?: number | null;
  event_blueprint?: string | null;
  club_id?: string | null;
  clubs?: {
    name: string | null;
    avatar_url: string | null;
    email: string | null;
  } | null;
};

export function ManageSelfHostedEvents() {
  const [events, setEvents] = useState<DBEvent[]>([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<DBEvent | null>(null);

  useEffect(() => {
    let ignore = false;
    const loadEvents = async () => {
      // Fetch ALL self-hosted events that are pending approval (global view)
      const { data, error } = await supabase
        .from("events")
        .select(
          "id, name, status, start_datetime, end_datetime, theme, event_type, additional_details, estimated_budget, estimated_participants, event_blueprint, club_id, clubs(name, avatar_url, email)"
        )
        .eq("hosted", "self")
        .eq("status", "pending_approval")
        .order("created_at", { ascending: false });
      if (ignore) return;
      if (error) {
        logger.error("Failed to load events:", error.message);
        setEvents([]);
      } else {
        // Supabase typing sometimes infers related tables as arrays; cast safely
        setEvents(data as unknown as DBEvent[]);
      }
    };

    void loadEvents();
    const onFocus = () => {
      void loadEvents();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      ignore = true;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const handleApprove = async (eventId: string) => {
    const { error } = await supabase
      .from("events")
      .update({ status: "approved" })
      .eq("id", eventId);
    if (error) {
      logger.error("Approve failed:", error.message);
      return;
    }
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, status: "approved" } : e))
    );
  };

  const handleReject = async (eventId: string) => {
    const { error } = await supabase
      .from("events")
      .update({ status: "rejected" })
      .eq("id", eventId);
    if (error) {
      logger.error("Reject failed:", error.message);
      return;
    }
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, status: "rejected" } : e))
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge className="bg-neutral-600 hover:bg-neutral-700 text-white">
            Draft
          </Badge>
        );
      case "pending":
      case "pending_approval":
        return (
          <Badge className="bg-yellow-600 hover:bg-yellow-700 text-white">
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-600 hover:bg-green-700 text-white">
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-600 hover:bg-red-700 text-white">
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-neutral-600 hover:bg-neutral-700 text-white">
            Unknown
          </Badge>
        );
    }
  };

  return (
    <div className="p-6 dark:from-purple-950 dark:via-neutral-900 dark:to-black bg-gradient-to-tl from-pink-300 via-white to-white min-h-screen">
      <div className="mb-6">
        <h1 className="text-lg font-medium mb-4">
          Club - Admin Dashboard - Manage Self Hosted Events
        </h1>
      </div>

      <Card className="bg-neutral-800 border-neutral-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-700">
                <th className="text-left p-4 text-white font-medium">Club</th>
                <th className="text-left p-4 text-white font-medium">
                  Event Details
                </th>
                <th className="text-left p-4 text-white font-medium">
                  Date & Attendees
                </th>
                <th className="text-left p-4 text-white font-medium">Budget</th>
                <th className="text-left p-4 text-white font-medium">Status</th>
                <th className="text-left p-4 text-white font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-neutral-700 hover:bg-neutral-750"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={event.clubs?.avatar_url || "/placeholder.svg"}
                          alt={event.clubs?.name || "Club"}
                        />
                        <AvatarFallback className="bg-neutral-600 text-white">
                          {(event.clubs?.name || "Club")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-white font-medium text-sm">
                          {event.clubs?.name || "Unknown Club"}
                        </div>
                        <div className="text-neutral-400 text-xs">
                          {event.clubs?.email || ""}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="text-white font-medium text-sm mb-1">
                        {event.name}
                      </div>
                      <div className="text-neutral-400 text-xs mb-1">
                        {event.event_type || ""}
                      </div>
                      <div className="text-neutral-400 text-xs max-w-xs truncate">
                        {event.additional_details || ""}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="text-white text-sm">
                        {new Date(event.start_datetime).toLocaleDateString()}
                      </div>
                      <div className="text-neutral-400 text-xs">
                        {event.estimated_participants ?? 0} attendees
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-white font-medium text-sm">
                      {event.estimated_budget !== null &&
                      event.estimated_budget !== undefined &&
                      event.estimated_budget !== ""
                        ? `₹${Number(event.estimated_budget).toLocaleString()}`
                        : "—"}
                    </div>
                  </td>
                  <td className="p-4">{getStatusBadge(event.status)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-neutral-700 disabled:opacity-50"
                        disabled={event.status !== "pending_approval"}
                        onClick={() => {
                          if (event.status === "pending_approval") {
                            setSelectedEvent(event);
                            setViewOpen(true);
                          }
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {(event.status === "pending" ||
                        event.status === "pending_approval") && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleApprove(event.id)}
                            className="h-8 w-8 p-0 text-green-400 hover:text-green-300 hover:bg-neutral-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReject(event.id)}
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-neutral-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Event Modal */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-[90vw] xl:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Event Details
            </DialogTitle>
          </DialogHeader>

          {/* Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <div className="p-4">
                <div className="text-sm font-medium flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4" /> Overview
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-neutral-400">Name</p>
                    <p className="font-medium">{selectedEvent?.name ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Theme</p>
                    <p className="font-medium">{selectedEvent?.theme ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Event Type</p>
                    <Badge variant="secondary">
                      {selectedEvent?.event_type ?? "—"}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <div className="text-sm font-medium flex items-center gap-2 mb-3">
                  <CalendarDays className="h-4 w-4" /> Schedule
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-neutral-400">Start</p>
                    <p className="font-medium">
                      {selectedEvent?.start_datetime
                        ? new Date(
                            selectedEvent.start_datetime
                          ).toLocaleString()
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">End</p>
                    <p className="font-medium">
                      {selectedEvent?.end_datetime
                        ? new Date(selectedEvent.end_datetime).toLocaleString()
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <div className="text-sm font-medium flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4" /> Participants
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-400">Estimated</span>
                    <span className="font-medium">
                      {selectedEvent?.estimated_participants ?? "—"}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Budget */}
          <Card className="mt-4">
            <div className="p-4">
              <div className="text-sm font-medium flex items-center gap-2 mb-3">
                <DollarSign className="h-4 w-4" /> Budget
              </div>
              <div className="text-2xl font-bold text-green-500">
                {selectedEvent?.estimated_budget !== null &&
                selectedEvent?.estimated_budget !== undefined &&
                selectedEvent?.estimated_budget !== ""
                  ? `₹${Number(
                      selectedEvent.estimated_budget
                    ).toLocaleString()}`
                  : "—"}
              </div>
            </div>
          </Card>

          {/* Event Blueprint */}
          <Card className="mt-4">
            <div className="p-4">
              <div className="text-sm font-medium flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4" /> Event Blueprint
              </div>
              {selectedEvent?.event_blueprint ? (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={selectedEvent.event_blueprint}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Blueprint
                  </a>
                </Button>
              ) : (
                <p className="text-sm text-neutral-400">No file uploaded</p>
              )}
            </div>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
}
