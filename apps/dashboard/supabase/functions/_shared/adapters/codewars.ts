import type { NormalizedEntry, SyncAdapter } from "./types.ts"

// Official, documented, public API -- no auth, no ToS concern. See
// dev.codewars.com and platform-sync-research.md (verdict A).
const API_BASE = "https://www.codewars.com/api/v1"

interface CodewarsChallenge {
  id: string
  name: string
  slug: string
  completedLanguages: string[]
  completedAt: string // ISO datetime
}

interface CodewarsCompletedResponse {
  totalPages: number
  totalItems: number
  data: CodewarsChallenge[]
}

// Codewars kyu ranks: 8-1 kyu, then "dan" ranks beyond black belt. The API only exposes which
// challenges were completed, not the solver's kyu at solve time here, so difficulty comes from
// a second call per-challenge in a real implementation; until that's wired up this adapter
// reports difficulty as unknown and leaves difficulty_rank null rather than guessing.
function mapDifficulty(): { difficulty: string | null; difficultyRank: number | null } {
  return { difficulty: null, difficultyRank: null }
}

export class CodewarsAdapter implements SyncAdapter {
  readonly platformSlug = "codewars"

  async fetchSolved(handle: string): Promise<NormalizedEntry[]> {
    const entries: NormalizedEntry[] = []
    let page = 0
    let totalPages = 1

    while (page < totalPages) {
      const res = await fetch(
        `${API_BASE}/users/${encodeURIComponent(handle)}/code-challenges/completed?page=${page}`,
      )
      if (!res.ok) {
        throw new Error(`Codewars API error ${res.status}: ${await res.text()}`)
      }

      const body = (await res.json()) as CodewarsCompletedResponse
      totalPages = body.totalPages

      for (const challenge of body.data) {
        const { difficulty, difficultyRank } = mapDifficulty()
        entries.push({
          externalId: challenge.id,
          challengeName: challenge.name,
          category: "swe",
          difficulty,
          difficultyRank,
          dateCompleted: challenge.completedAt?.slice(0, 10) ?? null,
          tags: [],
          problemUrl: `https://www.codewars.com/kata/${challenge.slug}`,
        })
      }

      page += 1
    }

    return entries
  }
}
