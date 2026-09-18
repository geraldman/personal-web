// Generates a public portfolio blurb for one solved entry. Always a manual, per-entry action
// from the dashboard -- there is no cron path here.
//
// Authorization is structural, not a manual check: every read and write goes through a client
// scoped to the caller's own forwarded JWT, so RLS (auth.uid() = owner_id and is_owner()) is
// what actually decides whether the entry is visible or writable. A non-owner's request for any
// entry id, including someone else's, simply finds no row -- same as B1.0's public_entries
// design, structural safety instead of a policy that could be gotten wrong.
//
// The select list below is also the enforcement point for keeping `notes` out of the prompt:
// WriteupInput has no field for it, so there is nothing to forward even if the column were
// selected here -- but it isn't selected here either, as a second layer.
import { getLLMProvider } from "../_shared/llm/provider.ts"
import { callerClient } from "../_shared/supabase.ts"

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method not allowed" }), { status: 405 })
  }

  const authHeader = req.headers.get("Authorization")
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "missing Authorization header" }), { status: 401 })
  }

  let entryId: string
  try {
    const body = (await req.json()) as { entryId?: string }
    if (!body.entryId) throw new Error("entryId required")
    entryId = body.entryId
  } catch {
    return new Response(JSON.stringify({ error: "invalid body, expected { entryId }" }), { status: 400 })
  }

  const caller = callerClient(authHeader)

  const { data: entry, error: selectError } = await caller
    .from("entries")
    .select(
      "id, challenge_name, category, difficulty, tags, problem_url, status, platforms(name)",
    )
    .eq("id", entryId)
    .single()

  if (selectError || !entry) {
    return new Response(JSON.stringify({ error: "entry not found" }), { status: 404 })
  }
  if (entry.status !== "solved") {
    return new Response(JSON.stringify({ error: "entry is not solved yet" }), { status: 409 })
  }

  const platformName = (entry.platforms as { name?: string } | null)?.name ?? "unknown platform"

  const llm = await getLLMProvider()
  const result = await llm.generateWriteup({
    challengeName: entry.challenge_name,
    category: entry.category as "swe" | "cyber",
    difficulty: entry.difficulty,
    platformName,
    tags: entry.tags ?? [],
    problemUrl: entry.problem_url,
  })

  const { data: updated, error: updateError } = await caller
    .from("entries")
    .update({
      portfolio_writeup: result.writeupText,
      writeup_model: result.modelUsed,
      writeup_generated_at: new Date().toISOString(),
    })
    .eq("id", entryId)
    .select("id, portfolio_writeup, writeup_model, writeup_generated_at")
    .single()

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), { status: 500 })
  }

  return new Response(
    JSON.stringify({ ...updated, provider: result.provider, inputTokens: result.inputTokens, outputTokens: result.outputTokens }),
    { status: 200, headers: { "content-type": "application/json" } },
  )
})
