"use client";

import { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import type { FormField } from "./types";

interface FormsTabProps {
  formFields: FormField[];
  newField: Partial<FormField> & {
    type?: FormsTabPropsFieldType;
    required?: boolean;
    label?: string;
  };
  setNewField: Dispatch<SetStateAction<Partial<FormField>>>;
  addFormField: () => Promise<void> | void;
  removeFormField: (id: string) => Promise<void> | void;
}

type FormsTabPropsFieldType =
  "text" | "email" | "number" | "textarea" | "select" | "checkbox";

export default function FormsTab({
  formFields,
  newField,
  setNewField,
  addFormField,
  removeFormField,
}: FormsTabProps) {
  return (
    <Card className="bg-neutral-900 border-neutral-700">
      <CardHeader>
        <CardTitle className="text-white">Form Creator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border border-neutral-600 rounded-lg p-4">
          <h3 className="text-white font-medium mb-4">Add New Field</h3>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <Label className="text-white">Field Type</Label>
              <Select
                value={newField.type as FormsTabPropsFieldType}
                onValueChange={(value) =>
                  setNewField({
                    ...newField,
                    type: value as FormsTabPropsFieldType,
                  })
                }
              >
                <SelectTrigger className="bg-neutral-800 border-neutral-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="textarea">Textarea</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white">Label</Label>
              <Input
                value={newField.label || ""}
                onChange={(e) =>
                  setNewField({ ...newField, label: e.target.value })
                }
                className="bg-neutral-800 border-neutral-600 text-white"
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                checked={!!newField.required}
                onCheckedChange={(checked) =>
                  setNewField({ ...newField, required: checked })
                }
              />
              <Label className="text-white">Required</Label>
            </div>
            <div className="pt-6">
              <Button
                onClick={addFormField}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-white font-medium">Form Fields</h3>
          {formFields.map((field) => (
            <div
              key={field.id}
              className="flex items-center justify-between bg-neutral-800 p-3 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <Badge
                  variant="outline"
                  className="text-white border-neutral-600"
                >
                  {field.type}
                </Badge>
                <span className="text-white">{field.label}</span>
                {field.required && (
                  <Badge className="bg-red-600">Required</Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFormField(field.id)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {formFields.length === 0 && (
            <p className="text-neutral-400 text-center py-8">
              No form fields created yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
