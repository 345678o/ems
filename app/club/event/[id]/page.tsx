"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  PillSidebar,
  PILL_SIDEBAR_WIDTH,
  useSidebarCollapsed,
} from "@/components/ui/pill-sidebar";
import { EventInfoPage } from "@/components/event-info-page";
import { AfterEventPage } from "@/components/after-event-page";
import { ParticipantsPage } from "@/components/participants-page";
import { AnalyticsPage } from "@/components/analytics-page";
import React from "react";
import { ClubTopBar } from "@/components/ui/club-topbar";
import {
  Home,
  ChartLine,
  Users,
  ReceiptText,
  CalendarCheck,
  LogOut,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { supabase } from "@/lib/supabase/browserClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

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
  // Optional: source/ownership of the event; used to detect IIC-hosted events
  hosted?: string;
}

export default function EventDashboard() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const [currentPage, setCurrentPage] = useState("event-info");
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  // Sync section with URL hash (#event-info, #after-event, #participants, #analytics)
  useEffect(() => {
    const allowed = [
      "event-info",
      "after-event",
      "participants",
      "analytics",
    ] as const;
    const parseHash = () => {
      const h = (window.location.hash || "").replace("#", "");
      if ((allowed as readonly string[]).includes(h)) {
        setCurrentPage(h);
      }
    };

    // Initial sync on mount / when navigating to a different event
    parseHash();

    // Keep state in sync when the hash changes (e.g., browser back/forward or external push)
    const onHashChange = () => parseHash();
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [eventId]);

  const fetchEvent = useCallback(async () => {
    if (!eventId) return;
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (error) {
        console.error("Error fetching event:", error);
        return;
      }

      setEvent(data);
    } catch (error) {
      console.error("Error fetching event:", error);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) fetchEvent();
  }, [eventId, fetchEvent]);

  const [collapsed, toggleCollapsed] = useSidebarCollapsed(
    "club-sidebar-collapsed"
  );

  const links = [
    { label: "Analytics", icon: ChartLine, id: "analytics" },
    { label: "Participants", icon: Users, id: "participants" },
    { label: "Event Info", icon: ReceiptText, id: "event-info" },
    { label: "After Event", icon: CalendarCheck, id: "after-event" },
  ];

  const handleLinkClick = (id: string) => {
    setCurrentPage(id);
    router.replace(`#${id}`, { scroll: false });
  };

  const handleHomeClick = () => {
    router.push("/club");
  };

  const renderCurrentPage = () => {
    if (isLoading) {
      return (
        <div className="bg-white dark:bg-neutral-800 h-dvw w-dvw flex items-center justify-center">
          <div className="text-neutral-400">Loading event...</div>
        </div>
      );
    }

    if (!event) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-red-400">Event not found</div>
        </div>
      );
    }

    switch (currentPage) {
      case "event-info":
        return <EventInfoPage event={event} onEventUpdate={fetchEvent} />;
      case "after-event":
        return <AfterEventPage eventId={eventId} />;
      case "participants":
        return <ParticipantsPage event={event} />;
      case "analytics":
        return <AnalyticsPage event={event} />;
      default:
        return <EventInfoPage event={event} onEventUpdate={fetchEvent} />;
    }
  };

  const showBackToClubOnly =
    event?.hosted === "iic" && currentPage === "after-event";

  const sidebarItems = showBackToClubOnly
    ? [{ id: "back-to-club", label: "Back to Home", icon: Home, onClick: () => router.push("/club") }]
    : links.map((link) => ({
        id: link.id,
        label: link.label,
        icon: link.icon,
        onClick: () => handleLinkClick(link.id),
      }));

  return (
    <div className="flex min-h-screen w-full bg-[#141414]">
      <div className="sticky top-0 h-screen p-3">
        <PillSidebar
          items={sidebarItems}
          activeId={showBackToClubOnly ? "back-to-club" : currentPage}
          collapsed={collapsed}
          onToggle={toggleCollapsed}
          logo={<Logo compact />}
          footer={
            <>
              <button
                type="button"
                onClick={handleHomeClick}
                className={`flex items-center gap-3 rounded-full px-3.5 py-2 text-sm text-neutral-300 transition-colors hover:bg-white/10 hover:text-white ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? "Home" : undefined}
              >
                <Home className="h-4 w-4 shrink-0" />
                {!collapsed && "Home"}
              </button>
              <div className={collapsed ? "flex justify-center" : "px-1"}>
                <ThemeToggle />
              </div>
              <div
                className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage
                    src={session?.user?.image ?? ""}
                    alt={session?.user?.name ?? "User"}
                  />
                  <AvatarFallback>
                    {(session?.user?.name?.[0] ?? "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <span className="truncate text-sm font-medium text-white">
                    {session?.user?.name ?? "User"}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/home" })}
                className={`flex items-center gap-3 rounded-full px-3.5 py-2 text-sm text-neutral-400 transition-colors hover:bg-white/10 hover:text-white ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? "Logout" : undefined}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                {!collapsed && "Logout"}
              </button>
            </>
          }
        />
      </div>
      {/* Main content area with top bar and conditional IIC overlay (except on After Event page) */}
      <div className="relative flex-1 bg-[#141414]">
        <ClubTopBar
          leftOffset={
            collapsed ? PILL_SIDEBAR_WIDTH.collapsed : PILL_SIDEBAR_WIDTH.expanded
          }
        />
        {/** Underlying content gets blurred when overlay is active */}
        <div
          className={`${
            event?.hosted === "iic" && currentPage !== "after-event"
              ? "blur-lg"
              : ""
          } pt-[120px]`}
        >
          {renderCurrentPage()}
        </div>

        {/** Overlay shown for IIC-hosted events on all pages except After Event */}
        {event?.hosted === "iic" && currentPage !== "after-event" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="mx-4 w-full max-w-xl rounded-lg border border-white/10 bg-black p-6 text-center shadow-lg">
              <h2 className="mb-2 text-xl font-semibold text-white">
                This is an IIC event
              </h2>
              <p className="mb-6 text-sm text-neutral-300">
                All features are restricted for IIC events except report
                submission.
              </p>
              <button
                onClick={() => {
                  setCurrentPage("after-event");
                  router.replace("#after-event", { scroll: false });
                }}
                className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                Go to Report Submission
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const Logo = ({ compact = false }: { compact?: boolean }) => {
  const size = compact ? 28 : 50;
  return (
    <div className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal">
      <Image
        src="/logos/cie.svg"
        alt="CIE Logo"
        width={size}
        height={size}
        className="object-contain"
      />
    </div>
  );
};
