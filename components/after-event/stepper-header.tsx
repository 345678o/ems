"use client";

import { StepConfig } from "./types";
import { Progress } from "@/components/ui/progress"; // your shadcn Progress

interface StepperHeaderProps {
  steps: StepConfig[];
  isStepCompleted: (stepId: number) => boolean;
  isStepActive: (stepId: number) => boolean;
}

export default function StepperHeader({
  steps,
  isStepCompleted,
  isStepActive,
}: StepperHeaderProps) {
  // Find the active step
  const activeStep = steps.find((step) => isStepActive(step.id));
  const completedCount = steps.filter((step) =>
    isStepCompleted(step.id)
  ).length;

  // Calculate progress as %
  // Formula: Each step represents (100 / steps.length) percentage
  // When on step 0 with nothing completed, show 33.33%
  // When on step 1 (step 0 completed), show 66.66%
  // When all completed, show 100%
  const activeStepIndex = activeStep ? activeStep.id : 0;
  const progressPerStep = 100 / steps.length;
  const progressValue = Math.min(100, (activeStepIndex + 1) * progressPerStep);

  return (
    <div className="mb-8">
      {/* Active Step Title */}
      <div className="mb-2 text-center -ml-10">
        <p className="text-sm font-semibold">
          {activeStep ? activeStep.title : steps[0].title}
        </p>
      </div>

      {/* Progress bar */}
      <Progress value={progressValue} />
    </div>
  );
}
