"use client";

import { useEffect } from "react";
import { processDocument } from "@/lib/actions";

interface RequirementsParserProps {
  content: string;
}

export default function RequirementsParser({
  content,
}: RequirementsParserProps) {
  useEffect(() => {
    const parseContent = async () => {
      try {
        await processDocument(content);
      } catch (error) {
        console.error("Error processing document:", error);
      }
    };

    if (content) {
      parseContent();
    }
  }, [content]);

  return null; // This is a utility component that doesn't render anything
}
