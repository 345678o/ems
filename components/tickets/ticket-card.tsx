"use client";
// app/components/tickets/TicketCard.tsx

import React from "react";
import { Ticket, CalendarDays, Clock } from "lucide-react";

export type TicketCardProps = {
  tier?: "GOLD" | "SILVER" | "PLATINUM" | string;
  ticketNo: string;
  dateRange: string; // e.g., "1 - 3 August"
  timeLabel: string; // e.g., "From 10 AM"
  onView?: () => void;
};

export const TicketCard: React.FC<TicketCardProps> = ({
  tier = "GOLD",
  ticketNo,
  dateRange,
  timeLabel,
  onView,
}) => {
  return (
    <div
      className="
        relative w-full
        rounded-[22px]
        bg-white
        shadow-sm
        border-4 border-neutral-900/90
        px-5 py-4 sm:px-6 sm:py-5
        text-neutral-900
      "
      style={{
        borderRadius: "24px",
      }}
    >
      {/* top row: brand + tier pill */}
      <div className="flex items-start justify-between gap-4">
        {/* Brand block */}
        <div className="min-w-0">
          <div className="text-[10px] font-extrabold leading-none tracking-widest">
            THE
          </div>
          <div className="mt-1 flex items-center gap-1">
            {/* EQUIN */}
            <span className="text-3xl sm:text-[34px] leading-none font-extrabold">
              EQUI
            </span>
            {/* N */}
            <span className="text-3xl sm:text-[34px] leading-none font-extrabold -ml-1">
              N
            </span>
            {/* O (disco sphere) */}
            <span className="inline-flex items-center justify-center -ml-0.5">
              <svg
                width="26"
                height="26"
                viewBox="0 0 26 26"
                aria-hidden="true"
                className="shrink-0"
              >
                <circle
                  cx="13"
                  cy="13"
                  r="12"
                  fill="none"
                  stroke="black"
                  strokeWidth="1.5"
                />
                {/* longitude lines */}
                <path d="M13 1.5v23" stroke="black" strokeWidth="1" />
                <path
                  d="M7 2.8c2.5 2.9 2.5 17.5 0 20.4"
                  stroke="black"
                  strokeWidth="1"
                  fill="none"
                />
                <path
                  d="M19 2.8c-2.5 2.9-2.5 17.5 0 20.4"
                  stroke="black"
                  strokeWidth="1"
                  fill="none"
                />
                {/* latitude lines */}
                <path
                  d="M2.8 7c2.9 2.5 17.5 2.5 20.4 0"
                  stroke="black"
                  strokeWidth="1"
                  fill="none"
                />
                <path
                  d="M2.8 19c2.9-2.5 17.5-2.5 20.4 0"
                  stroke="black"
                  strokeWidth="1"
                  fill="none"
                />
              </svg>
            </span>
            {/* X */}
            <span className="text-3xl sm:text-[34px] leading-none font-extrabold -ml-0.5">
              X
            </span>
          </div>
          <div className="text-[10px] sm:text-[11px] font-black tracking-widest leading-tight mt-1">
            E-SUMMIT 2K24
          </div>
        </div>

        {/* Tier pill */}
        <div
          className="
            rounded-full px-4 py-1 text-xs font-extrabold
            bg-yellow-400 text-neutral-900
            shadow-[inset_0_-1px_0_rgba(0,0,0,0.15)]
            select-none
          "
        >
          {tier}
        </div>
      </div>

      {/* content row */}
      <div className="mt-4 flex items-center gap-4 sm:gap-6">
        {/* left: details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 text-[15px] sm:text-base">
            <Ticket className="h-5 w-5 text-neutral-900" strokeWidth={2.8} />
            <span className="font-medium">{ticketNo}</span>
          </div>

          <div className="mt-3 flex items-center gap-3 text-[15px] sm:text-base">
            <CalendarDays
              className="h-5 w-5 text-neutral-900"
              strokeWidth={2.6}
            />
            <span className="font-medium">{dateRange}</span>
          </div>

          <div className="mt-3 flex items-center gap-3 text-[15px] sm:text-base">
            <Clock className="h-5 w-5 text-neutral-900" strokeWidth={2.6} />
            <span className="font-medium">{timeLabel}</span>
          </div>
        </div>

        {/* right: QR + CTA */}
        <div className="relative shrink-0">
          {/* QR placeholder (blurred look to match reference) */}
          <div
            className="
              h-28 w-28 sm:h-32 sm:w-32
              rounded-lg bg-neutral-200
              overflow-hidden
              relative
              ring-1 ring-neutral-300
            "
          >
            {/* Fake “QR noise” pattern */}
            <div className="absolute inset-0 [background:radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px] opacity-40 blur-[1px]" />
            <div className="absolute inset-0 backdrop-blur-[2px] opacity-70" />
          </div>

          {/* Button overlay */}
          <button
            onClick={onView}
            className="
              absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2
              rounded-full px-4 py-1.5 text-sm font-extrabold
              bg-yellow-400 text-neutral-900 shadow
              hover:brightness-95 active:scale-[0.98]
              transition
            "
            type="button"
          >
            View Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

TicketCard.displayName = "TicketCard";

export default TicketCard;
