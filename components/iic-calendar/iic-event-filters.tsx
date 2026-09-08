"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import type { IICClub } from "./types";

interface IICEventFiltersProps {
  selectedSemester: string;
  onSemesterChange: (value: string) => void;
  selectedClubId: string;
  onClubChange: (value: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  clubs: IICClub[];
  isLoadingClubs: boolean;
}

export default function IICEventFilters({
  selectedSemester,
  onSemesterChange,
  selectedClubId,
  onClubChange,
  searchTerm,
  onSearchChange,
  clubs,
  isLoadingClubs,
}: IICEventFiltersProps) {
  return (
    <div className="flex gap-4 mb-6">
      {/* Semester / Quarter */}
      <Select value={selectedSemester} onValueChange={onSemesterChange}>
        <SelectTrigger className="w-64 bg-neutral-800 border-neutral-700 text-white">
          <SelectValue placeholder="Select Semester" />
        </SelectTrigger>
        <SelectContent className="bg-neutral-800 border-neutral-700">
          <SelectItem
            value="semester-1-quarter-1"
            className="text-white hover:bg-neutral-700"
          >
            Semester 1 - Quarter 1
          </SelectItem>
          <SelectItem
            value="semester-1-quarter-2"
            className="text-white hover:bg-neutral-700"
          >
            Semester 1 - Quarter 2
          </SelectItem>
          <SelectItem
            value="semester-2-quarter-3"
            className="text-white hover:bg-neutral-700"
          >
            Semester 2 - Quarter 3
          </SelectItem>
          <SelectItem
            value="semester-2-quarter-4"
            className="text-white hover:bg-neutral-700"
          >
            Semester 2 - Quarter 4
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Club filter */}
      <Select
        value={selectedClubId || "all"}
        onValueChange={(v) => onClubChange(v === "all" ? "" : v)}
      >
        <SelectTrigger className="w-72 bg-neutral-800 border-neutral-700 text-white">
          <SelectValue
            placeholder={
              isLoadingClubs ? "Loading clubs..." : "Filter by Club (All)"
            }
          />
        </SelectTrigger>
        <SelectContent className="bg-neutral-800 border-neutral-700">
          <SelectItem value="all" className="text-white hover:bg-neutral-700">
            All Clubs
          </SelectItem>
          {clubs.map((c) => (
            <SelectItem
              key={c.id}
              value={c.id}
              className="text-white hover:bg-neutral-700"
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={c.avatar_url || ""} alt={c.name} />
                  <AvatarFallback>
                    {c.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{c.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 h-4 w-4" />
        <Input
          placeholder="Search Title"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-400"
        />
      </div>
    </div>
  );
}
