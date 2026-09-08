"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Upload,
  AlertCircle,
  X,
  Image,
  Video,
  FileText,
  Link,
} from "lucide-react";
import type { FileUploads, ValidationErrors } from "./types";
import React, { RefObject } from "react";

interface UploadsStepCardProps {
  isActive: boolean;
  isCompleted: boolean;
  isSubmitting: boolean;
  fileUploads: FileUploads;
  imageInputRef: RefObject<HTMLInputElement | null>;
  reportInputRef: RefObject<HTMLInputElement | null>;
  permissionLetterInputRef: RefObject<HTMLInputElement | null>;
  handleFileUpload: (
    type: "images" | "report" | "permissionLetter",
    files: FileList | null,
    targetIndex?: number
  ) => void;
  handleVideoUrlChange: (url: string) => void;
  removeFile: (
    type: "images" | "report" | "permissionLetter",
    index?: number
  ) => void;
  validationErrors: ValidationErrors;
  completeStep: (stepId: number) => void;
}

// Helper component for individual image upload box
const ImageUploadBox = ({
  index,
  file,
  onUpload,
  onRemove,
  hasError,
}: {
  index: number;
  file: File | undefined;
  onUpload: () => void;
  onRemove: () => void;
  hasError: boolean;
}) => {
  return (
    <div
      className={`relative aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center ${
        hasError ? "border-red-500" : "border-neutral-700"
      } hover:border-neutral-600 transition-colors`}
    >
      {file ? (
        <>
          {/* Preview for image files */}
          {file.type.startsWith("image/") ? (
            <div className="relative w-full h-full">
              <img
                src={URL.createObjectURL(file)}
                alt="Preview"
                className="w-full h-full object-cover rounded-md"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <div className="text-center p-2">
              <Image className="w-6 h-6 mx-auto mb-1 text-green-500" />
              <p className="text-xs text-center break-words">{file.name}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="mt-1 h-6 text-red-400 hover:text-red-300"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center p-4 cursor-pointer" onClick={onUpload}>
          <Image className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-xs text-gray-400 mb-2">Image {index + 1}</p>
          <Button
            variant="outline"
            size="sm"
            className="text-xs border-neutral-700 hover:bg-neutral-800 bg-transparent"
          >
            Browse
          </Button>
        </div>
      )}
    </div>
  );
};

export default function UploadsStepCard({
  isActive,
  isCompleted,
  isSubmitting,
  fileUploads,
  imageInputRef,
  reportInputRef,
  permissionLetterInputRef,
  handleFileUpload,
  handleVideoUrlChange,
  removeFile,
  validationErrors,
  completeStep,
}: UploadsStepCardProps) {
  const [targetImageIndex, setTargetImageIndex] = React.useState<
    number | undefined
  >(undefined);

  return (
    <Card
      aria-disabled={!isActive}
      className={`bg-transparent border-neutral-800 ${
        !isActive ? "pointer-events-none" : ""
      }`}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Pictures and Videos Upload
          {isCompleted && <Badge className="bg-green-500">Completed</Badge>}
        </CardTitle>
        <CardDescription className="text-gray-400">
          Upload event media and documentation
        </CardDescription>
        <a
          href="https://www.dropbox.com/scl/fi/fl3nngu4kxaj7jbluw8cc/CIE-Event-report-format-September-2025.docx?rlkey=i1m8irvk1nxf2t3la7te35sow&st=6fi68mec&raw=1"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors mt-2"
        >
          <Link className="w-4 h-4" />
          Download Report Format
        </a>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hidden file inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
              handleFileUpload("images", files, targetImageIndex);
              // Reset input to allow selecting the same file again
              e.target.value = "";
              setTargetImageIndex(undefined);
            }
          }}
          className="hidden"
        />
        <input
          ref={reportInputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => handleFileUpload("report", e.target.files)}
          className="hidden"
        />
        <input
          ref={permissionLetterInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => handleFileUpload("permissionLetter", e.target.files)}
          className="hidden"
        />

        {/* Horizontal layout with four sections */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video URL Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              <Label className="text-sm font-medium">Video URL</Label>
            </div>
            <div className="space-y-2">
              <Input
                type="url"
                placeholder="https://youtube.com/..."
                value={fileUploads.videoUrl}
                onChange={(e) => handleVideoUrlChange(e.target.value)}
                className={`bg-transparent border-neutral-700 ${
                  validationErrors.videoUrl ? "border-red-500" : ""
                }`}
              />
              {validationErrors.videoUrl && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.videoUrl}
                </p>
              )}
            </div>
          </div>

          {/* Images Upload Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              <Label className="text-sm font-medium">Images *</Label>
              <span className="text-xs text-gray-400">(Max 3, 3MB each)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((index) => (
                <ImageUploadBox
                  key={index}
                  index={index}
                  file={fileUploads.eventImages[index]}
                  onUpload={() => {
                    setTargetImageIndex(index);
                    imageInputRef.current?.click();
                  }}
                  onRemove={() => removeFile("images", index)}
                  hasError={!!validationErrors.eventImages}
                />
              ))}
            </div>
            {validationErrors.eventImages && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.eventImages}
              </p>
            )}
          </div>

          {/* Report Upload Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <Label className="text-sm font-medium">Report *</Label>
              <span className="text-xs text-gray-400">(Max 200KB)</span>
            </div>
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center h-40 flex flex-col items-center justify-center ${
                validationErrors.eventReport
                  ? "border-red-500"
                  : "border-neutral-700"
              } hover:border-neutral-600 transition-colors`}
            >
              {fileUploads.eventReport ? (
                <div className="text-center">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-xs text-center break-words px-2">
                    {fileUploads.eventReport.name}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile("report")}
                    className="mt-2 text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="cursor-pointer"
                  onClick={() => reportInputRef.current?.click()}
                >
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-xs mb-2">Upload PDF/Word</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-neutral-700 hover:bg-neutral-800 bg-transparent"
                  >
                    Browse
                  </Button>
                </div>
              )}
            </div>
            {validationErrors.eventReport && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.eventReport}
              </p>
            )}
          </div>

          {/* Permission Letter Upload Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <Label className="text-sm font-medium">Permission Letter *</Label>
              <span className="text-xs text-gray-400">(Image/PDF)</span>
            </div>
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center h-40 flex flex-col items-center justify-center ${
                validationErrors.permissionLetter
                  ? "border-red-500"
                  : "border-neutral-700"
              } hover:border-neutral-600 transition-colors`}
            >
              {fileUploads.permissionLetter ? (
                <div className="text-center">
                  {fileUploads.permissionLetter.type.startsWith("image/") ? (
                    <div className="relative w-full h-full">
                      <img
                        src={URL.createObjectURL(fileUploads.permissionLetter)}
                        alt="Permission Letter Preview"
                        className="w-full h-24 object-contain rounded-md mb-2"
                      />
                    </div>
                  ) : (
                    <FileText className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  )}
                  <p className="text-xs text-center break-words px-2">
                    {fileUploads.permissionLetter.name}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile("permissionLetter")}
                    className="mt-2 text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="cursor-pointer"
                  onClick={() => permissionLetterInputRef.current?.click()}
                >
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-xs mb-2">Upload Image/PDF</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-neutral-700 hover:bg-neutral-800 bg-transparent"
                  >
                    Browse
                  </Button>
                </div>
              )}
            </div>
            {validationErrors.permissionLetter && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.permissionLetter}
              </p>
            )}
          </div>
        </div>

        {!isCompleted && (
          <div className="flex gap-2">
            <Button
              onClick={() => completeStep(1)}
              disabled={!isActive || isSubmitting}
              className="bg-orange-400 hover:bg-orange-500 text-white disabled:opacity-50"
            >
              {isSubmitting ? "Uploading..." : "Confirm Upload"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
