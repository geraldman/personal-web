import type { SyncAdapter } from "./types.ts"
import { CodewarsAdapter } from "./codewars.ts"
import { CodeforcesAdapter } from "./codeforces.ts"

// Keyed by platforms.sync_adapter. Platforms with sync_adapter = null in the DB never reach
// this registry -- the sync-platform Edge Function checks that column before looking here.
//
// Do not add leetcode, tryhackme, or hackthebox: all three have ToS that forbid this (see
// platform-sync-research.md). If a change here adds an HTTP call to leetcode.com,
// tryhackme.com, or hackthebox.com, that's a violation of the standing rule, not a feature.
const registry: Record<string, SyncAdapter> = {
  codewars: new CodewarsAdapter(),
  codeforces: new CodeforcesAdapter(),
}

export function getAdapter(slug: string): SyncAdapter | null {
  return registry[slug] ?? null
}
