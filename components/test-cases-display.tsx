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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { getGeneratedTestCases } from "@/lib/actions";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTestCases } from "@/lib/hooks";
import { marked } from "marked";

interface TestCase {
  id: string;
  title: string;
  description: string;
  steps: string[];
  expectedResult: string;
  priority: "high" | "medium" | "low";
  type: "functional" | "integration" | "edge-case" | "performance";
}

interface ModuleTestCases {
  module: string;
  testCases: TestCase[];
}

export default function TestCasesDisplay() {
  const testCases = useTestCases();

  if (!testCases)
    return <div className="p-6">No test cases generated yet.</div>;

  return (
    <div className="p-6 prose prose-blue max-w-none dark:prose-invert">
      <h2 className="text-2xl font-bold mb-4">QA Test Cases</h2>
      <div dangerouslySetInnerHTML={{ __html: marked(testCases) }} />
    </div>
  );
}
