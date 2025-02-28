"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { getProcessedRequirements, getIdentifiedModules } from "@/lib/actions";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useRequirements } from "@/lib/hooks";
import { marked } from "marked";

export default function RequirementsDisplay() {
  const requirements = useRequirements();

  if (!requirements)
    return <div className="p-6">No requirements processed yet.</div>;

  return (
    <div className="p-6 prose prose-blue max-w-none dark:prose-invert">
      <h2 className="text-2xl font-bold mb-4">Requirements Analysis</h2>
      <div dangerouslySetInnerHTML={{ __html: marked(requirements) }} />
    </div>
  );
}
