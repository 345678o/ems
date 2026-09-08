"use client";

import Link from "next/link";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FloatingCalendarButton() {
  return (
    <Link href="/events">
      <Button
        size="lg"
        className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 h-14 w-14 p-0 group"
        title="View Events Calendar"
      >
        <CalendarIcon className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
      </Button>
    </Link>
  );
}

export function EventsCalendarBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-4 rounded-lg shadow-lg mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-8 w-8" />
          <div>
            <h3 className="text-lg font-semibold">Events Calendar</h3>
            <p className="text-sm opacity-90">View all events in calendar and list format</p>
          </div>
        </div>
        <Link href="/events">
          <Button 
            variant="secondary" 
            className="bg-white/20 hover:bg-white/30 text-white border-white/20"
          >
            View Calendar
          </Button>
        </Link>
      </div>
    </div>
  );
}