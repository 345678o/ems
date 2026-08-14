"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, FileText, AlertCircle } from "lucide-react";
import type { FormData, ValidationErrors } from "./types";

interface ReportStepCardProps {
  isActive: boolean;
  isCompleted: boolean;
  formData: FormData;
  updateFormData: (field: keyof FormData, value: string | number) => void;
  validationErrors: ValidationErrors;
  isSubmitting: boolean;
  completeStep: (stepId: number) => void;
}

export default function ReportStepCard({
  isActive,
  isCompleted,
  formData,
  updateFormData,
  validationErrors,
  isSubmitting,
  completeStep,
}: ReportStepCardProps) {
  return (
    <Card
      aria-disabled={!isActive}
      className={`dark:bg-neutral-800 bg-white border-neutral-800 ${
        !isActive ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Event Report Submission
              {isCompleted && (
                <Badge className="bg-green-500 text-white">Completed</Badge>
              )}
            </CardTitle>
            <CardDescription className="text-gray-400">
              Provide a comprehensive summary of the event
            </CardDescription>
          </div>
          <a
            href="https://www.dropbox.com/scl/fi/fl3nngu4kxaj7jbluw8cc/CIE-Event-report-format-September-2025.docx?rlkey=i1m8irvk1nxf2t3la7te35sow&e=1&st=27qddcv7&dl=1"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            <FileText className="w-4 h-4" />
            Download Report Format
          </a>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="program-type">Program Type *</Label>
            <Select
              value={formData.programType}
              onValueChange={(value) => updateFormData("programType", value)}
            >
              <SelectTrigger
                className={`border-neutral-700 mt-2 ${
                  validationErrors.programType ? "border-red-500" : ""
                }`}
              >
                <SelectValue placeholder="Select program type" />
              </SelectTrigger>
              <SelectContent className="border-neutral-700">
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="seminar">Seminar</SelectItem>
                <SelectItem value="conference">Conference</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {validationErrors.programType && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.programType}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="other-program">Other</Label>
            <Input
              id="other-program"
              value={formData.otherProgramType}
              onChange={(e) =>
                updateFormData("otherProgramType", e.target.value)
              }
              placeholder="Specify if other"
              className={`border-neutral-700 mt-2 ${
                validationErrors.otherProgramType ? "border-red-500" : ""
              }`}
              disabled={formData.programType !== "other"}
            />
            {validationErrors.otherProgramType && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.otherProgramType}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="program-theme">Program Theme *</Label>
            <Select
              value={formData.programTheme}
              onValueChange={(value) => updateFormData("programTheme", value)}
            >
              <SelectTrigger
                className={`border-neutral-700 mt-2 ${
                  validationErrors.programTheme ? "border-red-500" : ""
                }`}
              >
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent className="border-neutral-700">
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="health">Health</SelectItem>
              </SelectContent>
            </Select>
            {validationErrors.programTheme && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.programTheme}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="duration">
              Duration of the activity (in hours) *
            </Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration || ""}
              onChange={(e) =>
                updateFormData("duration", parseInt(e.target.value) || 0)
              }
              placeholder="4"
              className={`border-neutral-700 mt-2 ${
                validationErrors.duration ? "border-red-500" : ""
              }`}
            />
            {validationErrors.duration && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.duration}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start-date">Start Date *</Label>
            <div className="relative">
              <Input
                id="start-date"
                type="date"
                value={formData.startDate}
                onChange={(e) => updateFormData("startDate", e.target.value)}
                className={`border-neutral-700 mt-2 ${
                  validationErrors.startDate ? "border-red-500" : ""
                }`}
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div>
            <Label htmlFor="end-date">End Date *</Label>
            <div className="relative">
              <Input
                id="end-date"
                type="date"
                value={formData.endDate}
                onChange={(e) => updateFormData("endDate", e.target.value)}
                className={`border-neutral-700 mt-2 ${
                  validationErrors.endDate ? "border-red-500" : ""
                }`}
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="student-participants">
              Number of Student Participants (Minimum 50 Students) *
            </Label>
            <Input
              id="student-participants"
              type="number"
              min={0}
              value={
                formData.studentParticipants === 0
                  ? "0"
                  : formData.studentParticipants || ""
              }
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || parseInt(value) >= 0) {
                  updateFormData(
                    "studentParticipants",
                    value === "" ? 0 : parseInt(value)
                  );
                }
              }}
              placeholder="75"
              className={`border-neutral-700 mt-2 ${
                validationErrors.studentParticipants ? "border-red-500" : ""
              }`}
            />
            {validationErrors.studentParticipants && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.studentParticipants}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="faculty-participants">
              Number of Faculty Participants *
            </Label>
            <Input
              id="faculty-participants"
              type="number"
              min={0}
              value={
                formData.facultyParticipants === 0
                  ? "0"
                  : formData.facultyParticipants || ""
              }
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || parseInt(value) >= 0) {
                  updateFormData(
                    "facultyParticipants",
                    value === "" ? 0 : parseInt(value)
                  );
                }
              }}
              placeholder="10"
              className={`border-neutral-700 mt-2 ${
                validationErrors.facultyParticipants ? "border-red-500" : ""
              }`}
            />
            {validationErrors.facultyParticipants && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.facultyParticipants}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="external-participants">
              Number of External Participants, if any
            </Label>
            <Input
              id="external-participants"
              type="number"
              min={0}
              value={
                formData.externalParticipants === 0
                  ? "0"
                  : formData.externalParticipants || ""
              }
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || parseInt(value) >= 0) {
                  updateFormData(
                    "externalParticipants",
                    value === "" ? 0 : parseInt(value)
                  );
                }
              }}
              placeholder="5"
              className={`border-neutral-700 mt-2 ${
                validationErrors.externalParticipants ? "border-red-500" : ""
              }`}
            />
          </div>
          <div>
            <Label htmlFor="expenditure">Expenditure Amount, if any</Label>
            <Input
              id="expenditure"
              type="number"
              value={formData.expenditure || ""}
              onChange={(e) =>
                updateFormData("expenditure", parseFloat(e.target.value) || 0)
              }
              placeholder="15000"
              className={`border-neutral-700 mt-2 ${
                validationErrors.expenditure ? "border-red-500" : ""
              }`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="remark">Remark</Label>
            <Textarea
              id="remark"
              value={formData.remark}
              onChange={(e) => updateFormData("remark", e.target.value)}
              placeholder="Additional remarks..."
              className={`border-neutral-700 mt-2 ${
                validationErrors.remark ? "border-red-500" : ""
              }`}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="session-delivery">Mode of Session delivery *</Label>
            <Select
              value={formData.sessionDelivery}
              onValueChange={(value) =>
                updateFormData("sessionDelivery", value)
              }
            >
              <SelectTrigger
                className={`border-neutral-700 mt-2 ${
                  validationErrors.sessionDelivery ? "border-red-500" : ""
                }`}
              >
                <SelectValue placeholder="Select delivery mode" />
              </SelectTrigger>
              <SelectContent className="border-neutral-700">
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
            {validationErrors.sessionDelivery && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.sessionDelivery}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="activity-lead">Activity Lead By *</Label>
          <Input
            id="activity-lead"
            value={formData.activityLead}
            onChange={(e) => updateFormData("activityLead", e.target.value)}
            placeholder="e.g., Dr. John Doe, Prof. Jane Smith"
            className={`border-neutral-700 mt-2 ${
              validationErrors.activityLead ? "border-red-500" : ""
            }`}
          />
          {validationErrors.activityLead && (
            <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {validationErrors.activityLead}
            </p>
          )}
        </div>

        <div className="border-t border-neutral-700 pt-6">
          <h3 className="text-lg font-medium mb-4">Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="objective">Objective *</Label>
              <Textarea
                id="objective"
                value={formData.objective}
                onChange={(e) => updateFormData("objective", e.target.value)}
                placeholder="Describe the main objectives..."
                className={`border-neutral-700 mt-2 ${
                  validationErrors.objective ? "border-red-500" : ""
                }`}
                rows={4}
              />
              {validationErrors.objective && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.objective}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="benefits">
                Benefit in terms of learning/skill/knowledge obtained *
              </Label>
              <Textarea
                id="benefits"
                value={formData.benefits}
                onChange={(e) => updateFormData("benefits", e.target.value)}
                placeholder="Describe the benefits gained..."
                className={`border-neutral-700 mt-2 ${
                  validationErrors.benefits ? "border-red-500" : ""
                }`}
                rows={4}
              />
              {validationErrors.benefits && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.benefits}
                </p>
              )}
            </div>
          </div>
        </div>

        {!isCompleted && (
          <Button
            onClick={() => completeStep(0)}
            disabled={!isActive || isSubmitting}
            className="bg-orange-400 hover:bg-orange-500 text-white disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
