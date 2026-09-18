// Assisted capture (decision 4, RECORD-MODEL.md §1.1 and §9 A'.6): paste a terminal/build
// session, get back review-ready proposals. Nothing here reaches `records` -- this function only
// writes an `import_batches` row for provenance (raw_input + what was proposed) and returns the
// proposals to the caller. The dashboard's own insert path (through PostgREST, subject to
// private.validate_record()) is what actually creates records, only after Gerald reviews and
// possibly edits each proposal.
//
// Authorization is structural, matching generate-writeup: every read/write goes through a client
// scoped to the caller's own forwarded JWT, so RLS decides visibility. A non-owner gets "kind not
// found" for any kindSlug, real or not -- never a 403 that would confirm a kind exists.
import { getLLMProvider } from "../_shared/llm/provider.ts"
import { callerClient, serviceClient } from "../_shared/supabase.ts"

interface RecordKindRow {
  id: string
  slug: string
  name: string
  capabilities: string[]
  field_schema: unknown[]
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method not allowed" }), { status: 405 })
  }

  const authHeader = req.headers.get("Authorization")
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "missing Authorization header" }), { status: 401 })
  }

  let kindSlug: string
  let sourceText: string
  try {
    const body = (await req.json()) as { kindSlug?: string; sourceText?: string }
    if (!body.kindSlug) throw new Error("kindSlug required")
    if (!body.sourceText || !body.sourceText.trim()) throw new Error("sourceText required")
    kindSlug = body.kindSlug
    sourceText = body.sourceText
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "invalid body, expected { kindSlug, sourceText }" }),
      { status: 400 },
    )
  }

  const caller = callerClient(authHeader)

  const { data: kind, error: kindError } = await caller
    .from("record_kinds")
    .select("id, slug, name, capabilities, field_schema")
    .eq("slug", kindSlug)
    .single<RecordKindRow>()

  if (kindError || !kind) {
    return new Response(JSON.stringify({ error: "kind not found" }), { status: 404 })
  }

  if (!kind.capabilities.includes("assisted")) {
    return new Response(
      JSON.stringify({ error: `kind "${kindSlug}" does not support assisted capture` }),
      { status: 409 },
    )
  }

  const childCapability = kind.capabilities.find((c) => c.startsWith("children:"))
  const childKindSlug = childCapability ? childCapability.slice("children:".length) : null

  let childKindName: string | null = null
  let childFieldSchema: unknown[] | null = null
  if (childKindSlug) {
    const { data: childKind } = await caller
      .from("record_kinds")
      .select("name, field_schema")
      .eq("slug", childKindSlug)
      .single<{ name: string; field_schema: unknown[] }>()
    if (childKind) {
      childKindName = childKind.name
      childFieldSchema = childKind.field_schema
    }
  }

  const llm = await getLLMProvider()
  const result = await llm.generateImportProposals({
    kindSlug: kind.slug,
    kindName: kind.name,
    fieldSchema: kind.field_schema,
    childKindSlug,
    childKindName,
    childFieldSchema,
    sourceText,
  })

  // import_batches.owner_id defaults to auth.uid(), which only resolves under a real user JWT --
  // it is NOT reliably populated for every caller shape this function may see. Resolve and check
  // ownership explicitly through the caller's own JWT-scoped client first (same split as
  // analyze's on_demand path), then write through the service client with owner_id set
  // explicitly, rather than depending on the column default.
  const [{ data: userData, error: userError }, { data: resolvedOwner, error: ownerError }] =
    await Promise.all([caller.auth.getUser(), caller.rpc("owner_id")])
  if (userError || !userData?.user) {
    return new Response(JSON.stringify({ error: "invalid session" }), { status: 401 })
  }
  if (ownerError) {
    return new Response(JSON.stringify({ error: ownerError.message }), { status: 500 })
  }
  if (!resolvedOwner || resolvedOwner !== userData.user.id) {
    return new Response(JSON.stringify({ error: "not authorized" }), { status: 403 })
  }

  const svc = serviceClient()
  const { data: batch, error: insertError } = await svc
    .from("import_batches")
    .insert({
      owner_id: userData.user.id,
      kind_id: kind.id,
      raw_input: sourceText,
      parsed: { proposals: result.proposals, warnings: result.warnings },
      status: "parsed",
      model_used: result.modelUsed,
    })
    .select("id")
    .single()

  if (insertError) {
    return new Response(JSON.stringify({ error: insertError.message }), { status: 500 })
  }

  return new Response(
    JSON.stringify({
      importBatchId: batch.id,
      proposals: result.proposals,
      warnings: result.warnings,
      provider: result.provider,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
    }),
    { status: 200, headers: { "content-type": "application/json" } },
  )
})
