"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  PermanentSidebar,
  PermanentSidebarLink,
} from "@/components/ui/permanent-sidebar";
import {
  IconChartBar,
  IconUsers,
  IconClipboard,
  IconCalendar,
} from "@tabler/icons-react";
import { EventInfoPage } from "@/components/event-info-page";
import { AfterEventPage } from "@/components/after-event-page";
import { ParticipantsPage } from "@/components/participants-page";
import { AnalyticsPage } from "@/components/analytics-page";
import React from "react";
import { ClubTopBar } from "@/components/ui/club-topbar";
import { Separator } from "@/components/ui/separator";
import { Home, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { supabase } from "@/lib/supabase/browserClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
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

  const links = [
    {
      label: "Analytics",
      href: "#analytics",
      icon: (
        <IconChartBar className="h-5 w-5 shrink-0 dark:text-neutral-200 text-neutral-600" />
      ),
      id: "analytics",
    },
    {
      label: "Participants",
      href: "#participants",
      icon: (
        <IconUsers className="h-5 w-5 shrink-0 dark:text-neutral-200 text-neutral-600" />
      ),
      id: "participants",
    },
    {
      label: "Event Info",
      href: "#event-info",
      icon: (
        <IconClipboard className="h-5 w-5 shrink-0 dark:text-neutral-200 text-neutral-600" />
      ),
      id: "event-info",
    },
    {
      label: "After Event",
      href: "#after-event",
      icon: (
        <IconCalendar className="h-5 w-5 shrink-0 dark:text-neutral-200 text-neutral-600" />
      ),
      id: "after-event",
    },
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

  return (
    <div className="flex min-h-screen w-full bg-neutral-900">
      <div className="sticky top-0 h-screen">
        <PermanentSidebar className="justify-between gap-10 dark:bg-neutral-900 dark:border-r dark:border-neutral-800 bg-white h-full">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <Logo />
            <div className="mt-8 flex flex-col gap-2">
              {event?.hosted === "iic" && currentPage === "after-event" ? (
                <div>
                  <Button
                    variant="ghost"
                    size="default"
                    aria-label="Back to Club"
                    onClick={() => router.push("/club")}
                    className="h-9 w-9 ml-10 hover:bg-transparent hover:cursor-pointer"
                  >
                    <ArrowLeft className="h-5 w-5 dark:text-neutral-200 text-neutral-700" />{" "}
                    Back to Home
                  </Button>
                </div>
              ) : (
                links.map((link) => (
                  <React.Fragment key={link.id}>
                    <div
                      onClick={() => handleLinkClick(link.id)}
                      className="cursor-pointer"
                    >
                      <PermanentSidebarLink link={link} />
                    </div>
                    {link.id === "after-event" && (
                      <Separator className="my-4" />
                    )}
                  </React.Fragment>
                ))
              )}
            </div>
          </div>
          <div className="flex flex-col items-start align-middle gap-2">
            <Separator className="my-2" />
            <div
              onClick={handleHomeClick}
              className="flex items-center justify-start gap-2 group/sidebar py-2 cursor-pointer"
            >
              <Home className="h-5 w-5 shrink-0 dark:text-neutral-200 text-neutral-600" />
              <span className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block">
                Home
              </span>
            </div>
            <div className="-ml-1">
              <ThemeToggle />
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={session?.user?.image ?? ""}
                  alt={session?.user?.name ?? "User"}
                />
                <AvatarFallback>
                  {(session?.user?.name?.[0] ?? "U").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium whitespace-pre dark:text-white text-neutral-800">
                {session?.user?.name ?? "User"}
              </span>
            </div>
          </div>
        </PermanentSidebar>
      </div>
      {/* Main content area with top bar and conditional IIC overlay (except on After Event page) */}
      <div className="relative flex-1 bg-neutral-900">
        <ClubTopBar />
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

export const Logo = () => {
  return (
    <div className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal">
      <Image
        src="/logos/cie.svg"
        alt="CIE Logo"
        width={50}
        height={50}
        className="object-contain"
      />
    </div>
  );
};
