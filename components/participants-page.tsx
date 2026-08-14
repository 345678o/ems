"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/browserClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Check,
  X,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";

type TabType = "attendees" | "waitlist";

interface Event {
  id: string;
  name: string;
  start_datetime: string;
  end_datetime: string;
  event_type: string;
  status: string;
  venue: string;
  city: string;
  country: string;
  additional_details: string;
  created_at: string;
  updated_at: string;
}

interface ParticipantsPageProps {
  event: Event;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  avatar: string;
  passType: "general" | "vip" | "premium";
  registeredAt: string;
}

export function ParticipantsPage({ event }: ParticipantsPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>("attendees");
  const [attendees, setAttendees] = useState<Participant[]>([]);
  const [waitlist, setWaitlist] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load participants from Supabase

  useEffect(() => {
    if (event) loadParticipants();
  }, [event]);

  const loadParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from("event_participants")
        .select("*")
        .eq("event_id", event.id)
        .order("registration_date", { ascending: false });

      if (error) {
        console.error("Error loading participants:", error);
        return;
      }

      const participants =
        data?.map((participant) => ({
          id: participant.id,
          name: participant.name,
          email: participant.email,
          avatar: "/default-avatar.png", // Default avatar
          passType: participant.pass_type,
          registeredAt: new Date(
            participant.registration_date
          ).toLocaleDateString(),
        })) || [];

      // Separate attendees and waitlist
      const attendeesList = participants.filter(
        (p) => p.passType !== "waitlist"
      );
      const waitlistList = participants.filter(
        (p) => p.passType === "waitlist"
      );

      setAttendees(attendeesList);
      setWaitlist(waitlistList);
    } catch (error) {
      console.error("Error loading participants:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "attendees", label: "Attendees" },
    { id: "waitlist", label: "Waitlist" },
  ];

  const handleApprove = async (participantId: string) => {
    try {
      const { error } = await supabase
        .from("event_participants")
        .update({
          registration_status: "approved",
          pass_type: "general", // Default to general when approved
        })
        .eq("id", participantId);

      if (error) {
        console.error("Error approving participant:", error);
        alert("Error approving participant. Please try again.");
        return;
      }

      // Reload participants to reflect changes
      loadParticipants();
      alert("Participant approved successfully!");
    } catch (error) {
      console.error("Error approving participant:", error);
      alert("Error approving participant. Please try again.");
    }
  };

  const handleReject = async (participantId: string) => {
    try {
      const { error } = await supabase
        .from("event_participants")
        .update({ registration_status: "rejected" })
        .eq("id", participantId);

      if (error) {
        console.error("Error rejecting participant:", error);
        alert("Error rejecting participant. Please try again.");
        return;
      }

      // Reload participants to reflect changes
      loadParticipants();
      alert("Participant rejected successfully!");
    } catch (error) {
      console.error("Error rejecting participant:", error);
      alert("Error rejecting participant. Please try again.");
    }
  };

  const handleView = (_participant: Participant) => {
    // TODO: implement participant detail view
  };

  const getPassTypeBadge = (passType: string) => {
    const styles = {
      general: "bg-blue-600 text-white",
      vip: "bg-yellow-600 text-white",
      premium: "bg-purple-600 text-white",
    };
    return styles[passType as keyof typeof styles] || styles.general;
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-black min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-neutral-400">Loading participants...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-black min-h-screen">
      <div className="mb-6">
        <h1 className="text-white text-lg font-medium mb-4">
          Club - Event Dashboard - {event?.name || "Participants Page"}
        </h1>
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              className={
                activeTab === tab.id
                  ? "bg-white text-black hover:bg-gray-100 rounded-sm px-4 py-1 text-sm"
                  : "text-white hover:bg-neutral-800 rounded-sm px-4 py-1 text-sm"
              }
              onClick={() => setActiveTab(tab.id as TabType)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Attendees Tab */}
      {activeTab === "attendees" && (
        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">
              Attendees ({attendees.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attendees.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between bg-neutral-800 p-4 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">]</Avatar>
                    <div>
                      <h3 className="text-white font-medium">
                        {participant.name}
                      </h3>
                      <p className="text-neutral-400 text-sm">
                        {participant.email}
                      </p>
                    </div>
                    <Badge className={getPassTypeBadge(participant.passType)}>
                      {participant.passType.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-neutral-700"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-neutral-800 border-neutral-700">
                        <DropdownMenuItem className="text-white hover:bg-neutral-700">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-white hover:bg-neutral-700">
                          <Mail className="w-4 h-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-white hover:bg-neutral-700">
                          <Phone className="w-4 h-4 mr-2" />
                          Contact Info
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-white hover:bg-neutral-700">
                          <Calendar className="w-4 h-4 mr-2" />
                          Registration Date
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
              {attendees.length === 0 && (
                <p className="text-neutral-400 text-center py-8">
                  No attendees yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Waitlist Tab */}
      {activeTab === "waitlist" && (
        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">
              Waitlist ({waitlist.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {waitlist.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between bg-neutral-800 p-4 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10"></Avatar>
                    <div>
                      <h3 className="text-white font-medium">
                        {participant.name}
                      </h3>
                      <p className="text-neutral-400 text-sm">
                        {participant.email}
                      </p>
                    </div>
                    <Badge className={getPassTypeBadge(participant.passType)}>
                      {participant.passType.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(participant)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-neutral-700"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleApprove(participant.id)}
                      className="text-green-400 hover:text-green-300 hover:bg-neutral-700"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReject(participant.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-neutral-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {waitlist.length === 0 && (
                <p className="text-neutral-400 text-center py-8">
                  No participants in waitlist
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
