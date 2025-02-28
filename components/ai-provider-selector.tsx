"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { AlertCircle, Bot, Check } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface AIConfig {
  provider: string
  models: {
    huggingface: string
    ollama: string
    gemini: string
  }
  hasApiKeys: {
    huggingface: boolean
    gemini: boolean
  }
}

export default function AIProviderSelector() {
  const [config, setConfig] = useState<AIConfig | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    async function fetchConfig() {
      try {
        setLoading(true)
        const response = await fetch("/api/ai-config")

        if (!response.ok) {
          throw new Error("Failed to fetch AI configuration")
        }

        const data = await response.json()
        setConfig(data)
        setSelectedProvider(data.provider)
      } catch (err) {
        console.error("Error fetching AI config:", err)
        setError("Failed to load AI configuration")
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const response = await fetch("/api/ai-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ provider: selectedProvider }),
      })

      if (!response.ok) {
        throw new Error("Failed to update AI configuration")
      }

      setSuccess(`AI provider changed to ${selectedProvider}`)

      // Update the config
      if (config) {
        setConfig({
          ...config,
          provider: selectedProvider,
        })
      }
    } catch (err) {
      console.error("Error updating AI config:", err)
      setError("Failed to update AI configuration")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!config) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground p-4">Unable to load AI configuration.</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Provider
        </CardTitle>
        <CardDescription>Select which AI provider to use for generating test cases and summaries</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Select value={selectedProvider} onValueChange={setSelectedProvider}>
            <SelectTrigger>
              <SelectValue placeholder="Select AI provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ollama">Ollama (local, default)</SelectItem>
              <SelectItem value="gemini" disabled={!config.hasApiKeys.gemini}>
                Google Gemini {!config.hasApiKeys.gemini && "(API key required)"}
              </SelectItem>
              <SelectItem value="huggingface" disabled={!config.hasApiKeys.huggingface}>
                Hugging Face {!config.hasApiKeys.huggingface && "(API key required)"}
              </SelectItem>
            </SelectContent>
          </Select>

          <p className="text-xs text-muted-foreground">
            {selectedProvider === "gemini" && "Using Google Gemini API with model: " + config.models.gemini}
            {selectedProvider === "huggingface" && "Using Hugging Face API with model: " + config.models.huggingface}
            {selectedProvider === "ollama" &&
              "Using local Ollama with model: " + config.models.ollama + " (requires Ollama to be running)"}
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving || selectedProvider === config.provider}>
          {saving ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
              Saving...
            </>
          ) : (
            <>Save</>
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
            <Check className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

