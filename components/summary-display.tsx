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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Code, Database, FileJson } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getGeneratedSummaries } from "@/lib/actions";
import { useSummary } from "@/lib/hooks";
import { marked } from "marked";

interface RequirementItem {
  id: string;
  title: string;
  description: string;
  acceptance: string[];
  complexity: "low" | "medium" | "high";
}

interface RequirementCategory {
  category: string;
  items: RequirementItem[];
}

interface ModuleSummary {
  module: string;
  summary: {
    frontend: RequirementCategory[];
    backend: RequirementCategory[];
  };
}

export default function SummaryDisplay() {
  const summary = useSummary();

  if (!summary) return <div className="p-6">No summary generated yet.</div>;

  return (
    <div className="p-6 prose prose-blue max-w-none dark:prose-invert">
      <h2 className="text-2xl font-bold mb-4">Development Summary</h2>
      <div dangerouslySetInnerHTML={{ __html: marked(summary) }} />
    </div>
  );
}
