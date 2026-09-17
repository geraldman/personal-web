// Provider-agnostic LLM interface for the analyze and generate-writeup Edge Functions.
// Selected at runtime by the LLM_PROVIDER env var ("gemini" | "anthropic").

export interface UsageStats {
  provider: string
  modelUsed: string
  inputTokens: number
  outputTokens: number
}

export interface AnalysisInput {
  // Aggregate stats only (the output of the stats_* SQL functions) -- never raw entries.notes.
  statsSnapshot: Record<string, unknown>
  periodLabel: string
  windowStart: string
  windowEnd: string
}

export interface AnalysisResult extends UsageStats {
  summaryText: string
  recommendations: unknown[]
}

// The fields intended for publication on a solved challenge. Deliberately excludes `notes`:
// notes can contain sensitive material, and free-tier Gemini prompts may be used by Google for
// training, so this type is the enforcement point -- there is no field here to leak by accident.
export interface WriteupInput {
  challengeName: string
  category: "swe" | "cyber"
  difficulty: string | null
  platformName: string
  tags: string[]
  problemUrl: string | null
}

export interface WriteupResult extends UsageStats {
  writeupText: string
}

export interface LLMProvider {
  readonly name: string
  generateAnalysis(input: AnalysisInput): Promise<AnalysisResult>
  generateWriteup(input: WriteupInput): Promise<WriteupResult>
}

export async function getLLMProvider(): Promise<LLMProvider> {
  const provider = Deno.env.get("LLM_PROVIDER") ?? "gemini"

  switch (provider) {
    case "gemini": {
      const { GeminiProvider } = await import("./gemini.ts")
      return new GeminiProvider()
    }
    case "anthropic": {
      const { AnthropicProvider } = await import("./anthropic.ts")
      return new AnthropicProvider()
    }
    default:
      throw new Error(`Unknown LLM_PROVIDER: ${provider}`)
  }
}
