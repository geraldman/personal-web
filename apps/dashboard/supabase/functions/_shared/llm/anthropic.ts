import type {
  AnalysisInput,
  AnalysisResult,
  ImportProposalInput,
  ImportProposalResult,
  LLMProvider,
  WriteupInput,
  WriteupResult,
} from "./provider.ts"

// Stub only -- not wired up in Phase 6. Kept so LLM_PROVIDER=anthropic fails loudly and clearly
// rather than silently, and so the provider interface is proven against a second implementation
// shape before Phase 6 picks a real Anthropic model id.
export class AnthropicProvider implements LLMProvider {
  readonly name = "anthropic"

  generateAnalysis(_input: AnalysisInput): Promise<AnalysisResult> {
    throw new Error("AnthropicProvider is a stub -- not implemented yet")
  }

  generateWriteup(_input: WriteupInput): Promise<WriteupResult> {
    throw new Error("AnthropicProvider is a stub -- not implemented yet")
  }

  generateImportProposals(_input: ImportProposalInput): Promise<ImportProposalResult> {
    throw new Error("AnthropicProvider is a stub -- not implemented yet")
  }
}
