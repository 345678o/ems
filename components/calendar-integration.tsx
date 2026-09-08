"use client";

import { useState } from "react";
import { EnhancedEventCalendar } from "./enhanced-event-calendar";
import { IICEventCalendar } from "./iic-event-calendar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Settings } from "lucide-react";

export function CalendarIntegration() {
  return (
    <div className="w-full">
      <Tabs defaultValue="enhanced" className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Event Management Calendar</h1>
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
        </div>
        
        <TabsContent value="enhanced">
          <EnhancedEventCalendar />
        </TabsContent>
        
        <TabsContent value="admin">
          <IICEventCalendar />
        </TabsContent>
      </Tabs>
    </div>
  );
}