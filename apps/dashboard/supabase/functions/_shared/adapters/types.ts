// Interface every sync adapter implements. registry.ts maps a platforms.sync_adapter key to one
// of these. Do not add an adapter for leetcode, tryhackme, or hackthebox here -- see
// platform-sync-research.md; those three are assisted-import only.

export interface NormalizedEntry {
  externalId: string
  challengeName: string
  category: "swe" | "cyber"
  difficulty: string | null
  difficultyRank: number | null
  dateCompleted: string | null // ISO date, YYYY-MM-DD
  tags: string[]
  problemUrl: string | null
}

export interface SyncAdapter {
  readonly platformSlug: string
  // handle: the account's username/handle on the platform, from platform_accounts.handle.
  // credential: resolved from the Vault secret named in platform_accounts.credential_secret_name,
  // or null for adapters that only need public endpoints (codewars, codeforces today).
  fetchSolved(handle: string, credential: string | null): Promise<NormalizedEntry[]>
}
