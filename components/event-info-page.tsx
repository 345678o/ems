"use client";

import { useState } from "react";
import { Anton } from "next/font/google";
import { ReceiptText, FileText, Ticket as TicketIcon, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import DetailsTab from "@/components/event-info/details-tab";
import FormsTab from "@/components/event-info/forms-tab";
import CouponsTab from "@/components/event-info/coupons-tab";
import TicketsTab from "@/components/event-info/tickets-tab";
import { useEventInfoData } from "@/components/event-info/useEventInfoData";
import type { TabType, Event } from "@/components/event-info/types";

const anton = Anton({ weight: "400", subsets: ["latin"] });

interface EventInfoPageProps {
  event: Event;
  onEventUpdate: () => void;
}

const TABS: { id: TabType; label: string; icon: typeof ReceiptText }[] = [
  { id: "details", label: "Event Details", icon: ReceiptText },
  { id: "forms", label: "Forms", icon: FileText },
  { id: "coupons", label: "Coupons", icon: Percent },
  { id: "tickets", label: "Tickets", icon: TicketIcon },
];

export function EventInfoPage({ event, onEventUpdate }: EventInfoPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>("details");

  const {
    isSaving,
    saveEventDetails,
    banners,
    setBanners,
    buildBannersJson,
    eventDetails,
    setEventDetails,
    formFields,
    newField,
    setNewField,
    addFormField,
    removeFormField,
    coupons,
    newCoupon,
    setNewCoupon,
    addCoupon,
    toggleCoupon,
    removeCoupon,
    tickets,
    newTicket,
    setNewTicket,
    addTicket,
    removeTicket,
    addInclusion,
    updateInclusion,
    removeInclusion,
  } = useEventInfoData(event, onEventUpdate);

  return (
    <div className="p-6 bg-[#141414] min-h-screen">
      {/* Tab navigation */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <ReceiptText className="w-6 h-6 text-blue-500" />
          <h1 className={`${anton.className} text-white text-2xl tracking-wide`}>
            Event Info
          </h1>
        </div>
        <p className="text-neutral-500 text-sm mb-4">{event?.name}</p>
        <div className="flex gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white text-black"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "details" && (
        <DetailsTab
          event={event}
          eventDetails={eventDetails}
          setEventDetails={setEventDetails}
          isSaving={isSaving}
          saveEventDetails={saveEventDetails}
          banners={banners}
          setBanners={setBanners}
          buildBannersJson={buildBannersJson}
        />
      )}
      {activeTab === "forms" && (
        <FormsTab
          formFields={formFields}
          newField={newField}
          setNewField={setNewField}
          addFormField={addFormField}
          removeFormField={removeFormField}
        />
      )}
      {activeTab === "coupons" && (
        <CouponsTab
          coupons={coupons}
          newCoupon={newCoupon}
          setNewCoupon={setNewCoupon}
          addCoupon={addCoupon}
          toggleCoupon={toggleCoupon}
          removeCoupon={removeCoupon}
        />
      )}
      {activeTab === "tickets" && (
        <TicketsTab
          tickets={tickets}
          newTicket={newTicket}
          setNewTicket={setNewTicket}
          addTicket={addTicket}
          removeTicket={removeTicket}
          addInclusion={addInclusion}
          updateInclusion={updateInclusion}
          removeInclusion={removeInclusion}
        />
      )}
    </div>
  );
}

export default EventInfoPage;
