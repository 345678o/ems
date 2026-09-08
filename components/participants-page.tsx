"use client";

import { useState, useEffect, useMemo } from "react";
import { Anton } from "next/font/google";
import { supabase } from "@/lib/supabase/browserClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Users,
  Clock3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const anton = Anton({ weight: "400", subsets: ["latin"] });

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

const PASS_STYLES: Record<
  Participant["passType"],
  { badge: string; ring: string; bg: string }
> = {
  general: { badge: "bg-blue-600 text-white", ring: "ring-blue-500/40", bg: "bg-blue-500" },
  vip: { badge: "bg-amber-600 text-white", ring: "ring-amber-500/40", bg: "bg-amber-500" },
  premium: { badge: "bg-purple-600 text-white", ring: "ring-purple-500/40", bg: "bg-purple-500" },
};

function InitialsAvatar({ name, passType }: { name: string; passType: Participant["passType"] }) {
  const style = PASS_STYLES[passType] ?? PASS_STYLES.general;
  return (
    <div
      className={cn(
        "h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0 ring-2",
        style.bg,
        style.ring
      )}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <Card className="bg-neutral-900 border-neutral-800 relative overflow-hidden">
      <div className={cn("absolute left-0 top-0 h-full w-1", accent)} />
      <CardContent className="p-4 pl-5">
        <p className="text-xs text-neutral-400 mb-1">{label}</p>
        <p className={`${anton.className} text-2xl text-white`}>{value}</p>
      </CardContent>
    </Card>
  );
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
          avatar: "/default-avatar.png",
          passType: participant.pass_type,
          registeredAt: new Date(
            participant.registration_date
          ).toLocaleDateString(),
        })) || [];

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
    { id: "attendees", label: "Attendees", count: attendees.length },
    { id: "waitlist", label: "Waitlist", count: waitlist.length },
  ];

  const breakdown = useMemo(() => {
    const counts = { general: 0, vip: 0, premium: 0 };
    attendees.forEach((a) => {
      if (a.passType in counts) counts[a.passType as keyof typeof counts]++;
    });
    return counts;
  }, [attendees]);

  const handleApprove = async (participantId: string) => {
    try {
      const { error } = await supabase
        .from("event_participants")
        .update({
          registration_status: "approved",
          pass_type: "general",
        })
        .eq("id", participantId);

      if (error) {
        console.error("Error approving participant:", error);
        alert("Error approving participant. Please try again.");
        return;
      }

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

  const getPassTypeBadge = (passType: string) =>
    (PASS_STYLES[passType as Participant["passType"]] ?? PASS_STYLES.general).badge;

  if (isLoading) {
    return (
      <div className="p-6 bg-[#141414] min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-neutral-400">Loading participants...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#141414] min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Users className="w-6 h-6 text-blue-500" />
          <h1 className={`${anton.className} text-white text-2xl tracking-wide`}>
            Participants
          </h1>
        </div>
        <p className="text-neutral-500 text-sm">{event?.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Attendees" value={attendees.length} accent="bg-blue-500" />
        <StatCard label="General" value={breakdown.general} accent="bg-blue-500" />
        <StatCard label="VIP" value={breakdown.vip} accent="bg-amber-500" />
        <StatCard label="Premium" value={breakdown.premium} accent="bg-purple-500" />
      </div>

      {/* Tab pills */}
      <div className="flex gap-1 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-white text-black"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-xs",
                activeTab === tab.id
                  ? "bg-black/10 text-black"
                  : "bg-neutral-800 text-neutral-400"
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Attendees Tab */}
      {activeTab === "attendees" && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4">
            <div className="space-y-2">
              {attendees.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between bg-neutral-800/60 hover:bg-neutral-800 p-4 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <InitialsAvatar name={participant.name} passType={participant.passType} />
                    <div className="min-w-0">
                      <h3 className="text-white font-medium truncate">
                        {participant.name}
                      </h3>
                      <p className="text-neutral-400 text-sm truncate">
                        {participant.email}
                      </p>
                    </div>
                    <Badge className={cn(getPassTypeBadge(participant.passType), "shrink-0")}>
                      {participant.passType.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
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
                <div className="flex flex-col items-center py-12 text-neutral-500">
                  <Users className="w-10 h-10 mb-3 opacity-40" />
                  <p>No attendees yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Waitlist Tab */}
      {activeTab === "waitlist" && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4">
            <div className="space-y-2">
              {waitlist.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between bg-neutral-800/60 hover:bg-neutral-800 p-4 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <InitialsAvatar name={participant.name} passType={participant.passType} />
                    <div className="min-w-0">
                      <h3 className="text-white font-medium truncate">
                        {participant.name}
                      </h3>
                      <p className="text-neutral-400 text-sm truncate">
                        {participant.email}
                      </p>
                    </div>
                    <Badge className={cn(getPassTypeBadge(participant.passType), "shrink-0")}>
                      {participant.passType.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
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
                <div className="flex flex-col items-center py-12 text-neutral-500">
                  <Clock3 className="w-10 h-10 mb-3 opacity-40" />
                  <p>No participants in waitlist</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
