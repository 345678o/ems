"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import type { ClubEvent } from "./types";
import { getDateRangeDisplay, formatEventDate } from "./utils";

interface IICCardProps {
  event: ClubEvent;
  isInCalendar: boolean;
  onViewDetails: (event: ClubEvent) => void;
  onAddToCalendar: (eventId: string) => void;
  onRemoveFromCalendar: (eventId: string) => void;
}

function capitalize(s: string) {
  return s
    .replace("-", " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function IICCard({
  event,
  isInCalendar,
  onViewDetails,
  onAddToCalendar,
  onRemoveFromCalendar,
}: IICCardProps) {
  const dateLabel =
    event.hosted === "iic" && getDateRangeDisplay(event)
      ? `📅 ${getDateRangeDisplay(event)}`
      : `${formatEventDate(event.start_datetime)} - ${formatEventDate(event.end_datetime)}`;

  return (
    <div className="p-[2px] bg-gradient-to-tl from-[#3A3CBA] via-[#FF1D1D] to-[#FCB045] rounded-lg h-full">
      <Card className="bg-white dark:bg-neutral-900 border-0 h-full flex flex-col">
        <CardHeader className="flex-none">
          <CardTitle
            className="text-black dark:text-white leading-snug break-words text-lg"
            title={event.name}
          >
            {event.name}
          </CardTitle>
        </CardHeader>

        <div className="flex-grow" />

        {/* Meta row */}
        <div className="flex items-center justify-between px-6 pb-2">
          <div className="text-neutral-600 dark:text-neutral-400 text-sm">
            {dateLabel}
          </div>
          {(event.semester || event.quarter) && (
            <div className="flex gap-2">
              {event.semester && (
                <Badge
                  variant="outline"
                  className="text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                >
                  {capitalize(event.semester)}
                </Badge>
              )}
              {event.quarter && (
                <Badge
                  variant="outline"
                  className="text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                >
                  {capitalize(event.quarter)}
                </Badge>
              )}
            </div>
          )}
        </div>

        {event.status === "approved" && (
          <CardFooter className="flex-none justify-between gap-3 border-t border-neutral-200 dark:border-neutral-700 py-3 px-6">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(event);
              }}
              className="border-neutral-300 dark:border-neutral-600 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              View Details
            </Button>
            {isInCalendar ? (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFromCalendar(event.id);
                }}
                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white"
              >
                Remove from Calendar
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCalendar(event.id);
                }}
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-600 dark:hover:text-white"
              >
                Add to Calendar
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
