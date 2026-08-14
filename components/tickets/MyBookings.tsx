// app/components/tickets/MyBookings.tsx
"use client";
import React from "react";
import { TicketCard } from "./TicketCard";

function MyBookings() {
  // Use your real data here
  const tickets = [
    {
      id: 1,
      tier: "GOLD",
      ticketNo: "696969",
      dateRange: "1 - 3 August",
      timeLabel: "From 10 AM",
    },
    {
      id: 2,
      tier: "GOLD",
      ticketNo: "884211",
      dateRange: "1 - 3 August",
      timeLabel: "From 10 AM",
    },
    {
      id: 3,
      tier: "GOLD",
      ticketNo: "550021",
      dateRange: "1 - 3 August",
      timeLabel: "From 10 AM",
    },
    {
      id: 4,
      tier: "GOLD",
      ticketNo: "771145",
      dateRange: "1 - 3 August",
      timeLabel: "From 10 AM",
    },
    {
      id: 5,
      tier: "GOLD",
      ticketNo: "220045",
      dateRange: "1 - 3 August",
      timeLabel: "From 10 AM",
    },
    {
      id: 6,
      tier: "GOLD",
      ticketNo: "915502",
      dateRange: "1 - 3 August",
      timeLabel: "From 10 AM",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-8 text-center">My Bookings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((t) => (
          <TicketCard
            key={t.id}
            tier={t.tier}
            ticketNo={t.ticketNo}
            dateRange={t.dateRange}
            timeLabel={t.timeLabel}
            onView={() => {
              /* TODO: open ticket detail */
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default MyBookings;
