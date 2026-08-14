"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import DetailsTab from "@/components/event-info/DetailsTab";
import FormsTab from "@/components/event-info/FormsTab";
import CouponsTab from "@/components/event-info/CouponsTab";
import TicketsTab from "@/components/event-info/TicketsTab";
import { useEventInfoData } from "@/components/event-info/useEventInfoData";
import type { TabType, Event } from "@/components/event-info/types";

interface EventInfoPageProps {
  event: Event;
  onEventUpdate: () => void;
}

const TABS: { id: TabType; label: string }[] = [
  { id: "details", label: "Event Details" },
  { id: "forms", label: "Forms" },
  { id: "coupons", label: "Coupons" },
  { id: "tickets", label: "Tickets" },
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
    <div className="p-6 bg-black min-h-screen">
      {/* Tab navigation */}
      <div className="mb-6">
        <h1 className="text-white text-lg font-medium mb-4">
          Club - Event Dashboard - {event?.name || "Event Info Page"}
        </h1>
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              className={
                activeTab === tab.id
                  ? "bg-white text-black hover:bg-gray-100 rounded-sm px-4 py-1 text-sm"
                  : "text-white hover:bg-neutral-800 rounded-sm px-4 py-1 text-sm"
              }
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
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
