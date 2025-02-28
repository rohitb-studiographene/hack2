import { NextResponse } from "next/server"

// This API endpoint returns the current AI configuration
// It's useful for the frontend to know which AI provider is being used
export async function GET() {
  return NextResponse.json({
    provider: process.env.AI_PROVIDER || "ollama",
    models: {
      huggingface: process.env.HUGGINGFACE_MODEL || "mistralai/Mistral-7B-Instruct-v0.2",
      ollama: process.env.OLLAMA_MODEL || "llama3",
      gemini: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    },
    hasApiKeys: {
      huggingface: !!process.env.HUGGINGFACE_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
    },
  })
}

// This API endpoint allows changing the AI provider
// In a real app, you would add authentication to this endpoint
export async function POST(request: Request) {
  const { provider } = await request.json()

  // In a real app, you would update environment variables or database settings
  // For demo purposes, we'll just return success

  return NextResponse.json({
    success: true,
    message: `AI provider changed to ${provider}`,
  })
}

