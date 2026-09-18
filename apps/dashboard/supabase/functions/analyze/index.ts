// Generates a stats analysis for the single owner: on_demand from the dashboard's "Regenerate
// insights" button, or weekly from private.trigger_weekly_analysis() via pg_cron + pg_net.
//
// Two distinct callers, two distinct trust paths:
// - role=service_role (the Vault-sourced cron credential): owner is resolved server-side via
//   public.owner_id() -- never trusted from the request body.
// - role=authenticated (a dashboard user's own JWT): the caller must BE the owner, checked by
//   comparing their own auth.uid() against public.owner_id() through their own JWT-scoped
//   client, before anything else happens.
// Either way, the actual read/write work always goes through the service-role client and the
// private.* core functions, so the two paths share one code path after authorization.
import { getLLMProvider } from "../_shared/llm/provider.ts"
import { callerClient, jwtRole, serviceClient } from "../_shared/supabase.ts"

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method not allowed" }), { status: 405 })
  }

  const authHeader = req.headers.get("Authorization")
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "missing Authorization header" }), { status: 401 })
  }

  const role = jwtRole(authHeader)
  let period: "weekly" | "on_demand"
  let ownerId: string | null

  if (role === "service_role") {
    period = "weekly"
    const svc = serviceClient()
    const { data, error } = await svc.rpc("owner_id")
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
    ownerId = data as string | null
  } else if (role === "authenticated") {
    period = "on_demand"
    const caller = callerClient(authHeader)
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
    ownerId = userData.user.id
  } else {
    return new Response(JSON.stringify({ error: "not authorized" }), { status: 403 })
  }

  // No GitHub identity has ever signed in yet -- expected pre-Gate-1 state, not a failure. Say
  // so explicitly rather than either crashing (analyses.owner_id is not-null) or silently
  // returning as if an analysis had been produced.
  if (!ownerId) {
    return new Response(
      JSON.stringify({ skipped: true, reason: "no owner configured yet (GitHub sign-in not completed)" }),
      { status: 200 },
    )
  }

  const svc = serviceClient()
  const windowDays = period === "weekly" ? 7 : 30
  const windowEnd = new Date()
  const windowStart = new Date(windowEnd.getTime() - windowDays * 24 * 60 * 60 * 1000)
  const isoDate = (d: Date) => d.toISOString().slice(0, 10)

  const { data: snapshot, error: snapshotError } = await svc.rpc("compute_stats_snapshot", {
    owner: ownerId,
  })
  if (snapshotError) {
    return new Response(JSON.stringify({ error: snapshotError.message }), { status: 500 })
  }

  const llm = await getLLMProvider()
  const result = await llm.generateAnalysis({
    statsSnapshot: snapshot as Record<string, unknown>,
    periodLabel: period,
    windowStart: isoDate(windowStart),
    windowEnd: isoDate(windowEnd),
  })

  const { data: inserted, error: insertError } = await svc
    .from("analyses")
    .insert({
      owner_id: ownerId,
      period,
      summary_text: result.summaryText,
      recommendations: result.recommendations,
      stats_snapshot: snapshot,
      provider: result.provider,
      model_used: result.modelUsed,
      input_tokens: result.inputTokens,
      output_tokens: result.outputTokens,
      window_start: isoDate(windowStart),
      window_end: isoDate(windowEnd),
    })
    .select()
    .single()

  if (insertError) {
    return new Response(JSON.stringify({ error: insertError.message }), { status: 500 })
  }

  return new Response(JSON.stringify(inserted), {
    status: 201,
    headers: { "content-type": "application/json" },
  })
})
