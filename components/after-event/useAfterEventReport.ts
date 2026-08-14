"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Upload, FileText, Share2 } from "lucide-react";
import { supabase } from "@/lib/supabase/browserClient";
import type { DbAfterEventReport } from "@/types/database";
import { toast } from "sonner";
import type {
  FormData,
  FileUploads,
  ValidationErrors,
  StepConfig,
} from "./types";

// ---------------------------------------------------------------------------
// Step definitions (static — defined once, referenced by hook and shell)
// ---------------------------------------------------------------------------
export const AFTER_EVENT_STEPS: StepConfig[] = [
  {
    id: 0,
    title: "Event Report Submission",
    description: "Submit detailed event report and summary",
    icon: FileText,
  },
  {
    id: 1,
    title: "Pictures and Videos Upload",
    description: "Upload event media and documentation",
    icon: Upload,
  },
  {
    id: 2,
    title: "Promotion in Social Media",
    description: "Share event success on social platforms",
    icon: Share2,
  },
];

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useAfterEventReport(eventId: string) {
  const { data: session } = useSession();
  const sessionUserId = session?.user?.id ?? null;

  // ── Step progress ──────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);

  // ── Form data ──────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState<FormData>({
    programType: "",
    otherProgramType: "",
    programTheme: "",
    duration: 0,
    startDate: "",
    endDate: "",
    studentParticipants: 0,
    facultyParticipants: 0,
    externalParticipants: 0,
    expenditure: 0,
    remark: "",
    sessionDelivery: "",
    activityLead: "",
    objective: "",
    benefits: "",
    twitterUrl: "",
    instagramUrl: "",
    linkedinUrl: "",
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  // ── File uploads ───────────────────────────────────────────────────────────
  const [fileUploads, setFileUploads] = useState<FileUploads>({
    eventImages: [],
    videoUrl: "",
    eventReport: null,
    permissionLetter: null,
  });

  const imageInputRef = useRef<HTMLInputElement>(null);
  const reportInputRef = useRef<HTMLInputElement>(null);
  const permissionLetterInputRef = useRef<HTMLInputElement>(null);

  // ── Social media checkboxes ────────────────────────────────────────────────
  const [socialMediaChecked, setSocialMediaChecked] = useState({
    twitter: false,
    instagram: false,
    linkedin: false,
  });

  // ── Load existing report on mount ──────────────────────────────────────────
  useEffect(() => {
    const loadExistingReport = async () => {
      if (!sessionUserId) return;
      try {
        const { data, error } = await supabase
          .from("after_event_reports")
          .select("*")
          .eq("submitted_by", sessionUserId)
          .eq("event_id", eventId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Error loading existing report:", error);
          return;
        }

        if (!data) return;

        setReportId(data.id);
        setFormData({
          programType: data.program_type || "",
          otherProgramType: data.other_program_type || "",
          programTheme: data.program_theme || "",
          duration: data.duration_hours || 0,
          startDate: data.start_date || "",
          endDate: data.end_date || "",
          studentParticipants: data.student_participants || 0,
          facultyParticipants: data.faculty_participants || 0,
          externalParticipants: data.external_participants || 0,
          expenditure: Number(data.expenditure_amount || 0),
          remark: data.remark || "",
          sessionDelivery: data.session_delivery_mode || "",
          activityLead: data.activity_lead_by || "",
          objective: data.objective || "",
          benefits: data.benefits || "",
          twitterUrl: data.twitter_url || "",
          instagramUrl: data.instagram_url || "",
          linkedinUrl: data.linkedin_url || "",
        });

        const stepsCompleted: number[] = [];
        if (data.report_submitted) stepsCompleted.push(0);
        if (data.media_uploaded) stepsCompleted.push(1);
        if (data.social_media_promoted) stepsCompleted.push(2);
        setCompletedSteps(stepsCompleted);

        if (!data.report_submitted) setCurrentStep(0);
        else if (!data.media_uploaded) setCurrentStep(1);
        else setCurrentStep(2);
      } catch (e) {
        console.error("Unexpected error loading report:", e);
      }
    };

    loadExistingReport();
  }, [eventId, sessionUserId]);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateStep1 = (): boolean => {
    const errors: ValidationErrors = {};
    if (!formData.programType) errors.programType = "Program type is required";
    if (formData.programType === "other" && !formData.otherProgramType)
      errors.otherProgramType = "Please specify other program type";
    if (!formData.programTheme)
      errors.programTheme = "Program theme is required";
    if (!formData.duration || formData.duration <= 0)
      errors.duration = "Duration must be greater than 0";
    if (!formData.startDate) errors.startDate = "Start date is required";
    if (!formData.endDate) errors.endDate = "End date is required";
    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) > new Date(formData.endDate)
    )
      errors.endDate = "End date must be after start date";
    if (!formData.studentParticipants || formData.studentParticipants < 50)
      errors.studentParticipants = "Minimum 50 student participants required";
    if (!formData.facultyParticipants || formData.facultyParticipants < 0)
      errors.facultyParticipants = "Faculty participants must be 0 or more";
    if (!formData.sessionDelivery)
      errors.sessionDelivery = "Session delivery mode is required";
    if (!formData.activityLead)
      errors.activityLead = "Activity lead is required";
    if (!formData.objective.trim()) errors.objective = "Objective is required";
    if (!formData.benefits.trim())
      errors.benefits = "Benefits description is required";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: ValidationErrors = {};
    if (fileUploads.eventImages.length === 0)
      errors.eventImages = "At least one event image is required";
    if (fileUploads.eventImages.length > 3)
      errors.eventImages = "Maximum 3 images allowed";
    if (!fileUploads.eventReport)
      errors.eventReport = "Event report is required";
    if (!fileUploads.permissionLetter)
      errors.permissionLetter = "Permission letter is required";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── File handlers ──────────────────────────────────────────────────────────
  const handleFileUpload = (
    type: "images" | "report" | "permissionLetter",
    files: FileList | null,
    targetIndex?: number
  ) => {
    if (!files) return;
    const errors: ValidationErrors = {};

    if (type === "images") {
      const file = files[0];
      if (file.size > 3 * 1024 * 1024) {
        errors.eventImages = `Image ${file.name} exceeds 3MB limit`;
        setValidationErrors((prev) => ({ ...prev, ...errors }));
        return;
      }
      if (!file.type.startsWith("image/")) {
        errors.eventImages = `${file.name} is not a valid image file`;
        setValidationErrors((prev) => ({ ...prev, ...errors }));
        return;
      }
      setFileUploads((prev) => {
        const imgs = [...prev.eventImages];
        if (targetIndex !== undefined) {
          imgs[targetIndex] = file;
        } else {
          const empty = imgs.findIndex((img) => !img);
          if (empty !== -1) imgs[empty] = file;
          else if (imgs.length < 3) imgs.push(file);
        }
        return { ...prev, eventImages: imgs };
      });
    } else if (type === "report") {
      const file = files[0];
      if (file.size > 200 * 1024) {
        errors.eventReport = "Report exceeds 200KB limit";
      } else if (
        ![
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(file.type)
      ) {
        errors.eventReport = "Report must be PDF or Word document";
      } else {
        setFileUploads((prev) => ({ ...prev, eventReport: file }));
      }
    } else if (type === "permissionLetter") {
      const file = files[0];
      if (file.size > 5 * 1024 * 1024) {
        errors.permissionLetter = "Permission letter exceeds 5MB limit";
      } else if (
        !file.type.startsWith("image/") &&
        file.type !== "application/pdf"
      ) {
        errors.permissionLetter = "Permission letter must be an image or PDF";
      } else {
        setFileUploads((prev) => ({ ...prev, permissionLetter: file }));
      }
    }

    setValidationErrors((prev) => ({ ...prev, ...errors }));
  };

  const handleVideoUrlChange = (url: string) => {
    setFileUploads((prev) => ({ ...prev, videoUrl: url }));
    if (validationErrors.videoUrl)
      setValidationErrors((prev) => ({ ...prev, videoUrl: "" }));
  };

  const removeFile = (
    type: "images" | "report" | "permissionLetter",
    index?: number
  ) => {
    if (type === "images" && typeof index === "number") {
      setFileUploads((prev) => ({
        ...prev,
        eventImages: prev.eventImages.filter((_, i) => i !== index),
      }));
    } else if (type === "report") {
      setFileUploads((prev) => ({ ...prev, eventReport: null }));
    } else if (type === "permissionLetter") {
      setFileUploads((prev) => ({ ...prev, permissionLetter: null }));
    }
  };

  const updateFormData = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field])
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ── Storage upload helper ──────────────────────────────────────────────────
  const sanitizeFilename = (filename: string): string =>
    filename
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .replace(/_{2,}/g, "_")
      .replace(/^_+|_+$/g, "")
      .toLowerCase();

  const uploadFile = async (
    file: File,
    bucket: string,
    path: string
  ): Promise<string> => {
    const sanitizedPath = sanitizeFilename(path);
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(sanitizedPath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "application/octet-stream",
      });
    if (error) throw error;
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path);
    if (!pub.publicUrl) throw new Error("Failed to get public URL");
    return pub.publicUrl;
  };

  // ── Upsert report row ──────────────────────────────────────────────────────
  const upsertReport = async (
    fields: Partial<DbAfterEventReport>
  ): Promise<string> => {
    if (!sessionUserId) throw new Error("User not authenticated");

    const payload = {
      ...fields,
      event_id: eventId,
      submitted_by: sessionUserId,
      updated_at: new Date().toISOString(),
    };

    if (reportId) {
      const { error } = await supabase
        .from("after_event_reports")
        .update(payload)
        .eq("id", reportId);
      if (error) throw error;
      return reportId;
    } else {
      const { data, error } = await supabase
        .from("after_event_reports")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw error;
      setReportId(data.id);
      return data.id as string;
    }
  };

  // ── Complete a step ────────────────────────────────────────────────────────
  const completeStep = async (stepId: number) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (stepId === 0) {
        if (!validateStep1()) return;
        await upsertReport({
          program_type: formData.programType,
          other_program_type: formData.otherProgramType || null,
          program_theme: formData.programTheme,
          duration_hours: formData.duration,
          start_date: formData.startDate,
          end_date: formData.endDate,
          student_participants: formData.studentParticipants,
          faculty_participants: formData.facultyParticipants,
          external_participants: formData.externalParticipants,
          expenditure_amount: formData.expenditure,
          remark: formData.remark || null,
          session_delivery_mode: formData.sessionDelivery,
          activity_lead_by: formData.activityLead,
          objective: formData.objective,
          benefits: formData.benefits,
          report_submitted: true,
        });
        toast.success("Report saved!");
      } else if (stepId === 1) {
        if (!validateStep2()) return;
        try {
          const imageUrls: string[] = [];
          for (let i = 0; i < fileUploads.eventImages.length; i++) {
            const file = fileUploads.eventImages[i];
            const ext = file.name.split(".").pop() || "jpg";
            const url = await uploadFile(
              file,
              "event-images",
              `${eventId}/image_${Date.now()}_${i}.${ext}`
            );
            imageUrls.push(url);
          }

          let reportUrl: string | null = null;
          if (fileUploads.eventReport) {
            const ext = fileUploads.eventReport.name.split(".").pop() || "pdf";
            reportUrl = await uploadFile(
              fileUploads.eventReport,
              "event-reports",
              `${eventId}/report_${Date.now()}.${ext}`
            );
          }

          let permissionLetterUrl: string | null = null;
          if (fileUploads.permissionLetter) {
            const ext =
              fileUploads.permissionLetter.name.split(".").pop() || "pdf";
            permissionLetterUrl = await uploadFile(
              fileUploads.permissionLetter,
              "permission-letters",
              `${eventId}/permission_letter_${Date.now()}.${ext}`
            );
          }

          if (imageUrls.length === 0 || !reportUrl || !permissionLetterUrl) {
            toast.error(
              "Upload failed. Please ensure at least one image, a report, and a permission letter are uploaded."
            );
            return;
          }

          await upsertReport({
            event_images: imageUrls,
            video_url: fileUploads.videoUrl || null,
            event_report: reportUrl,
            permission_letter: permissionLetterUrl,
            media_uploaded: true,
          });
          toast.success("Files uploaded and saved!");
        } catch (err) {
          console.error("Upload/save failed:", err);
          toast.error("Upload failed. Please try again.");
          return;
        }
      } else if (stepId === 2) {
        await upsertReport({
          twitter_url: formData.twitterUrl || null,
          instagram_url: formData.instagramUrl || null,
          linkedin_url: formData.linkedinUrl || null,
          social_media_promoted: !!(
            formData.twitterUrl ||
            formData.instagramUrl ||
            formData.linkedinUrl
          ),
        });
        toast.success("Social media links saved!");
      }

      if (!completedSteps.includes(stepId))
        setCompletedSteps((prev) => [...prev, stepId]);
      if (stepId < AFTER_EVENT_STEPS.length - 1) setCurrentStep(stepId + 1);
    } catch (error) {
      console.error("Error completing step:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step helpers ───────────────────────────────────────────────────────────
  const isStepCompleted = (stepId: number) => completedSteps.includes(stepId);
  const isStepActive = (stepId: number) => stepId === currentStep;

  return {
    // progress
    completedSteps,
    isStepCompleted,
    isStepActive,
    isSubmitting,
    completeStep,
    // form
    formData,
    updateFormData,
    validationErrors,
    // files
    fileUploads,
    imageInputRef,
    reportInputRef,
    permissionLetterInputRef,
    handleFileUpload,
    handleVideoUrlChange,
    removeFile,
    // social
    socialMediaChecked,
    setSocialMediaChecked,
  };
}
