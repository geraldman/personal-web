import type {
  AnalysisInput,
  AnalysisResult,
  LLMProvider,
  WriteupInput,
  WriteupResult,
} from "./provider.ts"

// Exact model id -- gemini-3.5-flash-lite, not gemini-2.5-flash-lite (retiring 2026-10-16) and
// not a generic "flash-lite" string. See platform-sync-research.md Part 3.
const MODEL = "gemini-3.5-flash-lite"
const API_BASE = "https://generativelanguage.googleapis.com/v1beta"

// Gemini routinely wraps a requested-JSON response in a ```json ... ``` markdown fence despite
// the prompt asking for bare JSON. Confirmed against a real response, not assumed.
function stripMarkdownFence(text: string): string {
  const trimmed = text.trim()
  const match = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/)
  return match ? match[1] : trimmed
}

interface GeminiResponse {
  candidates: { content: { parts: { text: string }[] } }[]
  usageMetadata: { promptTokenCount: number; candidatesTokenCount: number }
}

export class GeminiProvider implements LLMProvider {
  readonly name = "gemini"

  private get apiKey(): string {
    // Server-side only -- read inside the Edge Function, never sent to the client bundle.
    const key = Deno.env.get("GEMINI_API_KEY")
    if (!key) throw new Error("GEMINI_API_KEY is not set")
    return key
  }

  private async generate(prompt: string): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
    const res = await fetch(
      `${API_BASE}/models/${MODEL}:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    )

    if (!res.ok) {
      throw new Error(`Gemini API error ${res.status}: ${await res.text()}`)
    }

    const data = (await res.json()) as GeminiResponse
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ""

    return {
      text,
      inputTokens: data.usageMetadata?.promptTokenCount ?? 0,
      outputTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
    }
  }

  async generateAnalysis(input: AnalysisInput): Promise<AnalysisResult> {
    const prompt = [
      `You are analyzing a coding/security-challenge practice log for the ${input.periodLabel} period`,
      `(${input.windowStart} to ${input.windowEnd}). Only aggregate stats are provided below --`,
      `no private notes. Write a short progress summary and 2-4 concrete recommendations.`,
      ``,
      `Stats: ${JSON.stringify(input.statsSnapshot)}`,
      ``,
      `Respond as JSON: { "summary": string, "recommendations": string[] }`,
    ].join("\n")

    const { text, inputTokens, outputTokens } = await this.generate(prompt)
    const parsed = JSON.parse(stripMarkdownFence(text)) as { summary: string; recommendations: string[] }

    return {
      provider: this.name,
      modelUsed: MODEL,
      inputTokens,
      outputTokens,
      summaryText: parsed.summary,
      recommendations: parsed.recommendations,
    }
  }

  async generateWriteup(input: WriteupInput): Promise<WriteupResult> {
    // input is WriteupInput -- by type, notes cannot reach this prompt.
    const prompt = [
      `Write a short (2-4 sentence) public portfolio blurb for this solved challenge.`,
      `No spoilers of the exact solution steps -- describe the skill demonstrated, not a walkthrough.`,
      ``,
      `Challenge: ${input.challengeName}`,
      `Platform: ${input.platformName}`,
      `Category: ${input.category}`,
      `Difficulty: ${input.difficulty ?? "unspecified"}`,
      `Tags: ${input.tags.join(", ")}`,
    ].join("\n")

    const { text, inputTokens, outputTokens } = await this.generate(prompt)

    return {
      provider: this.name,
      modelUsed: MODEL,
      inputTokens,
      outputTokens,
      writeupText: text.trim(),
    }
  }
}
