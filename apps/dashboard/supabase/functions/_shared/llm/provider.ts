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

// Assisted capture (decision 4, RECORD-MODEL.md §1.1): paste a terminal/build session, get back
// review-ready proposals for a "primary" record (e.g. an lfs_checkpoint) and, when the target
// kind declares a `children:<slug>` capability, one proposal per distinct child (e.g. an
// lfs_issue per failure). Nothing here is inserted automatically -- every proposal is reviewed,
// possibly edited, and only then POSTed through the normal records path, where
// private.validate_record() is the actual authority on field shape.
export interface ImportProposalInput {
  kindSlug: string
  kindName: string
  fieldSchema: unknown[]
  childKindSlug: string | null
  childKindName: string | null
  childFieldSchema: unknown[] | null
  sourceText: string
}

export interface ImportProposal {
  kind: string
  fields: Record<string, unknown>
  sourceExcerpt: string
}

export interface ImportProposalResult extends UsageStats {
  proposals: ImportProposal[]
  warnings: string[]
}

export interface LLMProvider {
  readonly name: string
  generateAnalysis(input: AnalysisInput): Promise<AnalysisResult>
  generateWriteup(input: WriteupInput): Promise<WriteupResult>
  generateImportProposals(input: ImportProposalInput): Promise<ImportProposalResult>
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
