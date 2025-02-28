interface ConfluencePageInfo {
  id: string;
  spaceKey: string;
}

// Extract page ID and space key from Confluence URL
export function extractConfluencePageInfo(
  url: string
): ConfluencePageInfo | null {
  try {
    // Handle URLs that start with @
    const cleanUrl = url.startsWith("@") ? url.substring(1) : url;

    // Extract page ID and space key
    const match = cleanUrl.match(
      /atlassian\.net\/wiki\/spaces\/([^/]+)\/pages\/(\d+)/
    );
    if (!match) return null;
    return {
      spaceKey: match[1],
      id: match[2],
    };
  } catch (error) {
    console.error("Error extracting page info:", error);
    return null;
  }
}

// Fetch content from Confluence API
export async function fetchConfluenceContent(pageId: string): Promise<string> {
  const domain = process.env.CONFLUENCE_DOMAIN;
  const apiToken = process.env.CONFLUENCE_API_TOKEN;
  const email = process.env.CONFLUENCE_EMAIL;

  if (!domain || !apiToken || !email) {
    throw new Error("Confluence API credentials not configured");
  }

  try {
    const response = await fetch(
      `https://${domain}/wiki/rest/api/content/${pageId}?expand=body.storage,space,version`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${Buffer.from(`${email}:${apiToken}`).toString(
            "base64"
          )}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Confluence API error details:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        pageId,
        domain,
      });
      throw new Error(`Confluence API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Confluence API response:", JSON.stringify(data, null, 2));

    if (!data?.body?.storage?.value) {
      throw new Error("No content found in Confluence response");
    }

    return data.body.storage.value;
  } catch (error) {
    console.error("Error fetching from Confluence:", error);
    throw error;
  }
}

// Convert Confluence storage format to plain text
export function convertStorageFormatToText(content: string): string {
  // Remove HTML tags but preserve structure
  return content
    .replace(/<br\s*\/?>/gi, "\n") // Convert <br> to newlines
    .replace(/<\/p>/gi, "\n\n") // Convert </p> to double newlines
    .replace(/<\/h[1-6]>/gi, "\n\n") // Convert header endings to double newlines
    .replace(/<li>/gi, "• ") // Convert list items to bullets
    .replace(/<\/li>/gi, "\n") // Add newline after list items
    .replace(/<[^>]+>/g, "") // Remove remaining HTML tags
    .replace(/&nbsp;/g, " ") // Convert &nbsp; to spaces
    .replace(/\n\s*\n/g, "\n\n") // Normalize multiple newlines
    .trim();
}
