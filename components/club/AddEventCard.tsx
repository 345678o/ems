"use client";

import { Plus } from "lucide-react";

interface AddEventCardProps {
  onClick: () => void;
}

export default function AddEventCard({ onClick }: AddEventCardProps) {
  return (
    <div
      className="group relative overflow-hidden border border-white/20 bg-neutral-900/50 hover:bg-neutral-800/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="relative h-40 dark:bg-neutral-900 bg-white flex items-center justify-center">
        <div className="w-16 h-16 rounded-full dark:bg-neutral-700 bg-neutral-300 flex items-center justify-center">
          <Plus className="w-8 h-8 dark:text-neutral-300 text-neutral-700" />
        </div>
      </div>
      <div className="flex items-center justify-center bg-[#D9D9D9] px-5 py-4">
        <span className="text-xl font-medium tracking-tight text-black">
          Add New Event
        </span>
      </div>
    </div>
  );
}
