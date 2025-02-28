import { google } from "googleapis";

// Initialize the Google Docs API client
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || "{}"),
  scopes: ["https://www.googleapis.com/auth/documents.readonly"],
});

const docs = google.docs({ version: "v1", auth });

// Extract document ID from Google Docs URL
export function getDocumentId(url: string): string {
  const match = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : "";
}

// Fetch document content using Google Docs API
export async function fetchGoogleDoc(url: string): Promise<string> {
  try {
    const documentId = getDocumentId(url);
    if (!documentId) {
      throw new Error("Invalid Google Docs URL");
    }

    const response = await docs.documents.get({
      documentId,
    });

    const document = response.data;
    let content = "";

    // Extract text from the document
    if (document.body?.content) {
      content = document.body.content.reduce((text, element) => {
        if (element.paragraph?.elements) {
          const paragraphText = element.paragraph.elements
            .map((el) => el.textRun?.content || "")
            .join("");
          return text + paragraphText;
        }
        return text;
      }, "");
    }

    return content;
  } catch (error) {
    console.error("Error fetching Google Doc:", error);
    throw new Error(
      `Failed to fetch Google Doc: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
