"use client";

import React from "react";
import { CheckCircle2, Bell, PlusCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type NotificationKind = "confirmed" | "reminder" | "new" | "cancelled";

type NotificationItem = {
  id: string;
  kind: NotificationKind;
  title: string;
  description: string;
  timestamp: string;
};

const KIND_STYLES: Record<
  NotificationKind,
  { icon: React.ElementType; iconClass: string }
> = {
  confirmed: {
    icon: CheckCircle2,
    iconClass: "bg-badge-sports text-badge-sports-foreground",
  },
  reminder: {
    icon: Bell,
    iconClass: "bg-badge-workshop text-badge-workshop-foreground",
  },
  new: {
    icon: PlusCircle,
    iconClass: "bg-badge-tech text-badge-tech-foreground",
  },
  cancelled: {
    icon: XCircle,
    iconClass: "bg-badge-cultural text-badge-cultural-foreground",
  },
};

// Placeholder content — there's no notifications table in the database yet,
// so this is a UI-only preview until a real notifications feed exists.
const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    kind: "confirmed",
    title: "Registration Confirmed",
    description: "You're registered for Hackathon 2025 — CSE Block.",
    timestamp: "2h ago",
  },
  {
    id: "2",
    kind: "reminder",
    title: "Event Reminder",
    description: "Open Mic Night starts tomorrow at 6:00 PM.",
    timestamp: "5h ago",
  },
  {
    id: "3",
    kind: "new",
    title: "New Event Added",
    description: "UI/UX Workshop has been added by the Design Club.",
    timestamp: "1d ago",
  },
  {
    id: "4",
    kind: "cancelled",
    title: "Registration Cancelled",
    description: "Your registration for Robotics Workshop was cancelled.",
    timestamp: "2d ago",
  },
  {
    id: "5",
    kind: "confirmed",
    title: "Registration Confirmed",
    description: "You're registered for Inter-College Sports Meet.",
    timestamp: "3d ago",
  },
];

export default function NotificationsPage() {
  return (
    <div className="paper-grain min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
        <h1 className="font-display text-3xl text-ink sm:text-4xl">
          Notifications
        </h1>
        <p className="mt-1 text-sm text-foreground/60">
          Updates about your registrations and new events.
        </p>

        <div className="mt-8 space-y-3">
          {SAMPLE_NOTIFICATIONS.map((n) => {
            const { icon: Icon, iconClass } = KIND_STYLES[n.kind];
            return (
              <div
                key={n.id}
                className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4"
              >
                <div
                  className={cn(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-full",
                    iconClass
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-base text-foreground">
                      {n.title}
                    </h3>
                    <span className="shrink-0 text-xs text-foreground/50">
                      {n.timestamp}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-foreground/70">
                    {n.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
