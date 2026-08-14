import type { ClubEvent, CalendarEvent } from "./types";

/** Convert an event's semester/quarter fields to a human-readable date range. */
export function getDateRangeDisplay(event: ClubEvent): string {
  if (event.date_range) return event.date_range.replace("-", " - ");
  if (event.semester && event.quarter) {
    const sq = `${event.semester}-${event.quarter}`;
    if (sq === "semester-1-quarter-1") return "September - November";
    if (sq === "semester-1-quarter-2") return "December - February";
    if (sq === "semester-2-quarter-3") return "March - May";
    if (sq === "semester-2-quarter-4") return "June - August";
  }
  return "";
}

export type ReportStatusInfo = { label: string; className: string };

/** Compute badge label + Tailwind class string from an after-event report snapshot. */
export function getReportStatus(
  report: CalendarEvent["after_event_report"]
): ReportStatusInfo {
  if (!report) {
    return {
      label: "Not Started",
      className:
        "bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700",
    };
  }
  const { report_submitted, media_uploaded, social_media_promoted } = report;
  if (report_submitted && media_uploaded && social_media_promoted) {
    return {
      label: "Completed",
      className:
        "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
    };
  }
  if (report_submitted && media_uploaded) {
    return {
      label: "Media Uploaded",
      className:
        "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    };
  }
  if (report_submitted) {
    return {
      label: "Report Submitted",
      className:
        "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
    };
  }
  return {
    label: "Not Started",
    className:
      "bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700",
  };
}

export function formatEventDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
