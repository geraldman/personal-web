# Master Plan — Challenge Tracker + Portfolio CMS

**Target:** `dashboard.geraldmanurung.site`
**Repo:** `personal-web`, restructured into a two-app monorepo
**Planned:** 2026-09-02

Companion docs (read before implementing):
- `design-system-audit.md` — the *real* design system (AGENTS.md is wrong)
- `portfolio-data-inventory.md` — current data shapes + proposed Postgres mapping
- `platform-sync-research.md` — platform API/ToS matrix + stack fact-check
- `WORKER-A-PLAN.md` — frontend assignment (worker-a)
- `WORKER-B-PLAN.md` — backend assignment (worker-b)

---

## 1. Decisions locked

| Decision | Choice |
|---|---|
| Repo layout | `apps/web` + `apps/dashboard`, independent `package.json`, **no npm workspaces** |
| Hostname | `dashboard.geraldmanurung.site` |
| Supabase | Fresh project, created by Gerald (blocking step) |
| Auth | GitHub OAuth, single owner, RLS-enforced |
| Public tracker view | `status='solved'` only, via a dedicated view; raw `notes` never granted to `anon` |
| Web data flow (Phase 9) | Static build + on-demand revalidation webhook |
| Blog | MDX bodies stay in repo; metadata only in DB |
| Sequencing | Tracker first, CMS migration second |
| Sync | Official APIs only; assisted import for ToS-restricted platforms |
| Design | Match the **real** monochrome system, not AGENTS.md |
| LLM | Gemini `gemini-3.5-flash-lite` behind a provider abstraction |

## 2. Two corrections the research forced

**The design system is monochrome, not electric blue.** `--color-accent` is `#f2f2ee`
(near-white) on `#050508`. Fonts come from `next/font/google`, not the `geist` package.
AGENTS.md documents a design that does not exist. Fixing AGENTS.md is Phase 0.5 — it must
happen before any dashboard UI is written, or every future agent repeats the mistake.

**Three of the sync targets have hostile ToS.** LeetCode bans scraping outright; HackTheBox
bans "compiling data from API responses into any dataset"; TryHackMe bans automated access
"except through an interface expressly provided." So sync splits in two:

- **Server-side sync** — only Codewars, Codeforces, CTFtime, HackerOne, Bugcrowd (official,
  documented, sanctioned APIs).
- **Assisted import** — for LeetCode/THM/HTB, Gerald copies his own solved list from the page
  and pastes it in; Gemini parses it to structured rows; he reviews before insert. No server
  ever contacts those platforms.

Gerald does not yet hold accounts on the A-tier platforms. So Phase 7 builds the **adapter
framework plus two reference adapters** (Codewars, Codeforces); the rest are seeded in the
`platforms` table with `sync_adapter = null` and light up when accounts exist.

---

## 3. Target structure

```
personal-web/
├─ apps/
│  ├─ web/                    geraldmanurung.site        (existing app, moved)
│  │  ├─ src/ public/ package.json next.config.ts
│  │  └─ AGENTS.md            (corrected, portfolio-specific)
│  └─ dashboard/              dashboard.geraldmanurung.site   (new)
│     ├─ src/app/
│     │  ├─ (admin)/          auth-gated: entries, insights, import, settings
│     │  ├─ (public)/         read-only portfolio view
│     │  └─ auth/callback/    GitHub OAuth PKCE exchange
│     ├─ src/proxy.ts         Next 16 convention — renamed from middleware.ts
│     ├─ src/lib/supabase/    client.ts · server.ts · middleware.ts  (helper module, name kept)
│     ├─ supabase/
│     │  ├─ migrations/
│     │  ├─ seed.sql
│     │  └─ functions/
│     │     ├─ _shared/llm/       provider.ts · gemini.ts · anthropic.ts (stub)
│     │     ├─ _shared/adapters/  registry.ts · codewars.ts · codeforces.ts
│     │     ├─ analyze/
│     │     ├─ generate-writeup/
│     │     ├─ parse-import/
│     │     └─ sync-platform/
│     └─ AGENTS.md            (dashboard-specific)
├─ docs/planning/
├─ AGENTS.md                  (thin, delegates to each app)
└─ README.md
```

Two Vercel projects, one repo, each with a **Root Directory** and an **Ignored Build Step**
(`git diff --quiet HEAD^ HEAD -- .`) so a dashboard push never rebuilds the portfolio.

---

## 4. Data model

### Tracker core

```sql
platforms (
  id uuid pk, slug text unique, name text, category text,   -- swe | cyber | bugbounty
  url text, icon_kind text, icon_ref text, brand_color text,
  sync_adapter text null,          -- null = manual/assisted only
  import_hint text null,           -- guidance shown in the assisted-import UI
  sort_order int
)

entries (
  id uuid pk,
  owner_id uuid not null default auth.uid() references auth.users,
  platform_id uuid not null references platforms,
  challenge_name text not null,
  category text not null,                          -- swe | cyber
  difficulty text,                                 -- platform's own label, verbatim
  difficulty_rank smallint,                        -- 1..5 normalized, for cross-platform charts
  status text not null,                            -- solved | in_progress | attempted
  date_completed date,
  tags text[] not null default '{}',
  problem_url text,
  notes text,                                      -- PRIVATE, never granted to anon
  portfolio_writeup text,                          -- public when solved
  writeup_model text, writeup_generated_at timestamptz,
  source text not null default 'manual',           -- manual | sync | import
  external_id text,                                -- platform's own id, for dedupe
  synced_at timestamptz,
  created_at timestamptz, updated_at timestamptz
)
-- unique (platform_id, external_id) where external_id is not null

analyses (
  id, owner_id, generated_at, period,              -- weekly | monthly | on_demand
  summary_text text, recommendations jsonb, stats_snapshot jsonb,
  provider text, model_used text,
  input_tokens int, output_tokens int,
  window_start date, window_end date
)

platform_accounts (
  id, owner_id, platform_id, handle text,
  credential_secret_name text,     -- NAME of the Supabase Vault secret, never the secret
  sync_enabled bool, last_synced_at timestamptz
)

sync_runs (
  id, owner_id, platform_id, started_at, finished_at,   -- owner_id added 2026-09-03, see below
  status text,                                     -- running | success | partial | failed
  entries_created int, entries_updated int, error_text text
)

import_batches (
  id, owner_id, platform_id, raw_input text, parsed jsonb,
  status text,                                     -- parsed | confirmed | discarded
  model_used text, created_at
)
```

`difficulty_rank` is the key design call: LeetCode's easy/medium/hard, HTB's very-easy→insane,
and THM's info→hard cannot be charted together as raw strings. Each adapter and the manual form
map their label to a 1–5 rank; `difficulty` keeps the original text for display.

### Amendments — 2026-09-03

Three points this section left underspecified, resolved during Track 0:

1. **`sync_runs.owner_id`** — added. The original spec gave `import_batches` an `owner_id` and
   `sync_runs` none, which was an omission rather than a deliberate asymmetry. Its RLS policy now
   matches the other per-account tables (`auth.uid() = owner_id`). Not a leak today (the Edge
   Function writes via service role), but uniform policies mean a later multi-user or shared-view
   change cannot quietly turn it into one.

2. **`icon_kind` / `icon_ref` convention** — `icon_kind in ('react-icons', 'local-image',
   'initial')`, with `icon_ref` holding the react-icons export name (`SiHackthebox`,
   `SiCodewars`, …), resolved through a static TS map in code. This matches
   `portfolio-data-inventory.md` §9 and the existing `techIcons.tsx` pattern; a separate
   `simple-icons` vocabulary would collide when the Phase 9 CMS tables join the same database.
   Verified against `node_modules/react-icons/si/index.d.ts` — CTFtime and picoCTF have no `Si*`
   export and fall back to `'initial'`. Nothing executable is ever stored in the DB.

3. **`difficulty_rank` is nullable in practice.** The Codewars completed-challenges endpoint does
   not return kyu rank per challenge, and a per-challenge backfill would mean N+1 requests
   against an API with an undocumented rate limit — not worth it. Consequence for Phase 4: every
   chart must handle null ranks explicitly, as an "unranked" bucket or an excluded-with-count,
   never bucketed as 0.

### Public exposure — safe by construction

```sql
create view public_entries with (security_invoker = off) as
select id, platform_id, challenge_name, category, difficulty, difficulty_rank,
       date_completed, tags, problem_url, portfolio_writeup
from entries where status = 'solved';

revoke all on entries from anon;         -- anon cannot reach the table at all
grant select on public_entries to anon;  -- only these columns, only solved rows
```

`notes` is not a column of the view, so no policy bug or UI mistake can leak it. RLS on
`entries` restricts all writes to `auth.uid() = owner_id`.

---

## 5. Phases

Legend: **[O]** orchestrator · **[A]** worker-a · **[B]** worker-b

### Phase 0 — Restructure `personal-web` **[O]** — gated
The only step that can break the live site. Done alone, verified, before anything else.
1. `git mv` app source into `apps/web/` (including `.vercel`, `.env*`, `.gitignore`, AGENTS/CLAUDE.md). `node_modules`/`.next` are not moved — deleted and reinstalled.
2. Thin root `AGENTS.md` + `README.md`.
3. Verify `cd apps/web && npm ci && npm run build` is green.
4. Vercel: set `personal-web` Root Directory → `apps/web`; add Ignored Build Step.
5. Deploy to **preview**, verify the site renders, only then promote.

**Gate: geraldmanurung.site confirmed working before Phase 1 starts.**

### Phase 0.5 — Correct AGENTS.md **[A]**
Rewrite `apps/web/AGENTS.md` from `design-system-audit.md` so it documents the real monochrome
palette, real font imports, real file paths, real component inventory, and the real blog
pipeline. Delete the fictional ReactBits/split-hero/geist-package sections.

### Phase 1 — Supabase foundation **[B]** — blocked on Gerald
Gerald creates the project and GitHub OAuth app; worker-b writes migrations, the seed for all
~25 platforms, RLS policies, the public view and grants, the streak/stats SQL functions, and
generates TypeScript types.

### Phase 2 — Dashboard scaffold + auth **[A]**
Next.js 16 + Tailwind v4 in `apps/dashboard`, design tokens ported verbatim from
`apps/web/src/app/globals.css`, `@supabase/ssr` client/server/middleware, GitHub OAuth with a
single-owner allowlist, protected app shell.

### Phase 3 — Entry CRUD **[A]**
List with filter/sort/search, create/edit/delete via server actions, tag autocomplete from a
`tag_usage` view, difficulty-rank mapping in the form, skeletons.

### Phase 4 — Stats + charts **[A]**
Recharts. KPI tiles (total solved, current/longest streak, this month), activity-over-time,
difficulty distribution, per-platform counts, tag frequency. Charts read from SQL aggregate
functions, not client-side reduction over all rows.

### Phase 5 — Public view **[A]**
Read-only route using the `anon` key against `public_entries`. This is the employer-facing
artifact — it gets real design attention, SEO metadata, and OG tags.

### Phase 6 — LLM layer **[B]**
`generateAnalysis()` / `generateWriteup()` behind a provider abstraction selected by
`LLM_PROVIDER`, Gemini implementation pinned to **`gemini-3.5-flash-lite`**, Anthropic stub for
later. Edge functions `analyze` + `generate-writeup`. Weekly `pg_cron` + `pg_net` schedule.
Manual "Regenerate insights" button. Token counts recorded per analysis.

### Phase 7 — Sync + assisted import **[B]**
Adapter interface + registry; Codewars and Codeforces adapters; `sync_runs` logging with
fail-soft UI ("last synced 3h ago", never blocks manual entry); assisted-import flow
(paste → `parse-import` → review table → bulk insert) for LeetCode/THM/HTB.

### Phase 8 — Deploy **[O]**
Second Vercel project rooted at `apps/dashboard`, DNS CNAME for `dashboard.`, env vars, OAuth
callback URLs for both preview and production, Ignored Build Steps on both projects.

### Phase 9 — Portfolio CMS migration **[A]+[B]** — separate effort, after the tracker ships
Tables for projects/certificates/experiences/tech + a real `project_tech` join table (replacing
the current render-time string matching between `stack[]` and `matchKeys[]`). Icon handling via
`icon_kind`/`icon_ref` resolved by a code-side registry — the React component reference in
`techIcons.tsx` cannot become a column. Blog metadata to DB, MDX bodies stay as files. Admin
CRUD in the dashboard; `apps/web` fetches at build time with a revalidation webhook on publish.

---

## 6. Parallelization

worker-a owns frontend (`apps/dashboard/src/**`), worker-b owns backend
(`apps/dashboard/supabase/**`). They touch disjoint trees, so they can run concurrently from
Phase 2 onward. The contract between them is the generated Supabase types file — worker-b
publishes it at the end of Phase 1, and worker-a builds against it.

Dependency order: **0 → 0.5 → 1 → (2,6) → 3 → (4,5,7) → 8 → 9**

## 7. Blocking on Gerald

1. Create the Supabase project; supply URL + anon key + service role key.
2. Create a GitHub OAuth app pointed at the Supabase callback; supply client ID + secret.
3. Create a Google AI Studio API key for Gemini.
4. Add the `dashboard` DNS record (or confirm Vercel manages the domain's DNS).
5. Approve the Vercel Root Directory change on the live `personal-web` project.

## 8. Standing rules for all workers

- No Claude/AI attribution in commits, comments, or any repo-visible content.
- Never `git commit` or `git push` without Gerald's explicit go-ahead.
- Secrets live in Supabase Vault / Vercel env vars — never in the repo, never in `platform_accounts`.
- The Gemini key is server-side only (Edge Function), never shipped to the client.
- Ambiguity gets raised, not guessed.
