"use client";

import { CalendarCheck } from "lucide-react";
import { Anton } from "next/font/google";
import StepperHeader from "@/components/after-event/StepperHeader";
import ReportStepCard from "@/components/after-event/ReportStepCard";
import UploadsStepCard from "@/components/after-event/UploadsStepCard";
import SocialStepCard from "@/components/after-event/SocialStepCard";
import CompletionCard from "@/components/after-event/CompletionCard";
import {
  useAfterEventReport,
  AFTER_EVENT_STEPS,
} from "@/components/after-event/useAfterEventReport";

const anton = Anton({ weight: "400", subsets: ["latin"] });

interface AfterEventPageProps {
  eventId: string;
}

export function AfterEventPage({ eventId }: AfterEventPageProps) {
  const {
    completedSteps,
    isStepCompleted,
    isStepActive,
    isSubmitting,
    completeStep,
    formData,
    updateFormData,
    validationErrors,
    fileUploads,
    imageInputRef,
    reportInputRef,
    permissionLetterInputRef,
    handleFileUpload,
    handleVideoUrlChange,
    removeFile,
    socialMediaChecked,
    setSocialMediaChecked,
  } = useAfterEventReport(eventId);

  return (
    <div className="bg-white dark:bg-[#141414]">
      {/* Sticky Header Section */}
      <div className="sticky top-18 z-40 bg-white dark:bg-[#141414] border-b border-neutral-200 dark:border-neutral-800">
        <div className="px-6 pt-6">
          <div className="flex items-center gap-3 mb-6">
            <CalendarCheck className="w-6 h-6 text-[#FFAA33]" />
            <h1
              className={`${anton.className} text-neutral-900 dark:text-white text-2xl tracking-wide`}
            >
              After Event
            </h1>
          </div>
        </div>
        <div className="px-2 pt-1">
          <StepperHeader
            steps={AFTER_EVENT_STEPS}
            isStepCompleted={isStepCompleted}
            isStepActive={isStepActive}
          />
        </div>
      </div>

      {/* Scrollable step cards */}
      <div className="p-6 space-y-6 bg-transparent">
        <ReportStepCard
          isActive={isStepActive(0)}
          isCompleted={isStepCompleted(0)}
          formData={formData}
          updateFormData={updateFormData}
          validationErrors={validationErrors}
          isSubmitting={isSubmitting}
          completeStep={completeStep}
        />

        <UploadsStepCard
          isActive={isStepActive(1)}
          isCompleted={isStepCompleted(1)}
          isSubmitting={isSubmitting}
          fileUploads={fileUploads}
          imageInputRef={imageInputRef}
          reportInputRef={reportInputRef}
          permissionLetterInputRef={permissionLetterInputRef}
          handleFileUpload={handleFileUpload}
          handleVideoUrlChange={handleVideoUrlChange}
          removeFile={removeFile}
          validationErrors={validationErrors}
          completeStep={completeStep}
        />

        <SocialStepCard
          isActive={isStepActive(2)}
          isCompleted={isStepCompleted(2)}
          isSubmitting={isSubmitting}
          formData={formData}
          updateFormData={updateFormData}
          socialMediaChecked={socialMediaChecked}
          setSocialMediaChecked={setSocialMediaChecked}
          completeStep={completeStep}
        />
      </div>

      {completedSteps.length === AFTER_EVENT_STEPS.length && <CompletionCard />}
    </div>
  );
}
