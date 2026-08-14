"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { CalendarPlus, BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { Home, LogOut } from "lucide-react";
import { IICEventCalendar } from "@/components/iic-event-calendar";
import { ManageSelfHostedEvents } from "@/components/manage-self-hosted-events";
import { supabase } from "@/lib/supabase/browserClient";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useSession } from "next-auth/react";

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

export default function AdminPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const [currentPage, setCurrentPage] = useState("event-info");
  const [open, setOpen] = useState(false);
  const [_event, setEvent] = useState<Event | null>(null);
  const [_isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

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
    if (eventId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchEvent();
    } else {
      setIsLoading(false);
    }
  }, [eventId, fetchEvent]);

  const links = [
    {
      label: "IIC Event Calender",
      href: "#",
      icon: (
        <CalendarPlus className="h-5 w-5 shrink-0 dark:text-neutral-200 text-neutral-600" />
      ),
      id: "iic-event-calender",
    },
    {
      label: "Manage Self Hosted Events",
      href: "#",
      icon: (
        <BadgeCheck className="h-5 w-5 shrink-0 dark:text-neutral-200 text-neutral-600" />
      ),
      id: "manage-self-hosted-events",
    },
    {
      label: "Logout",
      href: "#",
      icon: (
        <LogOut className="h-5 w-5 shrink-0 dark:text-red-400 text-red-400" />
      ),
      id: "logout",
    },
    {
      label: "Home",
      href: "#",
      icon: (
        <Home className="h-5 w-5 shrink-0 dark:text-neutral-200 text-neutral-600" />
      ),
      id: "home",
    },
  ];

  const handleLinkClick = (id: string) => {
    if (id === "logout") {
      signOut({ callbackUrl: "/" });
      return;
    }
    if (id === "home") {
      router.push("/home");
      return;
    }
    if (id !== "menu") {
      setCurrentPage(id);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "iic-event-calender":
        return <IICEventCalendar />;
      case "manage-self-hosted-events":
        return <ManageSelfHostedEvents />;
      default:
        return <IICEventCalendar />;
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-neutral-900">
      <div className="sticky top-0 h-screen">
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10 dark:bg-neutral-900 dark:border-r dark:border-neutral-800 bg-white h-full">
            <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
              <Logo />
              <div className="mt-8 flex flex-col gap-2">
                {links.map((link) => (
                  <React.Fragment key={link.id}>
                    <div
                      onClick={() => handleLinkClick(link.id)}
                      className="cursor-pointer"
                    >
                      <SidebarLink link={link} />
                    </div>
                    {link.id === "manage-self-hosted-events" && (
                      <Separator className="my-4" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-start align-middle gap-2">
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
                {/* Name only appears when sidebar is expanded */}
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={
                    open
                      ? { opacity: 1, width: "auto" }
                      : { opacity: 0, width: 0 }
                  }
                  transition={{ duration: 0.2 }}
                  className="font-medium whitespace-pre dark:text-white text-neutral-800 overflow-hidden"
                >
                  {session?.user?.name ?? "User"}
                </motion.span>
              </div>
            </div>
          </SidebarBody>
        </Sidebar>
      </div>
      <div className="flex-1 bg-neutral-900">{renderCurrentPage()}</div>
    </div>
  );
}

export const Logo = () => {
  return (
    <div className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal">
      <div className="h-6 w-6 shrink-0 rounded dark:bg-white bg-neutral-600" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre dark:text-white text-neutral-600"
      >
        Club
      </motion.span>
    </div>
  );
};
