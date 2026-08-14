"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EventReportDialog } from "@/components/event-report-dialog";
import { useIICEventCalendar } from "@/components/iic-calendar/useIICEventCalendar";
import IICEventFilters from "@/components/iic-calendar/IICEventFilters";
import IICEventTable from "@/components/iic-calendar/IICEventTable";
import CreateIICEventDialog from "@/components/iic-calendar/CreateIICEventDialog";

export function IICEventCalendar() {
  const {
    // filters
    selectedSemester,
    setSelectedSemester,
    selectedClubId,
    setSelectedClubId,
    searchTerm,
    setSearchTerm,
    // events
    filteredEvents,
    handleDeleteEvent,
    // clubs
    clubs,
    isLoadingClubs,
    // report dialog
    reportOpen,
    setReportOpen,
    reportData,
    handleViewReport,
    // create dialog
    createDialogOpen,
    setCreateDialogOpen,
    submitting,
    submitError,
    submitSuccess,
    handleCreateEvent,
  } = useIICEventCalendar();

  return (
    <div className="p-6 dark:from-purple-950 dark:via-neutral-900 dark:to-black bg-gradient-to-tl from-pink-300 via-white to-white min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-medium">
            Club - Admin Dashboard - IIC Event Calendar
          </h1>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New IIC Event
          </Button>
        </div>

        <IICEventFilters
          selectedSemester={selectedSemester}
          onSemesterChange={setSelectedSemester}
          selectedClubId={selectedClubId}
          onClubChange={setSelectedClubId}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          clubs={clubs}
          isLoadingClubs={isLoadingClubs}
        />
      </div>

      {/* Table */}
      <IICEventTable
        events={filteredEvents}
        onViewReport={handleViewReport}
        onDeleteEvent={handleDeleteEvent}
      />

      {/* Create dialog */}
      <CreateIICEventDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        clubs={clubs}
        isLoadingClubs={isLoadingClubs}
        submitting={submitting}
        submitError={submitError}
        submitSuccess={submitSuccess}
        onSubmit={handleCreateEvent}
      />

      {/* Report viewer dialog */}
      <EventReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        data={reportData}
      />
    </div>
  );
}
