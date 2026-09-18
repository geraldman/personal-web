import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2"

// Service-role client: bypasses RLS entirely. Only ever used after this function has already
// established who is asking -- either the Vault-sourced cron credential, or a verified owner JWT
// -- never in response to an unauthenticated request.
export function serviceClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL")
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  if (!url || !key) throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set")
  return createClient(url, key)
}

// Client scoped to the caller's own JWT, forwarded as-is: every query through this client is
// RLS-enforced as that specific user, never as service_role.
export function callerClient(authHeader: string): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL")
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")
  if (!url || !anonKey) throw new Error("SUPABASE_URL or SUPABASE_ANON_KEY not set")
  return createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
}

// The Supabase gateway already verifies the JWT signature before this code runs (verify_jwt is
// not disabled on either function), so decoding here is only to read the `role` claim -- never
// a substitute for that verification.
export function jwtRole(authHeader: string): string | null {
  const token = authHeader.replace(/^Bearer\s+/i, "")
  const payloadSegment = token.split(".")[1]
  if (!payloadSegment) return null
  try {
    const json = atob(payloadSegment.replace(/-/g, "+").replace(/_/g, "/"))
    return (JSON.parse(json) as { role?: string }).role ?? null
  } catch {
    return null
  }
}
