"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { IICClub, CreateIICEventForm } from "./types";
import { getDateRange } from "./useIICEventCalendar";

interface CreateIICEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clubs: IICClub[];
  isLoadingClubs: boolean;
  submitting: boolean;
  submitError: string | null;
  submitSuccess: string | null;
  onSubmit: (form: CreateIICEventForm) => Promise<boolean>;
}

const EMPTY_FORM: CreateIICEventForm = {
  title: "",
  description: "",
  semesterQuarter: "",
  clubId: "",
};

export default function CreateIICEventDialog({
  open,
  onOpenChange,
  clubs,
  isLoadingClubs,
  submitting,
  submitError,
  submitSuccess,
  onSubmit,
}: CreateIICEventDialogProps) {
  const [form, setForm] = useState<CreateIICEventForm>(EMPTY_FORM);

  const handleClose = () => {
    setForm(EMPTY_FORM);
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    const ok = await onSubmit(form);
    if (ok) setForm(EMPTY_FORM);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
        else onOpenChange(true);
      }}
    >
      <DialogContent className="bg-neutral-900 text-white border-neutral-800">
        <DialogHeader>
          <DialogTitle>Create IIC Event</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm text-neutral-300">Title</label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="bg-neutral-800 border-neutral-700 text-white"
              placeholder="Enter event title"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm text-neutral-300">Description</label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="bg-neutral-800 border-neutral-700 text-white"
              placeholder="Enter event description"
            />
          </div>

          {/* Semester & Quarter */}
          <div className="space-y-2">
            <label className="text-sm text-neutral-300">
              Semester and Quarter
            </label>
            <Select
              value={form.semesterQuarter}
              onValueChange={(v) => setForm({ ...form, semesterQuarter: v })}
            >
              <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                <SelectValue placeholder="Select semester and quarter" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700">
                <SelectItem value="semester-1-quarter-1" className="text-white">
                  Semester 1 - Quarter 1
                </SelectItem>
                <SelectItem value="semester-1-quarter-2" className="text-white">
                  Semester 1 - Quarter 2
                </SelectItem>
                <SelectItem value="semester-2-quarter-3" className="text-white">
                  Semester 2 - Quarter 3
                </SelectItem>
                <SelectItem value="semester-2-quarter-4" className="text-white">
                  Semester 2 - Quarter 4
                </SelectItem>
              </SelectContent>
            </Select>
            {form.semesterQuarter && (
              <p className="text-sm text-blue-400 mt-2">
                📅 Date Range: {getDateRange(form.semesterQuarter)}
              </p>
            )}
          </div>

          {/* Club */}
          <div className="space-y-2">
            <label className="text-sm text-neutral-300">Club</label>
            <Select
              value={form.clubId}
              onValueChange={(v) => setForm({ ...form, clubId: v })}
            >
              <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                <SelectValue
                  placeholder={
                    isLoadingClubs ? "Loading clubs..." : "Select a club"
                  }
                />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700">
                {clubs.map((c) => (
                  <SelectItem
                    key={c.id}
                    value={c.id}
                    className="text-white hover:cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={c.avatar_url || ""} alt={c.name} />
                        <AvatarFallback>
                          {c.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{c.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {submitError && <p className="text-sm text-red-400">{submitError}</p>}
          {submitSuccess && (
            <p className="text-sm text-green-400">{submitSuccess}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={handleClose}
            className="text-neutral-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {submitting ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
