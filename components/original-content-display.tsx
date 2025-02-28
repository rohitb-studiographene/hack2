"use client";

import { useState, useEffect } from "react";
import { useOriginalContent } from "@/lib/hooks";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function OriginalContentDisplay() {
  const content = useOriginalContent();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (content !== undefined) {
      setIsLoading(false);
    }
  }, [content]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>No content processed yet.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Original Content</h2>
        <ScrollArea className="h-[500px] rounded-md border p-4">
          <div className="whitespace-pre-wrap prose prose-sm max-w-none">
            {content.split("\n").map((paragraph, index) =>
              paragraph.trim() ? (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ) : null
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
