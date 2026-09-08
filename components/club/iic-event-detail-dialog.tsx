"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ClubEvent } from "./types";
import { getDateRangeDisplay } from "./utils";

interface IICEventDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: ClubEvent | null;
}

export default function IICEventDetailDialog({
  open,
  onOpenChange,
  event,
}: IICEventDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[520px] overflow-y-auto scrollbar-track-amber-200">
        <DialogHeader>
          <DialogTitle>IIC Event Details</DialogTitle>
        </DialogHeader>

        {event && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-600">
                Event Name
              </label>
              <p className="text-base font-semibold">{event.name}</p>
            </div>

            {event.description && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-600">
                  Description
                </label>
                <p className="text-sm">{event.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {event.semester && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-600">
                    Semester
                  </label>
                  <p className="text-sm capitalize">
                    {event.semester.replace("-", " ")}
                  </p>
                </div>
              )}
              {event.quarter && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-600">
                    Quarter
                  </label>
                  <p className="text-sm capitalize">
                    {event.quarter.replace("-", " ")}
                  </p>
                </div>
              )}
            </div>

            {getDateRangeDisplay(event) && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-600">
                  Date Range
                </label>
                <p className="text-sm text-blue-600 font-medium">
                  📅 {getDateRangeDisplay(event)}
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
