"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, Eye, Trash2, XCircle } from "lucide-react";
import type { IICEventData } from "./types";

function capitalize(s: string) {
  return s
    .replace("-", " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface IICEventTableProps {
  events: IICEventData[];
  onViewReport: (eventId: string) => void;
  onDeleteEvent: (eventId: string) => void;
}

export default function IICEventTable({
  events,
  onViewReport,
  onDeleteEvent,
}: IICEventTableProps) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
      <Table>
        <TableHeader>
          <TableRow className="border-neutral-200 dark:border-neutral-800">
            <TableHead className="text-black dark:text-white font-semibold">
              Event Title
            </TableHead>
            <TableHead className="text-black dark:text-white font-semibold">
              Semester
            </TableHead>
            <TableHead className="text-black dark:text-white font-semibold">
              Quarter
            </TableHead>
            <TableHead className="text-black dark:text-white font-semibold">
              Assigned Club
            </TableHead>
            <TableHead className="text-black dark:text-white font-semibold text-center">
              Report Submitted
            </TableHead>
            <TableHead className="text-black dark:text-white font-semibold text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-neutral-500 dark:text-neutral-400 py-8"
              >
                No events found
              </TableCell>
            </TableRow>
          ) : (
            events.map((event) => (
              <TableRow
                key={event.id}
                className="border-neutral-200 dark:border-neutral-800"
              >
                <TableCell className="font-medium text-black dark:text-white">
                  {event.title}
                </TableCell>
                <TableCell>
                  {event.semester && (
                    <Badge
                      variant="outline"
                      className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                    >
                      {capitalize(event.semester)}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {event.quarter && (
                    <Badge
                      variant="outline"
                      className="bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                    >
                      {capitalize(event.quarter)}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-black dark:text-white">
                  {event.club_name}
                </TableCell>
                <TableCell className="text-center">
                  {event.has_report ? (
                    <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-sm">Yes</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1 text-red-600 dark:text-red-400">
                      <XCircle className="w-5 h-5" />
                      <span className="text-sm">No</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewReport(event.id)}
                      className="text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      title="View Event Report"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteEvent(event.id)}
                      className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
