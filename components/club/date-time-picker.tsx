"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";

interface DateTimePickerProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}

export default function DateTimePicker({
  id,
  label,
  value,
  onChange,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>("10:30:00");

  // Initialise from incoming value (expects YYYY-MM-DDTHH:MM or HH:MM:SS)
  useEffect(() => {
    if (!value) return;
    const [d, t] = value.split("T");
    if (d) {
      const parts = d.split("-");
      if (parts.length === 3) {
        const parsed = new Date(
          Number(parts[0]),
          Number(parts[1]) - 1,
          Number(parts[2])
        );
        if (!isNaN(parsed.getTime())) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setDate(parsed);
        }
      }
    }

    if (t) setTime(t.length === 5 ? `${t}:00` : t);
  }, [value]);

  const combine = (d?: Date, t?: string) => {
    if (!d) return;
    const yyyy = d.getFullYear();
    const mm = `${d.getMonth() + 1}`.padStart(2, "0");
    const dd = `${d.getDate()}`.padStart(2, "0");
    const tt = (t || time || "00:00:00").slice(0, 8);
    onChange(`${yyyy}-${mm}-${dd}T${tt}`);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={`${id}-date`}>{label}</Label>
      <div className="flex gap-1">
        <div className="flex flex-col gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id={`${id}-date`}
                className="w-44 justify-between font-normal"
              >
                {date ? date.toLocaleDateString() : "Select date"}
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={date}
                captionLayout="dropdown"
                onSelect={(d) => {
                  setDate(d);
                  if (d) combine(d, time);
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-col gap-2">
          <Input
            type="time"
            id={`${id}-time`}
            step="1"
            value={time}
            onChange={(e) => {
              const v =
                e.target.value.length === 5
                  ? `${e.target.value}:00`
                  : e.target.value;
              setTime(v);
              combine(date, v);
            }}
            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </div>
      </div>
    </div>
  );
}
