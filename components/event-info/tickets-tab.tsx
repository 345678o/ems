"use client";

import { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import type { Ticket, TicketClass } from "./types";

interface TicketsTabProps {
  tickets: Ticket[];
  newTicket: {
    name: string;
    class: "general" | "vip" | "premium";
    price: number;
    inclusions: string[];
    available: number;
  };
  setNewTicket: Dispatch<SetStateAction<TicketsTabProps["newTicket"]>>;
  addTicket: () => Promise<void> | void;
  removeTicket: (id: string) => Promise<void> | void;
  addInclusion: () => void;
  updateInclusion: (index: number, value: string) => void;
  removeInclusion: (index: number) => void;
}

export default function TicketsTab({
  tickets,
  newTicket,
  setNewTicket,
  addTicket,
  removeTicket,
  addInclusion,
  updateInclusion,
  removeInclusion,
}: TicketsTabProps) {
  return (
    <Card className="bg-neutral-900 border-neutral-700">
      <CardHeader>
        <CardTitle className="text-white">Ticket Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border border-neutral-600 rounded-lg p-4">
          <h3 className="text-white font-medium mb-4">Create New Ticket</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-white">Ticket Name</Label>
              <Input
                value={newTicket.name}
                onChange={(e) =>
                  setNewTicket({ ...newTicket, name: e.target.value })
                }
                placeholder="General Admission"
                className="bg-neutral-800 border-neutral-600 text-white"
              />
            </div>
            <div>
              <Label className="text-white">Ticket Class</Label>
              <Select
                value={newTicket.class}
                onValueChange={(value) =>
                  setNewTicket({ ...newTicket, class: value as TicketClass })
                }
              >
                <SelectTrigger className="bg-neutral-800 border-neutral-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white">Price ($)</Label>
              <Input
                type="number"
                value={newTicket.price}
                onChange={(e) =>
                  setNewTicket({ ...newTicket, price: Number(e.target.value) })
                }
                className="bg-neutral-800 border-neutral-600 text-white"
              />
            </div>
            <div>
              <Label className="text-white">Available Quantity</Label>
              <Input
                type="number"
                value={newTicket.available}
                onChange={(e) =>
                  setNewTicket({
                    ...newTicket,
                    available: Number(e.target.value),
                  })
                }
                className="bg-neutral-800 border-neutral-600 text-white"
              />
            </div>
          </div>

          <div className="mb-4">
            <Label className="text-white">What&apos;s Included</Label>
            <div className="space-y-2 mt-2">
              {newTicket.inclusions.map((inclusion, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={inclusion}
                    onChange={(e) => updateInclusion(index, e.target.value)}
                    placeholder="e.g., Event access, Welcome drink"
                    className="bg-neutral-800 border-neutral-600 text-white"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeInclusion(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="ghost"
                onClick={addInclusion}
                className="text-blue-400 hover:text-blue-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Inclusion
              </Button>
            </div>
          </div>

          <Button
            onClick={addTicket}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Ticket
          </Button>
        </div>

        <div className="space-y-3">
          <h3 className="text-white font-medium">Created Tickets</h3>
          {tickets.map((ticket) => (
            <div key={ticket.id} className="bg-neutral-800 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <h4 className="text-white font-medium">{ticket.name}</h4>
                  <Badge
                    variant="outline"
                    className={`${ticket.class === "general" ? "border-blue-500 text-blue-400" : ""} ${ticket.class === "vip" ? "border-yellow-500 text-yellow-400" : ""} ${ticket.class === "premium" ? "border-purple-500 text-purple-400" : ""}`}
                  >
                    {ticket.class.toUpperCase()}
                  </Badge>
                  <span className="text-green-400 font-semibold">
                    ${ticket.price}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-neutral-400">
                    {ticket.available} available
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTicket(ticket.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-neutral-400 text-sm mb-2">Includes:</p>
                <ul className="text-white text-sm space-y-1">
                  {ticket.inclusions.map((inclusion, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {inclusion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
          {tickets.length === 0 && (
            <p className="text-neutral-400 text-center py-8">
              No tickets created yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
