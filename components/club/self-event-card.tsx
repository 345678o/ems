"use client";

import { Eye, Download, Share2, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ClubEvent } from "./types";
import { getDateRangeDisplay, formatEventDate } from "./utils";

interface SelfEventCardProps {
  event: ClubEvent;
  onViewIic: (event: ClubEvent) => void;
}

export default function SelfEventCard({
  event,
  onViewIic,
}: SelfEventCardProps) {
  const router = useRouter();

  return (
    <div className="group relative overflow-hidden border border-white/80 bg-gradient-to-t from-purple-950 via-purple-800 to-purple-600">
      <div className="relative h-40 bg-neutral-900 flex items-center justify-center">
        <div className="text-neutral-400 text-sm">
          {event.event_type === "paid" ? "💰 Paid Event" : "🆓 Free Event"}
        </div>
      </div>

      <div className="bg-[#D9D9D9] px-5 py-4">
        <h3 className="text-2xl font-medium tracking-tight text-black">
          {event.name}
        </h3>
        <p className="text-sm text-neutral-600 mt-1">
          {event.hosted === "iic" && getDateRangeDisplay(event)
            ? `📅 ${getDateRangeDisplay(event)}`
            : `${formatEventDate(event.start_datetime)} - ${formatEventDate(event.end_datetime)}`}
        </p>
        <p className="text-xs text-neutral-500 mt-1">Status: {event.status}</p>

        {event.status === "approved" && (
          <div className="flex gap-4 mt-4">
            <button
              aria-label="View"
              className="text-black hover:scale-105 transition-transform"
              title="View Event"
              onClick={(e) => {
                e.stopPropagation();
                if (event.hosted === "iic") onViewIic(event);
              }}
            >
              <Eye className="w-6 h-6" />
            </button>
            {event.hosted !== "iic" && (
              <>
                <button
                  aria-label="Download"
                  className="text-black hover:scale-105 transition-transform"
                  title="Download Files"
                >
                  <Download className="w-6 h-6" />
                </button>
                <button
                  aria-label="Share"
                  className="text-black hover:scale-105 transition-transform"
                  title="Share Event"
                >
                  <Share2 className="w-6 h-6" />
                </button>
              </>
            )}
            <button
              aria-label="Settings"
              className="text-black hover:scale-105 transition-transform hover:animate-spinHalf"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/club/event/${event.id}`);
              }}
              title="Event Settings"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
