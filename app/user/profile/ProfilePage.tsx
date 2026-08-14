"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  UserRoundPen,
  TicketCheck,
  Trophy,
  LogOut,
  Home,
  Handshake,
} from "lucide-react";
import { UserProfile } from "@/components/user-profile";
import MyBookings from "@/components/my-bookings";
import Certificates from "@/components/certificates";
import { motion } from "motion/react";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Partner from "@/components/Partner";
import { supabase } from "@/lib/supabase/browserClient"; // ✅ make sure your supabase client path is correct

export default function ProfilePage() {
  const [currentPage, setCurrentPage] = useState("profile");
  const [open, setOpen] = useState(false);
  const { data: session, status: _status } = useSession();
  const router = useRouter();

  /** 🔑 Check role and redirect */
  useEffect(() => {
    if (!session?.user?.email) return;

    const checkRole = async () => {
      const { data, error } = await supabase
        .from("users") // make sure your table is named correctly (users or public.users)
        .select("role")
        .eq("email", session.user?.email)
        .single();

      if (error) {
        console.error("Error fetching role:", error);
        return;
      }

      if (data?.role === "club") {
        router.push("/club");
      } else if (data?.role === "admin") {
        router.push("/admin");
      }
      // else stay here (profile page)
    };

    checkRole();
  }, [session?.user?.email, router]);

  const links = [
    {
      label: "Profile",
      href: "#",
      icon: (
        <UserRoundPen className="h-5 w-5 shrink-0 dark:text-neutral-200 text-neutral-700" />
      ),
      id: "profile",
    },
    {
      label: "My Bookings",
      href: "#",
      icon: (
        <TicketCheck className="h-5 w-5 shrink-0 dark:text-neutral-200 text-neutral-700" />
      ),
      id: "my-bookings",
    },
    {
      label: "Certificates",
      href: "#",
      icon: (
        <Trophy className="h-5 w-5 shrink-0 dark:text-neutral-200 text-neutral-700" />
      ),
      id: "certificates",
    },
    {
      label: "Logout",
      href: "#",
      icon: <LogOut className="h-5 w-5 shrink-0 text-red-400" />,
      id: "logout",
    },
    {
      label: "Back to home",
      href: "#",
      icon: (
        <Home className="h-5 w-5 shrink-0 dark:text-neutral-200 text-neutral-700" />
      ),
      id: "home",
    },
    {
      label: "Partner",
      href: "#",
      icon: (
        <Handshake className="h-5 w-5 shrink-0 dark:text-neutral-200 text-neutral-700" />
      ),
      id: "partner",
    },
  ];

  const handleLinkClick = (id: string) => {
    if (id !== "logout" && id !== "home" && id !== "partner") {
      setCurrentPage(id);
    } else if (id === "logout") {
      signOut();
      router.push("/home");
    } else if (id === "partner") {
      setCurrentPage("partner");
    } else {
      router.push("/home");
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "profile":
        return <UserProfile />;
      case "my-bookings":
        return <MyBookings />;
      case "certificates":
        return <Certificates />;
      case "partner":
        return <Partner />;
      default:
        return <UserProfile />;
    }
  };

  return (
    <div
      className="
        relative flex min-h-screen w-full
        overflow-hidden
        dark:bg-[#0A0B1E] bg-[#FAF9F6]
      "
    >
      <div className="relative z-10 flex flex-col md:flex-row w-full items-stretch">
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10 dark:bg-neutral-900/90 dark:border-r dark:border-neutral-800 bg-[#FAF9F6]/90 backdrop-blur">
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
                    {link.id === "certificates" && (
                      <Separator className="my-4" />
                    )}
                    {link.id === "home" && <Separator className="my-4" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div>
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
            </div>
          </SidebarBody>
        </Sidebar>

        <main className="flex-1 w-full bg-transparent">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
}

export const Logo = () => {
  return (
    <div className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal">
      <div className="h-6 w-6 shrink-0 rounded bg-white" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-white"
      >
        Club
      </motion.span>
    </div>
  );
};
