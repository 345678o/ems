"use client";

import { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/browserClient";
import type { BannerState, Event } from "./types";

interface DetailsTabProps {
  event: Event;
  eventDetails: {
    name: string;
    description: string;
    date: string;
    time: string;
    location: string;
    capacity: string;
    category: string;
    status: string;
  };
  setEventDetails: Dispatch<SetStateAction<DetailsTabProps["eventDetails"]>>;
  isSaving: boolean;
  saveEventDetails: () => Promise<void> | void;
  banners: BannerState;
  setBanners: Dispatch<SetStateAction<BannerState>>;
  buildBannersJson: (state: BannerState) => Record<string, string>;
}

export default function DetailsTab(props: DetailsTabProps) {
  const {
    event,
    eventDetails,
    setEventDetails,
    isSaving,
    saveEventDetails,
    banners,
    setBanners,
    buildBannersJson,
  } = props;

  return (
    <>
      <Card className="bg-neutral-900 border-neutral-700">
        <CardHeader>
          <CardTitle className="text-white">Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="eventName" className="text-white">
                Event Name
              </Label>
              <Input
                id="eventName"
                value={eventDetails.name}
                onChange={(e) =>
                  setEventDetails({ ...eventDetails, name: e.target.value })
                }
                className="bg-neutral-800 border-neutral-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="category" className="text-white">
                Event Type
              </Label>
              <Select
                value={eventDetails.category}
                onValueChange={(value) =>
                  setEventDetails({ ...eventDetails, category: value })
                }
              >
                <SelectTrigger className="bg-neutral-800 border-neutral-600 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-white">
              Description
            </Label>
            <Textarea
              id="description"
              value={eventDetails.description}
              onChange={(e) =>
                setEventDetails({
                  ...eventDetails,
                  description: e.target.value,
                })
              }
              className="bg-neutral-800 border-neutral-600 text-white"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date" className="text-white">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={eventDetails.date}
                onChange={(e) =>
                  setEventDetails({ ...eventDetails, date: e.target.value })
                }
                className="bg-neutral-800 border-neutral-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="time" className="text-white">
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={eventDetails.time}
                onChange={(e) =>
                  setEventDetails({ ...eventDetails, time: e.target.value })
                }
                className="bg-neutral-800 border-neutral-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="capacity" className="text-white">
                Capacity
              </Label>
              <Input
                id="capacity"
                type="number"
                value={eventDetails.capacity}
                onChange={(e) =>
                  setEventDetails({ ...eventDetails, capacity: e.target.value })
                }
                className="bg-neutral-800 border-neutral-600 text-white"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location" className="text-white">
              Location
            </Label>
            <Input
              id="location"
              value={eventDetails.location}
              onChange={(e) =>
                setEventDetails({ ...eventDetails, location: e.target.value })
              }
              className="bg-neutral-800 border-neutral-600 text-white"
            />
          </div>

          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={saveEventDetails}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Event Details"}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-neutral-900 border-neutral-700 mt-6">
        <CardHeader>
          <CardTitle className="text-white">Banners</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-neutral-400 text-sm">
            Upload promotional assets for this event. One file per slot. You can
            delete and re-upload anytime.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(
              [
                {
                  key: "banner_1x1",
                  label: "1x1 banner (max 5MB)",
                  maxMB: 5,
                  accept: "image/png,image/jpeg,image/webp",
                },
                {
                  key: "banner_16x9",
                  label: "16:9 banner (max 5MB)",
                  maxMB: 5,
                  accept: "image/png,image/jpeg,image/webp",
                },
                {
                  key: "banner_21x9",
                  label: "21:9 banner (max 10MB)",
                  maxMB: 10,
                  accept: "image/png,image/jpeg,image/webp",
                },
                {
                  key: "logo_png",
                  label: "PNG logo (max 2MB)",
                  maxMB: 2,
                  accept: "image/png",
                },
              ] as const
            ).map((cfg) => (
              <div
                key={cfg.key}
                className="border border-neutral-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white text-sm font-medium">
                    {cfg.label}
                  </h4>
                  {banners[cfg.key as keyof BannerState] && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300"
                      onClick={async () => {
                        const current = banners[cfg.key as keyof BannerState];
                        if (!current) return;
                        const bucket = "event-assets";
                        let delPath = current.path;
                        if (!delPath) {
                          const basePath = `${event.id}/banners`;
                          const { data: list, error: listErr } =
                            await supabase.storage.from(bucket).list(basePath);
                          if (!listErr && list && list.length > 0) {
                            const match = list.find((d) =>
                              d.name.startsWith(cfg.key)
                            );
                            if (match) delPath = `${basePath}/${match.name}`;
                          }
                        }
                        if (!delPath) {
                          alert("Could not resolve file path to delete.");
                          return;
                        }
                        const res = await fetch("/api/storage/delete", {
                          method: "POST",
                          body: JSON.stringify({ bucket, path: delPath }),
                          headers: { "Content-Type": "application/json" },
                        });
                        if (!res.ok) {
                          alert("Failed to delete asset");
                          return;
                        }
                        const nextState = {
                          ...banners,
                          [cfg.key]: null,
                        } as BannerState;
                        setBanners(nextState);
                        try {
                          const json = buildBannersJson(nextState);
                          const { error } = await supabase
                            .from("events")
                            .update({ banners: json })
                            .eq("id", event.id);
                          if (error)
                            console.error(
                              "Failed to update banners JSON:",
                              error.message
                            );
                        } catch (e) {
                          console.error(
                            "Unexpected error updating banners JSON:",
                            e
                          );
                        }
                      }}
                      title="Delete file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {banners[cfg.key as keyof BannerState] ? (
                  <div className="relative w-full h-40 bg-neutral-800 rounded overflow-hidden">
                    <Image
                      src={banners[cfg.key as keyof BannerState]!.url}
                      alt={cfg.label}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept={cfg.accept}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const maxBytes = cfg.maxMB * 1024 * 1024;
                        if (file.size > maxBytes) {
                          alert(`File too large. Max ${cfg.maxMB}MB`);
                          (e.currentTarget as HTMLInputElement).value = "";
                          return;
                        }
                        const ext =
                          file.name.split(".").pop()?.toLowerCase() || "png";
                        if (cfg.key === "logo_png" && ext !== "png") {
                          alert("Logo must be a PNG file");
                          (e.currentTarget as HTMLInputElement).value = "";
                          return;
                        }
                        const path = `${event.id}/banners/${cfg.key}.${ext}`;
                        const fd = new FormData();
                        fd.append("bucket", "event-assets");
                        fd.append("path", path);
                        fd.append("file", file);
                        const res = await fetch("/api/storage/upload", {
                          method: "POST",
                          body: fd,
                        });
                        if (!res.ok) {
                          const j = (await res
                            .json()
                            .catch(() => ({ error: res.statusText }))) as {
                            error?: string;
                          };
                          alert(`Upload failed: ${j?.error || res.statusText}`);
                          (e.currentTarget as HTMLInputElement).value = "";
                          return;
                        }
                        const j = await res.json();
                        const nextState2 = {
                          ...banners,
                          [cfg.key]: { path, url: j.publicUrl },
                        } as BannerState;
                        setBanners(nextState2);
                        try {
                          const json = buildBannersJson(nextState2);
                          const { error } = await supabase
                            .from("events")
                            .update({ banners: json })
                            .eq("id", event.id);
                          if (error)
                            console.error(
                              "Failed to update banners JSON:",
                              error.message
                            );
                        } catch (e) {
                          console.error(
                            "Unexpected error updating banners JSON:",
                            e
                          );
                        }
                      }}
                      className="text-white"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
