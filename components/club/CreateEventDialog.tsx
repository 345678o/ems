"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import GradientButton from "@/components/ui/gradient-button";
import DateTimePicker from "./DateTimePicker";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionUserId: string | null;
  onCreated: () => Promise<void>;
}

export default function CreateEventDialog({
  open,
  onOpenChange,
  sessionUserId,
  onCreated,
}: CreateEventDialogProps) {
  const [name, setName] = useState("");
  const [theme, setTheme] = useState("");
  const [startDatetime, setStartDatetime] = useState("");
  const [endDatetime, setEndDatetime] = useState("");
  const [estimatedParticipants, setEstimatedParticipants] = useState<
    number | ""
  >("");
  const [estimatedBudget, setEstimatedBudget] = useState<number | "">("");
  const [eventBlueprint, setEventBlueprint] = useState<File | null>(null);
  const [eventType, setEventType] = useState<"free" | "paid">("free");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setTheme("");
    setStartDatetime("");
    setEndDatetime("");
    setEstimatedParticipants("");
    setEstimatedBudget("");
    setEventBlueprint(null);
    setEventType("free");
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (
      !name ||
      !theme ||
      !startDatetime ||
      !endDatetime ||
      estimatedParticipants === "" ||
      estimatedBudget === "" ||
      !eventBlueprint ||
      !eventType
    ) {
      setFormError("All fields are required");
      return;
    }
    if (new Date(endDatetime) < new Date(startDatetime)) {
      setFormError("End date/time must be after start date/time");
      return;
    }
    if (eventBlueprint.type !== "application/pdf") {
      setFormError("Event blueprint must be a PDF file");
      return;
    }
    if (eventBlueprint.size > 200 * 1024) {
      setFormError("Event blueprint must be 200KB or smaller");
      return;
    }

    if (!sessionUserId) {
      setFormError("No session. Please sign in again.");
      return;
    }

    try {
      setFormSubmitting(true);

      const fd = new FormData();
      fd.append("name", name);
      fd.append("theme", theme);
      fd.append("start_datetime", startDatetime);
      fd.append("end_datetime", endDatetime);
      fd.append("estimated_participants", String(estimatedParticipants));
      fd.append("estimated_budget", String(estimatedBudget));
      fd.append("club_id", sessionUserId);
      fd.append("event_blueprint", eventBlueprint);
      fd.append("event_type", eventType);

      const res = await fetch("/api/events/create", {
        method: "POST",
        body: fd,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(json?.error || `Request failed with ${res.status}`);
        return;
      }

      onOpenChange(false);
      resetForm();
      await onCreated();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) resetForm();
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Input
                id="theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                required
              />
            </div>
            <DateTimePicker
              id="start_datetime"
              label="Start Date & Time"
              value={startDatetime}
              onChange={setStartDatetime}
            />
            <DateTimePicker
              id="end_datetime"
              label="End Date & Time"
              value={endDatetime}
              onChange={setEndDatetime}
            />
            <div className="space-y-2">
              <Label>Event Type</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={eventType === "free"}
                    onChange={() => setEventType("free")}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>Free</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={eventType === "paid"}
                    onChange={() => setEventType("paid")}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>Paid</span>
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated_participants">
                Estimated Participants
              </Label>
              <Input
                id="estimated_participants"
                type="number"
                min={1}
                value={estimatedParticipants as number | undefined}
                onChange={(e) =>
                  setEstimatedParticipants(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated_budget">Estimated Budget</Label>
              <Input
                id="estimated_budget"
                type="number"
                min={0}
                step="0.01"
                value={estimatedBudget as number | undefined}
                onChange={(e) =>
                  setEstimatedBudget(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event_blueprint">
              Event Blueprint (PDF, max 200KB)
            </Label>
            <Input
              id="event_blueprint"
              type="file"
              accept="application/pdf"
              onChange={(e) => setEventBlueprint(e.target.files?.[0] || null)}
              required
            />
          </div>

          {formError && <p className="text-sm text-red-500">{formError}</p>}

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
              disabled={formSubmitting}
            >
              Cancel
            </Button>
            <GradientButton
              type="submit"
              disabled={formSubmitting}
              className="text-md"
            >
              {formSubmitting ? "Submitting..." : "Submit for approval"}
            </GradientButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
