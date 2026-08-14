"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function CompletionCard() {
  return (
    <Card className="bg-green-900/20 border-green-500/30 mt-6">
      <CardContent className="p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          All Steps Completed!
        </h3>
        <p className="text-gray-300">
          Your after-event process has been successfully completed.
        </p>
      </CardContent>
    </Card>
  );
}
