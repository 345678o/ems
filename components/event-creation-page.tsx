"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Edit, Trash2, Info } from "lucide-react";
import { supabase } from "@/lib/supabase/browserClient";
import { useRouter } from "next/navigation";
import OptionWheel from "@/components/OptionWheel";

const EVENT_THEMES = [
  "Hackathon",
  "Workshop",
  "Bootcamp",
  "Seminar",
  "Tech Talk",
  "Competition",
  "Cultural Fest",
  "Other",
];

interface Ticket {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  price: number;
  soldOut: boolean;
  popular?: boolean;
}

export function EventCreationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [eventData, setEventData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    timezone: "IST",
    eventType: "paid",
    eventMode: "",
    currency: "GBP",
    theme: EVENT_THEMES[0],
  });

  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: "1",
      name: "Regular Ticket",
      startDate: "Sept 10",
      endDate: "Sept 9, 2025",
      price: 1000,
      soldOut: true,
      popular: true,
    },
  ]);

  const addNewTicket = () => {
    const newTicket: Ticket = {
      id: Date.now().toString(),
      name: "New Ticket",
      startDate: "",
      endDate: "",
      price: 0,
      soldOut: false,
    };
    setTickets([...tickets, newTicket]);
  };

  const removeTicket = (id: string) => {
    setTickets(tickets.filter((ticket) => ticket.id !== id));
  };

  const toggleSoldOut = (id: string) => {
    setTickets(
      tickets.map((ticket) =>
        ticket.id === id ? { ...ticket, soldOut: !ticket.soldOut } : ticket
      )
    );
  };

  const createEvent = async () => {
    // Validate required fields
    if (
      !eventData.name ||
      !eventData.startDate ||
      !eventData.endDate ||
      !eventData.eventMode
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      // For now, we'll use a placeholder club_id. In a real app, this would come from the authenticated user's club
      const clubId = "00000000-0000-0000-0000-000000000000"; // Placeholder UUID

      // Convert dates to proper format
      const startDateTime = new Date(eventData.startDate).toISOString();
      const endDateTime = new Date(eventData.endDate).toISOString();

      const { error } = await supabase
        .from("events")
        .insert([
          {
            club_id: clubId,
            name: eventData.name,
            theme: eventData.theme,
            start_datetime: startDateTime,
            end_datetime: endDateTime,
            event_type: eventData.eventType,
            venue: eventData.eventMode === "offline" ? "TBD" : "Online",
            city: eventData.eventMode === "offline" ? "TBD" : "Online",
            country: eventData.eventMode === "offline" ? "TBD" : "Online",
            additional_details: `Event Mode: ${eventData.eventMode}, Currency: ${eventData.currency}`,
            status: "draft",
          },
        ])
        .select();

      if (error) {
        console.error("Error creating event:", error);
        alert("Error creating event. Please try again.");
        return;
      }

      alert("Event created successfully!");

      // Navigate back to the events page and refresh
      router.push("/club");
      router.refresh();
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Error creating event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-black min-h-screen">
      <div className="mb-6">
        <h1 className="text-white text-lg font-medium mb-4">
          Club - Event Dashboard - Create Event
        </h1>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Event Name */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label htmlFor="eventName" className="text-white">
              Event Name
            </Label>
            <span className="text-red-500">*</span>
            <Info className="w-4 h-4 text-neutral-400" />
          </div>
          <Input
            id="eventName"
            placeholder="Event Name"
            value={eventData.name}
            onChange={(e) =>
              setEventData({ ...eventData, name: e.target.value })
            }
            className="bg-neutral-800 border-neutral-600 text-white placeholder:text-neutral-400"
          />
        </div>

        {/* Event Theme */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label className="text-white">Event Theme</Label>
            <span className="text-red-500">*</span>
            <Info className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="relative h-32 w-full max-w-sm rounded-lg border border-neutral-600 bg-neutral-800 overflow-hidden">
            <OptionWheel
              items={EVENT_THEMES}
              defaultSelected={0}
              side="left"
              fontSize={1.2}
              spacing={1.5}
              curve={0.6}
              tilt={5}
              blur={1.5}
              fade={0.3}
              inset={24}
              textColor="#8a8a8a"
              activeColor="#ffffff"
              onChange={(_index: number, item: string) =>
                setEventData((prev) => ({ ...prev, theme: item }))
              }
            />
          </div>
        </div>

        {/* Date Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="startDate" className="text-white">
                Starts On
              </Label>
              <span className="text-red-500">*</span>
            </div>
            <div className="relative">
              <Input
                id="startDate"
                type="date"
                value={eventData.startDate}
                onChange={(e) =>
                  setEventData({ ...eventData, startDate: e.target.value })
                }
                className="bg-neutral-800 border-neutral-600 text-white pr-16"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-neutral-400" />
                <span className="text-xs text-blue-400">IST</span>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="endDate" className="text-white">
                Ends On
              </Label>
              <span className="text-red-500">*</span>
            </div>
            <div className="relative">
              <Input
                id="endDate"
                type="date"
                value={eventData.endDate}
                onChange={(e) =>
                  setEventData({ ...eventData, endDate: e.target.value })
                }
                className="bg-neutral-800 border-neutral-600 text-white pr-16"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-neutral-400" />
                <span className="text-xs text-blue-400">IST</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timezone and Event Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label className="text-white">Time Zone</Label>
              <span className="text-red-500">*</span>
              <Info className="w-4 h-4 text-neutral-400" />
            </div>
            <Select
              value={eventData.timezone}
              onValueChange={(value) =>
                setEventData({ ...eventData, timezone: value })
              }
            >
              <SelectTrigger className="bg-neutral-800 border-neutral-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IST">
                  (GMT+5:30) Chennai, Kolkata, Mumbai, New Delhi
                </SelectItem>
                <SelectItem value="PST">
                  (GMT-8:00) Pacific Standard Time
                </SelectItem>
                <SelectItem value="EST">
                  (GMT-5:00) Eastern Standard Time
                </SelectItem>
              </SelectContent>
            </Select>
            <div className="text-xs text-blue-400 mt-1">IST (GMT+05:30)</div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label className="text-white">Event Type</Label>
              <span className="text-red-500">*</span>
              <Info className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="flex gap-2">
              <Button
                variant={eventData.eventType === "free" ? "default" : "outline"}
                onClick={() =>
                  setEventData({ ...eventData, eventType: "free" })
                }
                className={
                  eventData.eventType === "free"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-transparent border-neutral-600 text-white hover:bg-neutral-800"
                }
              >
                Free
              </Button>
              <Button
                variant={eventData.eventType === "paid" ? "default" : "outline"}
                onClick={() =>
                  setEventData({ ...eventData, eventType: "paid" })
                }
                className={
                  eventData.eventType === "paid"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-transparent border-neutral-600 text-white hover:bg-neutral-800"
                }
              >
                Paid
              </Button>
            </div>
          </div>
        </div>

        {/* Event Mode and Currency */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label className="text-white">Event Mode</Label>
              <span className="text-red-500">*</span>
              <Info className="w-4 h-4 text-neutral-400" />
            </div>
            <Select
              value={eventData.eventMode}
              onValueChange={(value) =>
                setEventData({ ...eventData, eventMode: value })
              }
            >
              <SelectTrigger className="bg-neutral-800 border-neutral-600 text-white">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label className="text-white">Currency</Label>
              <span className="text-red-500">*</span>
              <Info className="w-4 h-4 text-neutral-400" />
            </div>
            <Select
              value={eventData.currency}
              onValueChange={(value) =>
                setEventData({ ...eventData, currency: value })
              }
            >
              <SelectTrigger className="bg-neutral-800 border-neutral-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="INR">INR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tickets Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-lg font-medium">Tickets</h2>
            <Button
              onClick={addNewTicket}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              New Ticket
            </Button>
          </div>

          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="bg-neutral-900 border-neutral-700 relative"
              >
                {ticket.popular && (
                  <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs px-2 py-1 rounded transform -rotate-12">
                    POPULAR
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          1
                        </div>
                        <h3 className="text-white font-medium">
                          {ticket.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-4 text-neutral-400 text-sm mb-3">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-neutral-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-neutral-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-neutral-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-neutral-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-neutral-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-neutral-400 rounded-full"></div>
                        </div>
                        <span>
                          {ticket.startDate} - {ticket.endDate}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={ticket.soldOut}
                            onCheckedChange={() => toggleSoldOut(ticket.id)}
                          />
                          <span className="text-white text-sm">Sold Out</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-400 hover:text-blue-300 p-1"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTicket(ticket.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-white text-xl font-bold">
                        £{ticket.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-6">
          <div className="flex items-center gap-2">
            <Checkbox />
            <span className="text-white text-sm">I&apos;m not a robot</span>
            <div className="ml-2 text-xs text-neutral-400">
              reCAPTCHA
              <br />
              Privacy - Terms
            </div>
          </div>

          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            onClick={createEvent}
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Event"}
          </Button>
        </div>
      </div>
    </div>
  );
}
