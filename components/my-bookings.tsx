// app/components/tickets/MyBookings.tsx
"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useMediaQuery } from "@/hooks/use-media-query";
import { TicketCard } from "./tickets/TicketCard"; // ← your card with the "View Ticket" button
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";

type TicketItem = {
  id: number;
  tier: string;
  ticketNo: string;
  dateRange: string;
  timeLabel: string;
};

// Hoisted outside MyBookings so React doesn't recreate it on every render.
function TicketDesign({ selected }: { selected: TicketItem | null }) {
  if (!selected) return null;
  return (
    <div className="w-full flex justify-center">
      <div className="relative w-[620px] max-w-[92vw]">
        <Image
          src="/elements/ticket.svg"
          alt="Ticket"
          width={1200}
          height={600}
          priority
          className="w-full h-auto block"
        />
        <div className="pointer-events-none absolute inset-0">
          <p className="absolute right-[9%] top-1/2 -translate-y-1/2 text-[18px] tracking-wide text-black">
            ID: {selected.ticketNo}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MyBookings() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<TicketItem | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Sample data
  const tickets: TicketItem[] = useMemo(
    () => [
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
    ],
    []
  );

  const handleView = (t: TicketItem) => {
    setSelected(t);
    setOpen(true);
  };

  return (
    <>
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
              // IMPORTANT: clicking the pill opens the modal/drawer
              onView={() => handleView(t)}
            />
          ))}
        </div>
      </div>

      {/* Desktop: Dialog; Mobile: Drawer */}
      {isDesktop ? (
        <Dialog open={open} onOpenChange={setOpen}>
          {/* Transparent chrome, ticket only */}
          <DialogContent
            className="p-0 bg-transparent border-none shadow-none max-w-[680px]"
            showCloseButton={false}
          >
            <TicketDesign selected={selected} />
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="border-none">
            <div className="py-6">
              <TicketDesign selected={selected} />
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}
