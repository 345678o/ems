"use client";

import { useRouter } from "next/navigation";
import { Eye, Upload, FileDown, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CalendarEvent, ClubEvent } from "./types";
import { getReportStatus } from "./utils";

interface CalendarTableProps {
  isLoading: boolean;
  calendarEvents: CalendarEvent[];
  onViewEvent: (event: ClubEvent) => void;
  onRemoveFromCalendar: (calendarRowId: string) => void;
}

function capitalize(s: string) {
  return s
    .replace("-", " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function CalendarTable({
  isLoading,
  calendarEvents,
  onViewEvent,
  onRemoveFromCalendar,
}: CalendarTableProps) {
  const router = useRouter();

  return (
    <Card className="border-neutral-700">
      <CardHeader>
        <CardTitle className="text-2xl">My Event Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">S.No.</TableHead>
                <TableHead>Title of Activity</TableHead>
                <TableHead className="text-center">
                  View Activity Details
                </TableHead>
                <TableHead className="text-center">
                  Upload Activity Report
                </TableHead>
                <TableHead className="text-center">
                  Correct Status of Report Submission
                </TableHead>
                <TableHead>Reviewer&apos;s Comment</TableHead>
                <TableHead className="text-center">
                  Review for Request
                </TableHead>
                <TableHead className="text-center">Download Report</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-neutral-400 py-8"
                  >
                    Loading calendar events...
                  </TableCell>
                </TableRow>
              ) : calendarEvents.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-neutral-400 py-8"
                  >
                    No events added to calendar yet. Add IIC events from the IIC
                    Events tab.
                  </TableCell>
                </TableRow>
              ) : (
                calendarEvents.map((calEvent, index) => {
                  const event = calEvent.event;
                  if (!event) return null;

                  const status = getReportStatus(calEvent.after_event_report);

                  return (
                    <TableRow key={calEvent.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{event.name}</p>
                          <p className="text-xs text-neutral-500">
                            {event.quarter && event.semester && (
                              <span>
                                {capitalize(event.semester)} -{" "}
                                {capitalize(event.quarter)}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-neutral-500">
                            Type:{" "}
                            {event.event_type === "paid" ? "Paid" : "Free"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewEvent(event)}
                          className="border-neutral-600"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          onClick={() =>
                            router.push(`/club/event/${event.id}#after-event`)
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Upload
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={status.className}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">
                          {calEvent.reviewer_comment || "NA"}
                        </p>
                      </TableCell>
                      <TableCell className="text-center">
                        <p className="text-sm">
                          {calEvent.review_request || "NA"}
                        </p>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-neutral-600"
                          disabled
                        >
                          <FileDown className="w-4 h-4" />
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to remove this event from your calendar?"
                              )
                            ) {
                              onRemoveFromCalendar(calEvent.id);
                            }
                          }}
                          className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
