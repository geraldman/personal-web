// Generates a public portfolio blurb for one solved ctf record. Always a manual, per-record
// action from the dashboard -- there is no cron path here.
//
// Authorization is structural, not a manual check: every read and write goes through a client
// scoped to the caller's own forwarded JWT, so RLS (auth.uid() = owner_id and is_owner()) is
// what actually decides whether the record is visible or writable. A non-owner's request for any
// record id, including someone else's, simply finds no row -- same as B1.0's public_entries
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

  let recordId: string
  try {
    const body = (await req.json()) as { recordId?: string }
    if (!body.recordId) throw new Error("recordId required")
    recordId = body.recordId
  } catch {
    return new Response(JSON.stringify({ error: "invalid body, expected { recordId }" }), { status: 400 })
  }

  const caller = callerClient(authHeader)

  const { data: record, error: selectError } = await caller
    .from("records")
    .select(
      "id, title, rank_label, tags, url, status, data, platforms(name)",
    )
    .eq("id", recordId)
    .single()

  if (selectError || !record) {
    return new Response(JSON.stringify({ error: "record not found" }), { status: 404 })
  }
  if (record.status !== "solved") {
    return new Response(JSON.stringify({ error: "record is not solved yet" }), { status: 409 })
  }

  const platformName = (record.platforms as { name?: string } | null)?.name ?? "unknown platform"
  const discipline = (record.data as Record<string, unknown> | null)?.discipline

  const llm = await getLLMProvider()
  const result = await llm.generateWriteup({
    challengeName: record.title,
    category: (discipline === "swe" ? "swe" : "cyber") as "swe" | "cyber",
    difficulty: record.rank_label,
    platformName,
    tags: record.tags ?? [],
    problemUrl: record.url,
  })

  const { data: updated, error: updateError } = await caller
    .from("records")
    .update({
      body: result.writeupText,
      writeup_model: result.modelUsed,
      writeup_generated_at: new Date().toISOString(),
    })
    .eq("id", recordId)
    .select("id, body, writeup_model, writeup_generated_at")
    .single()

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), { status: 500 })
  }

  return new Response(
    JSON.stringify({ ...updated, provider: result.provider, inputTokens: result.inputTokens, outputTokens: result.outputTokens }),
    { status: 200, headers: { "content-type": "application/json" } },
  )
})
