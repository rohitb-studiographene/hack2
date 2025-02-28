// This file contains adapters for different AI providers
// You can switch between them based on availability or preference

import OpenAI from "openai";

// Interface for AI provider responses
export interface AIProviderResponse {
  text: string;
  success: boolean;
  error?: string;
  sections: AnalysisResponse;
}

interface AnalysisResponse {
  requirements: string;
  testCases: string;
  summary: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Get the configured AI provider based on environment or settings
export async function getAIProvider(
  prompt: string
): Promise<AIProviderResponse> {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a software requirements analyst. Analyze the provided requirements and generate three sections:

1. REQUIREMENTS: Organize the requirements into functional and non-functional categories.
2. TEST CASES: Generate comprehensive QA test cases including:
- Happy path scenarios
- Edge cases
- Validation tests
- Error scenarios
- Integration test cases
Format test cases with clear steps, expected results, and prerequisites.
3. SUMMARY: Create separate summaries for Backend and Frontend teams including:
- Data models and relationships
- API endpoints with methods needed
- Validation rules on Backend API
- Validation rules on Frontend components
- Business logic requirements
- UI/UX requirements
- State management needs
- Error handling requirements
`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 3000,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      return {
        success: false,
        error: "No response from OpenAI",
        text: "",
        sections: { requirements: "", testCases: "", summary: "" },
      };
    }

    // Parse the markdown sections
    const sections = parseSections(response);

    return {
      success: true,
      text: response,
      sections,
    };
  } catch (error) {
    console.error("OpenAI error:", error);
    return {
      success: false,
      text: "",
      error:
        error instanceof Error ? error.message : "Failed to connect to OpenAI",
      sections: { requirements: "", testCases: "", summary: "" },
    };
  }
}

function parseSections(markdown: string): AnalysisResponse {
  const sections = {
    requirements: "",
    testCases: "",
    summary: "",
  };

  try {
    console.log(markdown.split("# "));
    // Split the markdown into sections using regex lookahead
    const requirementsSection = markdown.match(
      /### 1\. REQUIREMENTS\n([\s\S]*?)(?=### 2\. TEST CASES)/
    );
    const testCasesSection = markdown.match(
      /### 2\. TEST CASES\n([\s\S]*?)(?=### 3\. SUMMARY)/
    );
    const summarySection = markdown.match(/### 3\. SUMMARY\n([\s\S]*?)$/);

    // Extract Requirements section
    if (requirementsSection && requirementsSection[1]) {
      sections.requirements = `### Requirements\n${requirementsSection[1].trim()}`;
    }

    // Extract Test Cases section
    if (testCasesSection && testCasesSection[1]) {
      sections.testCases = `### Test Cases\n${testCasesSection[1].trim()}`;
    }

    // Extract Summary section
    if (summarySection && summarySection[1]) {
      sections.summary = `### Summary\n${summarySection[1].trim()}`;
    }

    // If no sections were found, log warning
    if (!sections.requirements && !sections.testCases && !sections.summary) {
      console.warn("No sections found in response");
      sections.requirements = markdown.trim();
    }

    return sections;
  } catch (error) {
    console.error("Error parsing sections:", error);
    return {
      requirements: "Error parsing requirements",
      testCases: "Error parsing test cases",
      summary: "Error parsing summary",
    };
  }
}
