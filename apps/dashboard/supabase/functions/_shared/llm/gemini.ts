import type {
  AnalysisInput,
  AnalysisResult,
  ImportProposal,
  ImportProposalInput,
  ImportProposalResult,
  LLMProvider,
  WriteupInput,
  WriteupResult,
} from "./provider.ts"

// Batch cap for assisted capture (decision 4 / open question 2, RECORD-MODEL.md §11): one pasted
// session can legitimately hit many failures, but an unbounded batch makes the review UI
// unusable and risks a single bad paste creating dozens of rows. Extra proposals beyond the cap
// are dropped, not silently -- a warning entry says how many were cut.
const MAX_CHILD_PROPOSALS = 10

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

  async generateImportProposals(input: ImportProposalInput): Promise<ImportProposalResult> {
    const childInstruction = input.childKindSlug
      ? [
          `Also extract every distinct failure, error, or blocker encountered as a separate child`,
          `proposal of kind "${input.childKindSlug}" (${input.childKindName}), using ONLY the`,
          `field keys declared in this field_schema: ${JSON.stringify(input.childFieldSchema)}.`,
          `One child proposal per distinct failure -- do not merge unrelated failures into one,`,
          `and do not invent a failure that is not actually in the text.`,
        ].join("\n")
      : `Do not propose any child records -- return an empty "children" array.`

    const prompt = [
      `You are structuring a pasted terminal/build session into review-ready records for a`,
      `personal tracker. Nothing you propose is inserted automatically -- a human reviews every`,
      `field before anything is saved, so it is far better to under-fill a field or add a`,
      `warning than to guess.`,
      ``,
      `Extract at most one primary proposal of kind "${input.kindSlug}" (${input.kindName}),`,
      `using ONLY the field keys declared in this field_schema: ${JSON.stringify(input.fieldSchema)}.`,
      `If nothing in the text supports a primary proposal, "primary" must be null.`,
      ``,
      childInstruction,
      ``,
      `Rules:`,
      `- Never invent a field key that is not declared in the relevant field_schema above.`,
      `- Every proposal must include "source_excerpt": the exact verbatim substring of the pasted`,
      `  text that supports it, so a reviewer can check it against the original.`,
      `- If a value is ambiguous or you are not confident, leave the field out and add a note to`,
      `  "warnings" instead of guessing.`,
      `- Never fabricate a value that is not present or clearly inferable from the text.`,
      ``,
      `Pasted session:`,
      input.sourceText,
      ``,
      `Respond as JSON exactly in this shape:`,
      `{ "primary": { "fields": { ... }, "source_excerpt": string } | null,`,
      `  "children": [ { "fields": { ... }, "source_excerpt": string } ],`,
      `  "warnings": string[] }`,
    ].join("\n")

    const { text, inputTokens, outputTokens } = await this.generate(prompt)
    const parsed = JSON.parse(stripMarkdownFence(text)) as {
      primary: { fields: Record<string, unknown>; source_excerpt: string } | null
      children: { fields: Record<string, unknown>; source_excerpt: string }[]
      warnings?: string[]
    }

    const warnings = [...(parsed.warnings ?? [])]
    let children = parsed.children ?? []
    if (children.length > MAX_CHILD_PROPOSALS) {
      warnings.push(
        `Truncated ${children.length - MAX_CHILD_PROPOSALS} additional ${input.childKindSlug ?? "child"} ` +
          `proposal(s) beyond the cap of ${MAX_CHILD_PROPOSALS}.`,
      )
      children = children.slice(0, MAX_CHILD_PROPOSALS)
    }

    const proposals: ImportProposal[] = []
    if (parsed.primary) {
      proposals.push({
        kind: input.kindSlug,
        fields: parsed.primary.fields,
        sourceExcerpt: parsed.primary.source_excerpt,
      })
    }
    for (const child of children) {
      proposals.push({
        kind: input.childKindSlug ?? "unknown",
        fields: child.fields,
        sourceExcerpt: child.source_excerpt,
      })
    }

    return { provider: this.name, modelUsed: MODEL, inputTokens, outputTokens, proposals, warnings }
  }
}
