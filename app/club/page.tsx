"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

import { useClubEvents } from "@/components/club/useClubEvents";
import AddEventCard from "@/components/club/AddEventCard";
import SelfEventCard from "@/components/club/SelfEventCard";
import IICCard from "@/components/club/IICCard";
import CreateEventDialog from "@/components/club/CreateEventDialog";
import IICEventDetailDialog from "@/components/club/IICEventDetailDialog";
import CalendarTable from "@/components/club/CalendarTable";
import type { ClubEvent } from "@/components/club/types";

export default function EventsPage() {
  const { data: session, status: authStatus } = useSession();
  const sessionUserId = session?.user?.id ?? null;

  const {
    iicEvents,
    selfEvents,
    calendarEvents,
    isLoading,
    fetchEvents,
    addToCalendar,
    removeFromCalendar,
    removeFromCalendarById,
    isEventInCalendar,
  } = useClubEvents(authStatus === "loading" ? null : sessionUserId);

  // Tab state
  const [activeTab, setActiveTab] = useState("iic");
  const [selfHostedTab, setSelfHostedTab] = useState("current");

  // IIC filter state
  const [iicSearchTerm, setIicSearchTerm] = useState("");
  const [iicSemesterFilter, setIicSemesterFilter] = useState("all");

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedIicEvent, setSelectedIicEvent] = useState<ClubEvent | null>(
    null
  );

  const handleViewIicEvent = (event: ClubEvent) => {
    setSelectedIicEvent(event);
    setDetailDialogOpen(true);
  };

  // Derived lists
  const currentSelfEvents = useMemo(
    () => selfEvents.filter((e) => new Date(e.end_datetime) >= new Date()),
    [selfEvents]
  );
  const pastSelfEvents = useMemo(
    () => selfEvents.filter((e) => new Date(e.end_datetime) < new Date()),
    [selfEvents]
  );
  const filteredIicEvents = useMemo(() => {
    return iicEvents.filter((event) => {
      const matchesSearch = event.name
        .toLowerCase()
        .includes(iicSearchTerm.toLowerCase());
      let matchesFilter = true;
      if (iicSemesterFilter && iicSemesterFilter !== "all") {
        const sq =
          event.semester && event.quarter
            ? `${event.semester}-${event.quarter}`
            : "";
        matchesFilter = sq === iicSemesterFilter;
      }
      return matchesSearch && matchesFilter;
    });
  }, [iicEvents, iicSearchTerm, iicSemesterFilter]);

  const TAB_CLS =
    "bg-transparent shadow-none rounded-none border-b-2 border-transparent px-0 py-6 text-neutral-600 hover:text-neutral-800 data-[state=active]:border-b-blue-600 dark:data-[state=active]:border-b-blue-600 data-[state=active]:text-black dark:text-neutral-300 dark:hover:text-neutral-100 dark:data-[state=active]:text-white";

  return (
    <div className="min-h-screen p-6 bg-white dark:bg-neutral-900">
      {/* Dialogs */}
      <CreateEventDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        sessionUserId={sessionUserId}
        onCreated={fetchEvents}
      />
      <IICEventDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        event={selectedIicEvent}
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full mt-10"
      >
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-transparent p-0">
          <TabsTrigger value="iic" className={TAB_CLS}>
            IIC Activities
          </TabsTrigger>
          <TabsTrigger value="self-hosted" className={TAB_CLS}>
            Self Driven Activities
          </TabsTrigger>
          <TabsTrigger value="calendar" className={TAB_CLS}>
            My Calendar Activities
          </TabsTrigger>
        </TabsList>

        {/* ── IIC tab ── */}
        <TabsContent value="iic" className="mt-8">
          <div className="flex gap-4 mb-6">
            <Select
              value={iicSemesterFilter}
              onValueChange={setIicSemesterFilter}
            >
              <SelectTrigger className="w-64 border-black">
                <SelectValue placeholder="All Semesters & Quarters" />
              </SelectTrigger>
              <SelectContent className="border-neutral-700">
                <SelectItem value="all">All Semesters & Quarters</SelectItem>
                <SelectItem value="semester-1-quarter-1">
                  Semester 1 - Quarter 1
                </SelectItem>
                <SelectItem value="semester-1-quarter-2">
                  Semester 1 - Quarter 2
                </SelectItem>
                <SelectItem value="semester-2-quarter-3">
                  Semester 2 - Quarter 3
                </SelectItem>
                <SelectItem value="semester-2-quarter-4">
                  Semester 2 - Quarter 4
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <Input
                placeholder="Search IIC events..."
                value={iicSearchTerm}
                onChange={(e) => setIicSearchTerm(e.target.value)}
                className="pl-10 border-neutral-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-20">
            {isLoading ? (
              <div className="col-span-full flex justify-center items-center py-8">
                <div className="text-neutral-400">Loading events...</div>
              </div>
            ) : filteredIicEvents.length === 0 ? (
              <div className="col-span-full text-neutral-400">
                {iicSearchTerm ||
                (iicSemesterFilter && iicSemesterFilter !== "all")
                  ? "No IIC events match your search criteria."
                  : "No IIC events yet."}
              </div>
            ) : (
              filteredIicEvents.map((event) => (
                <IICCard
                  key={event.id}
                  event={event}
                  isInCalendar={isEventInCalendar(event.id)}
                  onViewDetails={handleViewIicEvent}
                  onAddToCalendar={addToCalendar}
                  onRemoveFromCalendar={removeFromCalendar}
                />
              ))
            )}
          </div>
        </TabsContent>

        {/* ── Self-hosted tab ── */}
        <TabsContent value="self-hosted" className="mt-8">
          <Tabs
            value={selfHostedTab}
            onValueChange={setSelfHostedTab}
            className="w-full"
          >
            <div className="flex justify-end mb-6">
              <TabsList className="inline-flex w-auto">
                <TabsTrigger value="current">Current</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="current">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AddEventCard onClick={() => setCreateDialogOpen(true)} />
                {isLoading ? (
                  <div className="col-span-full flex justify-center items-center py-8">
                    <div className="text-neutral-400">Loading events...</div>
                  </div>
                ) : currentSelfEvents.length === 0 ? (
                  <div className="col-span-full text-neutral-400">
                    No current events.
                  </div>
                ) : (
                  currentSelfEvents.map((event) => (
                    <SelfEventCard
                      key={event.id}
                      event={event}
                      onViewIic={handleViewIicEvent}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="past">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  <div className="col-span-full flex justify-center items-center py-8">
                    <div className="text-neutral-400">Loading events...</div>
                  </div>
                ) : pastSelfEvents.length === 0 ? (
                  <div className="col-span-full text-neutral-400">
                    No past events.
                  </div>
                ) : (
                  pastSelfEvents.map((event) => (
                    <SelfEventCard
                      key={event.id}
                      event={event}
                      onViewIic={handleViewIicEvent}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ── Calendar tab ── */}
        <TabsContent value="calendar" className="mt-8">
          <CalendarTable
            isLoading={isLoading}
            calendarEvents={calendarEvents}
            onViewEvent={handleViewIicEvent}
            onRemoveFromCalendar={removeFromCalendarById}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
