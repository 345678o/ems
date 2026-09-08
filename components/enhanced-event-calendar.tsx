"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Eye, 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Calendar as CalendarIcon, 
  List,
  Clock,
  MapPin,
  Users
} from "lucide-react";
import { supabase } from "@/lib/supabase/browserClient";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";

interface EventData {
  id: string;
  title: string;
  quarter: string;
  description: string;
  semester?: string;
  dateRange?: string;
  club_id?: string;
  club_name?: string;
  has_report?: boolean;
  start_datetime?: string;
  end_datetime?: string;
  venue?: string;
  status?: string;
  event_type?: string;
}

type Club = { id: string; name: string; avatar_url?: string };

export function EnhancedEventCalendar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("semester-1-quarter-1");
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [activeView, setActiveView] = useState<"calendar" | "list">("calendar");

  // Dialog state
  const [open, setOpen] = useState(false);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoadingClubs, setIsLoadingClubs] = useState(false);
  const [selectedClubId, setSelectedClubId] = useState<string>("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    semesterQuarter: "",
    clubId: "",
    venue: "",
    startDate: "",
    endDate: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Calendar view states
  const [eventDetailsDialog, setEventDetailsDialog] = useState(false);
  const [selectedEventForDetails, setSelectedEventForDetails] = useState<EventData | null>(null);

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get events for the selected month (for calendar view)
  const monthEvents = events.filter((event) => {
    if (!event.start_datetime) return false;
    const eventDate = parseISO(event.start_datetime);
    return isWithinInterval(eventDate, {
      start: startOfMonth(selectedMonth),
      end: endOfMonth(selectedMonth)
    });
  });

  // Get events for selected date
  const selectedDateEvents = selectedDate ? events.filter((event) => {
    if (!event.start_datetime) return false;
    const eventDate = parseISO(event.start_datetime);
    return format(eventDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
  }) : [];

  const handleDeleteEvent = async (eventId: string) => {
    const ok = window.confirm("Are you sure you want to delete this event? This action cannot be undone.");
    if (!ok) return;
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    if (error) {
      console.error("Failed to delete event:", error.message);
      return;
    }
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  const handleViewEventDetails = (event: EventData) => {
    setSelectedEventForDetails(event);
    setEventDetailsDialog(true);
  };

  const openAddDialog = () => {
    setOpen(true);
  };

  // Helper function to get date range from semester quarter selection
  const getDateRange = (semesterQuarter: string) => {
    if (semesterQuarter === "semester-1-quarter-1") {
      return "September - November";
    } else if (semesterQuarter === "semester-1-quarter-2") {
      return "December - February";
    } else if (semesterQuarter === "semester-2-quarter-3") {
      return "March - May";
    } else if (semesterQuarter === "semester-2-quarter-4") {
      return "June - August";
    }
    return "";
  };

  // Get events that fall on specific dates for calendar highlighting
  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      if (!event.start_datetime) return false;
      const eventDate = parseISO(event.start_datetime);
      return format(eventDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    });
  };

  // Custom day renderer for calendar
  const DayContent = ({ date }: { date: Date }) => {
    const dayEvents = getEventsForDate(date);
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <span className="text-sm">{format(date, 'd')}</span>
        {dayEvents.length > 0 && (
          <div className="flex gap-0.5 mt-0.5 flex-wrap">
            {dayEvents.slice(0, 3).map((event, index) => (
              <div
                key={index}
                className="w-1.5 h-1.5 rounded-full bg-primary opacity-75"
                title={event.title}
              />
            ))}
            {dayEvents.length > 3 && (
              <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-50" />
            )}
          </div>
        )}
      </div>
    );
  };

  // fetch events from Supabase
  const fetchEvents = async () => {
    try {
      const parts = selectedSemester.split("-");
      const semester = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : "";
      const quarter = parts.length >= 4 ? `${parts[2]}-${parts[3]}` : "";

      let query = supabase
        .from("events")
        .select(`
          id, 
          name, 
          additional_details, 
          quarter, 
          semester, 
          description, 
          date_range,
          club_id,
          start_datetime,
          end_datetime,
          venue,
          status,
          event_type,
          clubs(name)
        `)
        .eq("hosted", "iic")
        .order("start_datetime", { ascending: true });

      if (semester) query = query.eq("semester", semester);
      if (quarter) query = query.eq("quarter", quarter);
      if (selectedClubId) query = query.eq("club_id", selectedClubId);

      const { data, error } = await query;
      if (error) throw error;

      const mapped: EventData[] = (data || []).map((e: any) => ({
        id: e.id,
        title: e.name,
        quarter: e.quarter || "",
        description: e.description || e.additional_details || "",
        semester: e.semester || "",
        dateRange: e.date_range || "",
        club_id: e.club_id,
        club_name: e.clubs?.name || "Unassigned",
        start_datetime: e.start_datetime,
        end_datetime: e.end_datetime,
        venue: e.venue || "",
        status: e.status,
        event_type: e.event_type,
        has_report: false, // Will be updated separately
      }));
      setEvents(mapped);
    } catch (e) {
      console.error("Failed to fetch events", e);
      setEvents([]);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedSemester, selectedClubId]);

  // Load clubs
  const fetchClubs = async () => {
    try {
      setIsLoadingClubs(true);
      const { data, error } = await supabase
        .from("clubs")
        .select("id, name, avatar_url")
        .order("name", { ascending: true });
      if (error) throw error;
      setClubs((data as Club[]) || []);
    } catch (e: any) {
      console.error("Failed to load clubs", e?.message || e);
      setClubs([]);
    } finally {
      setIsLoadingClubs(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const handleSubmit = async () => {
    setSubmitError(null);
    setSubmitSuccess(null);
    const { title, description, semesterQuarter, clubId, venue, startDate, endDate } = form;
    
    if (!title || !description || !semesterQuarter || !clubId) {
      setSubmitError("Please fill all required fields.");
      return;
    }

    const parts = semesterQuarter.split("-");
    const semester = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : "";
    const quarter = parts.length >= 4 ? `${parts[2]}-${parts[3]}` : "";

    try {
      setSubmitting(true);
      const startDateTime = startDate ? new Date(startDate) : new Date();
      const endDateTime = endDate ? new Date(endDate) : new Date(startDateTime.getTime() + 60 * 60 * 1000);

      const payload: Record<string, any> = {
        name: title,
        hosted: "iic",
        club_id: clubId,
        semester,
        quarter,
        start_datetime: startDateTime.toISOString(),
        end_datetime: endDateTime.toISOString(),
        status: "approved",
        event_type: "free",
        venue: venue || "",
        city: "",
        country: "",
        additional_details: description,
        description: description,
        date_range: getDateRange(semesterQuarter).replace(" - ", "-"),
      };
      
      const { error } = await supabase.from("events").insert(payload);
      if (error) throw error;
      
      setSubmitSuccess("Event created successfully.");
      setOpen(false);
      setForm({ 
        title: "", 
        description: "", 
        semesterQuarter: "", 
        clubId: "", 
        venue: "",
        startDate: "",
        endDate: ""
      });
      fetchEvents();
    } catch (e: any) {
      setSubmitError(e?.message || "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 dark:from-purple-950 dark:via-neutral-900 dark:to-black bg-gradient-to-tl from-pink-300 via-white to-white min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Enhanced Event Calendar</h1>
          <div className="flex items-center gap-2">
            <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "calendar" | "list")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="calendar" className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Calendar
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="w-4 h-4" />
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              onClick={openAddDialog}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap">
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-64 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
              <SelectValue placeholder="Select Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semester-1-quarter-1">Semester 1 - Quarter 1</SelectItem>
              <SelectItem value="semester-1-quarter-2">Semester 1 - Quarter 2</SelectItem>
              <SelectItem value="semester-2-quarter-3">Semester 2 - Quarter 3</SelectItem>
              <SelectItem value="semester-2-quarter-4">Semester 2 - Quarter 4</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedClubId || "all"} onValueChange={(v) => setSelectedClubId(v === "all" ? "" : v)}>
            <SelectTrigger className="w-72 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
              <SelectValue placeholder={isLoadingClubs ? "Loading clubs..." : "Filter by Club (All)"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clubs</SelectItem>
              {clubs.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={c.avatar_url || ""} alt={c.name} />
                      <AvatarFallback>{c.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>{c.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {activeView === "calendar" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Event Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={selectedMonth}
                  onMonthChange={setSelectedMonth}
                  className="rounded-md border"
                  components={{
                    DayButton: ({ day, ...props }) => (
                      <button
                        {...props}
                        className="relative w-full h-12 p-1 hover:bg-accent rounded-md"
                        onClick={() => setSelectedDate(day.date)}
                      >
                        <DayContent date={day.date} />
                      </button>
                    )
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Events for Selected Date */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Events for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedDateEvents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No events scheduled for this date
                  </p>
                ) : (
                  selectedDateEvents.map((event) => (
                    <Card key={event.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-3" onClick={() => handleViewEventDetails(event)}>
                        <h4 className="font-medium mb-1">{event.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Clock className="w-3 h-3" />
                          {event.start_datetime && format(parseISO(event.start_datetime), 'h:mm a')}
                        </div>
                        {event.venue && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <MapPin className="w-3 h-3" />
                            {event.venue}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-3 h-3" />
                          {event.club_name}
                        </div>
                        <Badge variant="outline" className="mt-2">
                          {event.status}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* List View */
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Title</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Club</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No events found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>
                        {event.start_datetime && (
                          <div>
                            <div>{format(parseISO(event.start_datetime), 'MMM d, yyyy')}</div>
                            <div className="text-sm text-muted-foreground">
                              {format(parseISO(event.start_datetime), 'h:mm a')}
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{event.venue || "-"}</TableCell>
                      <TableCell>{event.club_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{event.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewEventDetails(event)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Event Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Title *</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Enter event title"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Description *</label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Enter event description"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Start Date</label>
                <Input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">End Date</label>
                <Input
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Venue</label>
              <Input
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                placeholder="Enter venue"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Semester & Quarter *</label>
              <Select
                value={form.semesterQuarter}
                onValueChange={(v) => setForm({ ...form, semesterQuarter: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select semester and quarter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semester-1-quarter-1">Semester 1 - Quarter 1</SelectItem>
                  <SelectItem value="semester-1-quarter-2">Semester 1 - Quarter 2</SelectItem>
                  <SelectItem value="semester-2-quarter-3">Semester 2 - Quarter 3</SelectItem>
                  <SelectItem value="semester-2-quarter-4">Semester 2 - Quarter 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Club *</label>
              <Select
                value={form.clubId}
                onValueChange={(v) => setForm({ ...form, clubId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingClubs ? "Loading..." : "Select a club"} />
                </SelectTrigger>
                <SelectContent>
                  {clubs.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={c.avatar_url || ""} alt={c.name} />
                          <AvatarFallback>{c.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>{c.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {submitError && <p className="text-sm text-red-600">{submitError}</p>}
            {submitSuccess && <p className="text-sm text-green-600">{submitSuccess}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Creating..." : "Create Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={eventDetailsDialog} onOpenChange={setEventDetailsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
          </DialogHeader>
          {selectedEventForDetails && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedEventForDetails.title}</h3>
                <p className="text-muted-foreground">{selectedEventForDetails.description}</p>
              </div>
              
              {selectedEventForDetails.start_datetime && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div>{format(parseISO(selectedEventForDetails.start_datetime), 'EEEE, MMMM d, yyyy')}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(parseISO(selectedEventForDetails.start_datetime), 'h:mm a')}
                      {selectedEventForDetails.end_datetime && (
                        ` - ${format(parseISO(selectedEventForDetails.end_datetime), 'h:mm a')}`
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {selectedEventForDetails.venue && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedEventForDetails.venue}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{selectedEventForDetails.club_name}</span>
              </div>
              
              <div className="flex gap-2">
                <Badge variant="outline">{selectedEventForDetails.status}</Badge>
                <Badge variant="secondary">{selectedEventForDetails.event_type}</Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEventDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}