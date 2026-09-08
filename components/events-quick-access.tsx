"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/browserClient";
import { format, parseISO, isAfter } from "date-fns";

interface UpcomingEvent {
  id: string;
  name: string;
  start_datetime: string;
  venue?: string;
  status: string;
  event_type: string;
}

export function EventsQuickAccess() {
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from("events")
          .select("id, name, start_datetime, venue, status, event_type")
          .gte("start_datetime", now)
          .eq("status", "approved")
          .order("start_datetime", { ascending: true })
          .limit(3);

        if (error) throw error;
        setUpcomingEvents(data || []);
      } catch (error) {
        console.error("Error fetching upcoming events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarIcon className="w-5 h-5" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : upcomingEvents.length === 0 ? (
          <p className="text-muted-foreground text-sm">No upcoming events</p>
        ) : (
          upcomingEvents.map((event) => (
            <div key={event.id} className="border rounded-lg p-3 hover:bg-accent transition-colors">
              <h4 className="font-medium text-sm mb-1 line-clamp-1">{event.name}</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Clock className="w-3 h-3" />
                {format(parseISO(event.start_datetime), "MMM d, h:mm a")}
              </div>
              {event.venue && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <MapPin className="w-3 h-3" />
                  <span className="line-clamp-1">{event.venue}</span>
                </div>
              )}
              <div className="flex gap-1">
                <Badge variant="outline" className="text-xs">
                  {event.event_type}
                </Badge>
              </div>
            </div>
          ))
        )}
        
        <Link href="/events">
          <Button variant="outline" className="w-full" size="sm">
            View All Events
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}