"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarIcon, List, Home } from "lucide-react";

export function EventsNavigation() {
  return (
    <nav className="flex items-center gap-2 p-4 bg-white dark:bg-gray-800 border-b">
      <Link href="/">
        <Button variant="ghost" size="sm">
          <Home className="w-4 h-4 mr-2" />
          Home
        </Button>
      </Link>
      <span className="text-muted-foreground">/</span>
      <Link href="/events">
        <Button variant="ghost" size="sm">
          <CalendarIcon className="w-4 h-4 mr-2" />
          Events Calendar
        </Button>
      </Link>
    </nav>
  );
}