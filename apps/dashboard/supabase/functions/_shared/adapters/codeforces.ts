import type { NormalizedEntry, SyncAdapter } from "./types.ts"

// Official, documented, public API. Hard rate limit: 1 request per 2 seconds, else the API
// returns FAILED. The throttle lives here, not in the caller, because any future caller
// (manual sync button, scheduled sync-platform run, retries) must not be able to bypass it.
// See codeforces.com/apiHelp and platform-sync-research.md (verdict A).
const API_BASE = "https://codeforces.com/api"
const MIN_INTERVAL_MS = 2000

interface CodeforcesSubmission {
  id: number
  verdict?: string
  creationTimeSeconds: number
  problem: {
    contestId?: number
    index: string
    name: string
    rating?: number
    tags: string[]
  }
}

interface CodeforcesResponse {
  status: "OK" | "FAILED"
  comment?: string
  result: CodeforcesSubmission[]
}

// Codeforces problem rating -> 1-5 rank. Ratings run roughly 800-3500.
function mapDifficulty(rating: number | undefined): { difficulty: string | null; difficultyRank: number | null } {
  if (rating === undefined) return { difficulty: null, difficultyRank: null }
  const rank = rating < 1200 ? 1 : rating < 1600 ? 2 : rating < 2000 ? 3 : rating < 2400 ? 4 : 5
  return { difficulty: String(rating), difficultyRank: rank }
}

let lastRequestAt = 0

async function throttledFetch(url: string): Promise<Response> {
  const elapsed = Date.now() - lastRequestAt
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_INTERVAL_MS - elapsed))
  }
  lastRequestAt = Date.now()
  return fetch(url)
}

export class CodeforcesAdapter implements SyncAdapter {
  readonly platformSlug = "codeforces"

  async fetchSolved(handle: string): Promise<NormalizedEntry[]> {
    const res = await throttledFetch(
      `${API_BASE}/user.status?handle=${encodeURIComponent(handle)}`,
    )
    if (!res.ok) {
      throw new Error(`Codeforces API error ${res.status}: ${await res.text()}`)
    }

    const body = (await res.json()) as CodeforcesResponse
    if (body.status !== "OK") {
      throw new Error(`Codeforces API returned FAILED: ${body.comment ?? "unknown error"}`)
    }

    // Multiple submissions can target the same problem; keep only the first accepted one,
    // ordered oldest to newest, dedupe by (contestId, index).
    const seen = new Set<string>()
    const entries: NormalizedEntry[] = []

    const submissions = [...body.result]
      .filter((s) => s.verdict === "OK")
      .sort((a, b) => a.creationTimeSeconds - b.creationTimeSeconds)

    for (const submission of submissions) {
      const key = `${submission.problem.contestId ?? "gym"}${submission.problem.index}`
      if (seen.has(key)) continue
      seen.add(key)

      const { difficulty, difficultyRank } = mapDifficulty(submission.problem.rating)
      entries.push({
        externalId: key,
        challengeName: submission.problem.name,
        category: "swe",
        difficulty,
        difficultyRank,
        dateCompleted: new Date(submission.creationTimeSeconds * 1000).toISOString().slice(0, 10),
        tags: submission.problem.tags,
        problemUrl: submission.problem.contestId
          ? `https://codeforces.com/contest/${submission.problem.contestId}/problem/${submission.problem.index}`
          : null,
      })
    }

    return entries
  }
}
