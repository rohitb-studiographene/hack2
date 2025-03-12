import { load } from "cheerio";
import {
  extractConfluencePageInfo,
  fetchConfluenceContent,
  convertStorageFormatToText,
} from "./confluence-api";

interface ExtractionResult {
  text: string;
  success: boolean;
  error?: string;
  modules: string[];
}

// Extract requirements from Confluence URL
export async function extractRequirements(
  url: string,
  credentials?: string
): Promise<ExtractionResult> {
  try {
    // Check if it's a valid Confluence URL (Atlassian format)
    if (!url.includes("atlassian.net/wiki/spaces")) {
      return {
        text: "",
        success: false,
        error:
          "Only Atlassian Confluence URLs are supported (e.g., https://company.atlassian.net/wiki/spaces/...)",
        modules: [],
      };
    }
    return await extractFromConfluence(url, credentials);
  } catch (error) {
    console.error("Error extracting requirements:", error);
    return {
      text: "",
      success: false,
      error: "Failed to extract requirements",
      modules: [],
    };
  }
}

// Extract from Confluence
async function extractFromConfluence(
  url: string,
  credentials?: string
): Promise<ExtractionResult> {
  try {
    if (!url) {
      return {
        text: "",
        success: false,
        error: "URL is required",
        modules: [],
      };
    }

    // Extract page info from URL
    const pageInfo = extractConfluencePageInfo(url);
    if (!pageInfo) {
      return {
        text: "",
        success: false,
        error:
          "Invalid Confluence URL format. Please use format: @company.atlassian.net/wiki/spaces/PROJECT/pages/123456/Page+Name",
        modules: [],
      };
    }

    // Log the extracted page info
    console.log("Extracted page info:", pageInfo);

    try {
      // Fetch content using Confluence API
      console.log("Fetching content for page:", pageInfo.id);
      const rawContent = await fetchConfluenceContent(pageInfo.id);

      // Convert content to plain text
      const content = convertStorageFormatToText(rawContent);

      // Extract requirements from the content
      const requirements = content.split("\n").filter((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.length < 5) return false;

        return (
          trimmed.match(
            /^(requirement|req|must|should|shall|will|needs to|user can|system should|application must)/i
          ) ||
          trimmed.match(/^(\d+\.|\*|\-|\•)/) ||
          trimmed.startsWith("#") // Headers
        );
      });

      const formattedContent = requirements.join("\n\n");

      if (!formattedContent) {
        throw new Error("No requirements found in the Confluence page");
      }

      // Log the extracted content for debugging
      console.log("Extracted requirements count:", requirements.length);
      console.log("Sample requirements:", requirements.slice(0, 3));

      return {
        text: formattedContent,
        success: true,
        modules: identifyModules(formattedContent),
      };
    } catch (apiError: any) {
      console.error("Confluence API error:", apiError);
      return {
        text: "",
        success: false,
        error: `Failed to fetch from Confluence: ${apiError.message}. Please check your credentials and URL.`,
        modules: [],
      };
    }
  } catch (error) {
    console.error("Error extracting from Confluence:", error);
    return {
      text: "",
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to extract from Confluence",
      modules: [],
    };
  }
}

// Helper function to identify modules from headers
function identifyModules(text: string): string[] {
  const moduleRegex = /^#+\s*(.+)$/gm;
  const modules = [];
  let match;

  while ((match = moduleRegex.exec(text)) !== null) {
    modules.push(match[1].trim());
  }

  return modules;
}

// Process content from URL
export async function processContent(url: string): Promise<string> {
  try {
    const result = await extractRequirements(url);
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.text;
  } catch (error) {
    console.error("Error processing content:", error);
    throw new Error(
      `Failed to process content: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export function parseSections(content: string) {
  const cookies = new Map<string, string>();

  // Extract requirements section
  const requirementsMatch = content.match(/REQUIREMENTS:\s*`([^`]+)`/);
  if (requirementsMatch) {
    cookies.set("requirements", requirementsMatch[1].trim());
  }

  // Extract test cases section
  const testCasesMatch = content.match(/TEST-CASES:\s*`([^`]+)`/);
  if (testCasesMatch) {
    cookies.set("testcases", testCasesMatch[1].trim());
  }

  // Extract summary section
  const summaryMatch = content.match(/SUMMARY:\s*`([^`]+)`/);
  if (summaryMatch) {
    cookies.set("summary", summaryMatch[1].trim());
  }

  return cookies;
}
