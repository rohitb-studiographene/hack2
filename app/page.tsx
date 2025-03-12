"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { processRequirements, processWithAI } from "@/lib/actions";
import RequirementsDisplay from "@/components/requirements-display";
import TestCasesDisplay from "@/components/test-cases-display";
import SummaryDisplay from "@/components/summary-display";
import { useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  AlertCircle,
} from "@/components/ui/alert";
import OriginalContentDisplay from "@/components/original-content-display";
import RequirementsParser from "@/components/requirements-parser";

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [content, setContent] = useState<string | null>(null);

  const handleProcessRequirements = async (formData: FormData) => {
    try {
      setIsProcessing(true);
      const result = await processRequirements(formData);
      if (!result.success) {
        setError(result.error ?? "An unknown error occurred");
      } else {
        setError(null);
        setHasContent(true);
        setContent(result.content);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessWithAI = async () => {
    try {
      setIsProcessingAI(true);
      const result = await processWithAI();
      if (!result.success) {
        setError(result.error ?? "An unknown error occurred");
      } else {
        setError(null);
      }
    } finally {
      setIsProcessingAI(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-10 px-4">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
          Requirements Processor
        </h1>

        {error && (
          <Alert
            variant="destructive"
            className="mb-6 animate-in slide-in-from-top duration-300"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card className="lg:col-span-2 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl">Input Requirements</CardTitle>
              <CardDescription className="text-lg">
                Enter a Confluence
              </CardDescription>
            </CardHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                handleProcessRequirements(formData);
              }}
            >
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-base">
                    Confluence URL
                  </Label>
                  <Textarea
                    id="url"
                    name="url"
                    placeholder="@company.atlassian.net/wiki/spaces/PROJECT/pages/123456/Page+Name"
                    className="h-12 resize-none"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex gap-4">
                <Button
                  type="submit"
                  className="w-full h-12 text-lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin mr-2 h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                      Fetching from Confluence API...
                    </>
                  ) : (
                    "Fetch Content"
                  )}
                </Button>

                {hasContent && (
                  <Button
                    onClick={handleProcessWithAI}
                    className="w-full h-12 text-lg bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500"
                    disabled={isProcessingAI}
                  >
                    {isProcessingAI ? (
                      <>
                        <div className="animate-spin mr-2 h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                        Processing with AI...
                      </>
                    ) : (
                      "Process with AI"
                    )}
                  </Button>
                )}
              </CardFooter>
            </form>
          </Card>
        </div>

        <Tabs defaultValue="original" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6 p-1 bg-muted/50 rounded-lg">
            <TabsTrigger value="original" className="text-base py-3">
              Original Content
            </TabsTrigger>
            <TabsTrigger value="requirements" className="text-base py-3">
              Requirements
            </TabsTrigger>
            <TabsTrigger value="testcases" className="text-base py-3">
              QA Test Cases
            </TabsTrigger>
            <TabsTrigger value="summary" className="text-base py-3">
              Dev Summaries
            </TabsTrigger>
          </TabsList>
          <div className="rounded-lg overflow-hidden shadow-lg">
            <TabsContent value="original">
              <OriginalContentDisplay />
            </TabsContent>
            <TabsContent value="requirements">
              <RequirementsDisplay />
            </TabsContent>
            <TabsContent value="testcases">
              <TestCasesDisplay />
            </TabsContent>
            <TabsContent value="summary">
              <SummaryDisplay />
            </TabsContent>
          </div>
        </Tabs>

        {content && <RequirementsParser content={content} />}
      </div>
    </main>
  );
}
