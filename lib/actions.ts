"use server";

import { revalidatePath } from "next/cache";
import { getAIProvider } from "./ai-providers";
import { extractRequirements, processContent } from "./extractors";
import { cookies } from "next/headers";

// Process requirements from URL
export async function processRequirements(formData: FormData) {
  try {
    const url = formData.get("url") as string;

    console.log("Input received:", { url });

    if (!url) {
      console.log("Missing URL");
      return {
        success: false,
        error: "Confluence URL is required",
      };
    }

    // Fetch content from URL
    console.log("Fetching content from URL...");
    const processedContent = await processContent(url);
    console.log(
      "Raw processed content:",
      processedContent.substring(0, 500) + "..."
    );

    // Store original content
    console.log("Storing original content...");
    await storeOriginalContent(processedContent);

    return {
      success: true,
      data: {
        originalContent: processedContent,
      },
    };
  } catch (error) {
    console.error("Process requirements error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while processing requirements",
    };
  }
}

// New action to process content through AI
export async function processWithAI() {
  try {
    // Get the stored original content
    const originalContent = await getOriginalContent();

    if (!originalContent) {
      return {
        success: false,
        error: "No content available to process",
      };
    }

    console.log("Sending to AI for analysis...");
    const aiResponse = await getAIProvider(originalContent);
    console.log("AI Response:", {
      success: aiResponse.success,
      sections: {
        requirements:
          aiResponse.sections.requirements.substring(0, 100) + "...",
        testCases: aiResponse.sections.testCases.substring(0, 100) + "...",
        summary: aiResponse.sections.summary.substring(0, 100) + "...",
      },
    });

    if (!aiResponse.success) {
      return {
        success: false,
        error: aiResponse.error || "Failed to analyze requirements",
      };
    }

    // Store the processed sections
    cookies().set("processedRequirements", aiResponse.sections.requirements);
    cookies().set("generatedTestCases", aiResponse.sections.testCases);
    cookies().set("generatedSummaries", aiResponse.sections.summary);

    return {
      success: true,
      data: aiResponse.sections,
    };
  } catch (error) {
    console.error("AI processing error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to process with AI",
    };
  }
}

// Get the processed requirements
export async function getProcessedRequirements() {
  const requirementsText = cookies().get("processedRequirements")?.value;
  return requirementsText || null;
}

// Get the identified modules
export async function getIdentifiedModules() {
  const modulesJson = cookies().get("identifiedModules")?.value;

  if (!modulesJson) {
    return null;
  }

  try {
    return JSON.parse(modulesJson);
  } catch (e) {
    console.error("Failed to parse identified modules from cookie:", e);
    return null;
  }
}

// Get the generated test cases
export async function getGeneratedTestCases() {
  const testCasesJson = cookies().get("generatedTestCases")?.value;

  if (!testCasesJson) {
    return null;
  }

  try {
    return JSON.parse(testCasesJson);
  } catch (e) {
    console.error("Failed to parse test cases from cookie:", e);
    return null;
  }
}

// Get the generated summaries
export async function getGeneratedSummaries() {
  const summariesJson = cookies().get("generatedSummaries")?.value;

  if (!summariesJson) {
    return null;
  }

  try {
    return JSON.parse(summariesJson);
  } catch (e) {
    console.error("Failed to parse summaries from cookie:", e);
    return null;
  }
}

// Store original content in cookie
export async function storeOriginalContent(content: string) {
  try {
    if (!content) {
      console.error("No content to store");
      return;
    }

    // Clean and truncate the content if needed (cookies have size limits)
    const maxLength = 4096; // Maximum size for cookies
    const cleanContent = content
      .replace(/\u0000/g, "") // Remove null characters
      .replace(/[\u0080-\uffff]/g, "") // Remove non-ASCII characters
      .trim()
      .substring(0, maxLength);

    console.log("Storing content length:", cleanContent.length);

    // Store in chunks if needed
    const chunks = cleanContent.match(/.{1,4096}/g) || [];

    // Clear existing chunks
    cookies().delete("originalContent");
    cookies().delete("contentChunks");

    if (chunks.length > 1) {
      // Store number of chunks
      cookies().set("contentChunks", String(chunks.length), {
        maxAge: 3600,
        path: "/",
      });

      // Store each chunk
      chunks.forEach((chunk, index) => {
        cookies().set(`originalContent_${index}`, chunk, {
          maxAge: 3600,
          path: "/",
        });
      });
    } else {
      // Store as single cookie if small enough
      cookies().set("originalContent", cleanContent, {
        maxAge: 3600,
        path: "/",
        httpOnly: true,
      });
    }

    console.log("Content stored successfully");
  } catch (error) {
    console.error("Error storing content:", error);
  }
}

// Update the getter to handle chunks
export async function getOriginalContent() {
  const chunks = cookies().get("contentChunks")?.value;

  if (chunks) {
    // Reconstruct from chunks
    const numChunks = parseInt(chunks, 10);
    let content = "";

    for (let i = 0; i < numChunks; i++) {
      const chunk = cookies().get(`originalContent_${i}`)?.value || "";
      content += chunk;
    }

    return content;
  }

  // Fall back to single cookie
  return cookies().get("originalContent")?.value || null;
}
