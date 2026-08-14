"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarDays,
  Users,
  DollarSign,
  FileText,
  ExternalLink,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";
import { supabase } from "@/lib/supabase/browserClient";
import type { DbClub } from "@/types/database";

export interface AfterEventReportData {
  id: string;
  created_at: string;
  updated_at: string;
  program_type: string;
  other_program_type: string | null;
  program_theme: string;
  duration_hours: number;
  start_date: string;
  end_date: string;
  student_participants: number;
  faculty_participants: number;
  external_participants: number | null;
  expenditure_amount: number | null;
  remark: string | null;
  session_delivery_mode: string;
  activity_lead_by: string;
  objective: string;
  benefits: string;
  event_images: string[] | null;
  event_video: string | null;
  event_report: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  report_submitted: boolean | null;
  media_uploaded: boolean | null;
  social_media_promoted: boolean | null;
  submitted_by: string | null;
  event_id: string | null;
}

interface ProgramDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: AfterEventReportData | null;
}

export function EventReportDialog({
  open,
  onOpenChange,
  data,
}: ProgramDataDialogProps) {
  // Load club info for the Submitted By section using submitted_by as the club ID
  const [club, setClub] = useState<Pick<
    DbClub,
    "id" | "name" | "email" | "avatar_url"
  > | null>(null);
  const [loadingClub, setLoadingClub] = useState(false);

  useEffect(() => {
    const clubId = data?.submitted_by ?? null;
    if (!open || !clubId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setClub(null);
      return;
    }
    let cancelled = false;
    const fetchClub = async () => {
      try {
        setLoadingClub(true);
        const { data: clubData, error } = await supabase
          .from("clubs")
          .select("id, name, email, avatar_url")
          .eq("id", clubId)
          .maybeSingle();
        if (error) throw error;
        if (!cancelled) setClub(clubData ?? null);
      } catch (e) {
        if (!cancelled) setClub(null);
        console.error("Failed to load club for submitted_by:", e);
      } finally {
        if (!cancelled) setLoadingClub(false);
      }
    };
    fetchClub();
    return () => {
      cancelled = true;
    };
  }, [open, data?.submitted_by]);
  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "twitter":
        return <Twitter className="h-4 w-4" />;
      case "instagram":
        return <Instagram className="h-4 w-4" />;
      case "linkedin":
        return <Linkedin className="h-4 w-4" />;
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] xl:max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Program Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Submitter Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={club?.avatar_url ?? undefined}
                    alt={club?.name ?? "Club Avatar"}
                  />
                  <AvatarFallback>
                    {(club?.name?.[0] || "-").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-sm font-semibold">Submitted By</h3>
                  <p className="text-2xl">
                    {loadingClub ? "Loading..." : (club?.name ?? "—")}
                  </p>
                  {club?.email && (
                    <p className="text-xs text-neutral-400">{club.email}</p>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Program Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Program Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge variant="secondary">{data?.program_type ?? "—"}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Theme</p>
                  <p className="font-medium">{data?.program_theme ?? "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Mode</p>
                  <Badge variant="outline">
                    {data?.session_delivery_mode ?? "—"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">
                    {data?.duration_hours ?? "—"} hours
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">
                    {data?.start_date
                      ? new Date(data.start_date).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-medium">
                    {data?.end_date
                      ? new Date(data.end_date).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Participants
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Students
                  </span>
                  <span className="font-medium">
                    {data?.student_participants ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Faculty</span>
                  <span className="font-medium">
                    {data?.faculty_participants ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    External
                  </span>
                  <span className="font-medium">
                    {data?.external_participants ?? 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Expenditure */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Budget Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {typeof data?.expenditure_amount === "number"
                  ? `₹${data.expenditure_amount.toLocaleString()}`
                  : "—"}
              </div>
              <p className="text-sm text-muted-foreground">
                Total expenditure amount
              </p>
            </CardContent>
          </Card>

          {/* Objective and Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Objective</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">
                  {data?.objective ?? "—"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">
                  {data?.benefits ?? "—"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Activity Lead and Remarks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Activity Lead</p>
                <p className="font-medium">{data?.activity_lead_by ?? "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remarks</p>
                <p className="text-sm leading-relaxed">{data?.remark ?? "—"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Social Media Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Social Media & Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data?.twitter_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={data.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {getSocialIcon("twitter")}
                      Twitter
                    </a>
                  </Button>
                )}
                {data?.instagram_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={data.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {getSocialIcon("instagram")}
                      Instagram
                    </a>
                  </Button>
                )}
                {data?.linkedin_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={data.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {getSocialIcon("linkedin")}
                      LinkedIn
                    </a>
                  </Button>
                )}
                {data?.event_report && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={data.event_report}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileText className="h-4 w-4" />
                      Report
                    </a>
                  </Button>
                )}
                {data?.event_video && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={data.event_video}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Video
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Indicators */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={data?.report_submitted ? "default" : "secondary"}
                >
                  {data?.report_submitted ? "✓" : "✗"} Report Submitted
                </Badge>
                <Badge variant={data?.media_uploaded ? "default" : "secondary"}>
                  {data?.media_uploaded ? "✓" : "✗"} Media Uploaded
                </Badge>
                <Badge
                  variant={
                    data?.social_media_promoted ? "default" : "secondary"
                  }
                >
                  {data?.social_media_promoted ? "✓" : "✗"} Social Media
                  Promoted
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p>Program ID: {data?.id ?? "—"}</p>
                  <p>Event ID: {data?.event_id ?? "—"}</p>
                </div>
                <div>
                  <p>
                    Created:{" "}
                    {data?.created_at
                      ? new Date(data.created_at).toLocaleString()
                      : "—"}
                  </p>
                  <p>
                    Updated:{" "}
                    {data?.updated_at
                      ? new Date(data.updated_at).toLocaleString()
                      : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
