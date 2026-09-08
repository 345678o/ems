"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { StepConfig } from "./types";

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
  return (
    <div className="mb-2">
      <div className="flex items-start">
        {steps.map((step, index) => {
          const completed = isStepCompleted(step.id);
          const active = isStepActive(step.id);
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center",
                index < steps.length - 1 && "flex-1"
              )}
            >
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div
                  className={cn(
                    "h-11 w-11 rounded-full flex items-center justify-center border-2 transition-colors shrink-0",
                    completed
                      ? "bg-[#FFAA33] border-[#FFAA33] text-black"
                      : active
                      ? "border-[#FFAA33] text-[#FFAA33] bg-transparent"
                      : "border-neutral-300 dark:border-neutral-700 text-neutral-400 dark:text-neutral-500 bg-transparent"
                  )}
                >
                  {completed ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div className="text-center max-w-[140px]">
                  <p
                    className={cn(
                      "text-xs font-medium leading-tight",
                      active || completed
                        ? "text-neutral-900 dark:text-white"
                        : "text-neutral-400 dark:text-neutral-500"
                    )}
                  >
                    {step.title}
                  </p>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2 -mt-6",
                    completed ? "bg-[#FFAA33]" : "bg-neutral-300 dark:bg-neutral-700"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
