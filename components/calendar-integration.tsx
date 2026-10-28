"use client";

import { useState } from "react";
import { EnhancedEventCalendar } from "./enhanced-event-calendar";
import { IICEventCalendar } from "./iic-event-calendar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Settings } from "lucide-react";
import { PageHeading } from "@/components/ui/page-heading";

export function CalendarIntegration() {
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  return (
    <div className="w-full">
      <Tabs defaultValue="enhanced" className="w-full">
        <PageHeading
          className="mb-6"
          title="Event Management Calendar"
          actions={
            <>
              <div ref={setSlot} className="flex flex-wrap items-center" />
              <TabsList className="grid w-fit grid-cols-2">
                <TabsTrigger value="enhanced" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Enhanced View
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Admin View
                </TabsTrigger>
              </TabsList>
            </>
          }
        />

        <TabsContent value="enhanced">
          <EnhancedEventCalendar actionsSlot={slot} />
        </TabsContent>
        
        <TabsContent value="admin">
          <IICEventCalendar />
        </TabsContent>
      </Tabs>
    </div>
  );
}