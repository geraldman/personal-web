# Worker-B Execution Plan — Backend

**Role:** Supabase schema, RLS, SQL functions, Edge Functions, LLM layer, sync adapters
**Owns (exclusive write access):** `apps/dashboard/supabase/**`, `docs/planning/staging/db/**`
**Never writes:** `apps/dashboard/src/**` (worker-a), `apps/web/**` (orchestrator), anything at repo root
**Reads freely:** everything — especially `docs/planning/platform-sync-research.md`
**Planned:** 2026-09-03 · Companion: `MASTER-PLAN.md`

---

## 0. Why you are idle right now

Two gates you do not own:

- **Phase 0** (orchestrator) — the `git mv` into `apps/web/` and the Vercel Root Directory flip.
  Until that is verified, `apps/` does not exist.
- **Gerald's credentials** — Supabase project URL + anon key + service role key, the GitHub OAuth
  app, and a Google AI Studio key. Nothing can be *applied* without these.

**But almost all of Phase 1 is writing SQL files, and SQL files do not need a live project.**
Only `supabase db push` and real type generation need credentials. So Track 0 below is the bulk
of Phase 1, done offline, ready to apply the moment the keys land.

You are also on the critical path for worker-a: the generated types file is the contract between
you. Publishing a **provisional** version early (B0.5) unblocks their Phase 2 and 3.

---

## Track 0 — Unblocked, start immediately

Output goes to `docs/planning/staging/db/`, laid out exactly as it will sit under
`apps/dashboard/supabase/` so Phase 1 is a directory move, not a rewrite.
*(Staging outside `apps/` is my call, so a Phase 0 rollback stays a clean diff. Gerald can
override and let you write straight into `apps/dashboard/supabase/`.)*

```
staging/db/
  migrations/
    0001_platforms.sql
    0002_entries.sql
    0003_analyses.sql
    0004_platform_accounts.sql
    0005_sync_runs.sql
    0006_import_batches.sql
    0007_rls.sql
    0008_public_view_and_grants.sql
    0009_stats_functions.sql
    0010_tag_usage_view.sql
  seed.sql
  types.provisional.ts
```

Real Supabase timestamp prefixes get applied at Phase 1; keep the ordinal names while staged so
the sequence is readable.

### B0.1 — Migrations

Schema is specified in `MASTER-PLAN.md` section 4 — follow it, do not redesign it. Points that
need care:

- `entries.owner_id uuid not null default auth.uid() references auth.users`.
- `unique (platform_id, external_id) where external_id is not null` — this is the dedupe key that
  makes sync idempotent. A partial unique index, not a plain constraint.
- `difficulty` keeps the platform's label verbatim (`text`); `difficulty_rank smallint` is the
  normalized 1-5 used for charts. Constrain it `check (difficulty_rank between 1 and 5)`.
- `status`, `category`, `source`, `sync_runs.status`, `import_batches.status`, `analyses.period` —
  use `check` constraints over enum types. Postgres enums are painful to alter later and this
  schema will churn.
- `updated_at` maintained by a trigger, not by application code.
- `platform_accounts.credential_secret_name` stores the **name** of a Supabase Vault secret.
  Never a token, never a cookie, never a session. If you find yourself adding a column that would
  hold a secret value, stop and raise it.

### B0.2 — RLS and the public grant

```sql
alter table entries enable row level security;
-- all writes and private reads: auth.uid() = owner_id

create view public_entries with (security_invoker = off) as
select id, platform_id, challenge_name, category, difficulty, difficulty_rank,
       date_completed, tags, problem_url, portfolio_writeup
from entries where status = 'solved';

revoke all on entries from anon;
grant select on public_entries to anon;
```

**Public safety here is structural, not policy-based.** `anon` cannot reach the `entries` table
at all, and `notes` is not a column of the view — so no policy bug and no UI slip can leak
private notes. Preserve that property. Any change that grants `anon` anything on `entries`, or
adds `notes` to the view, is a design violation, not a refactor.

Enable RLS on every other table too. `platforms` is the one reasonable `anon`-readable table
(the public view needs platform names and icons to render) — grant `select` on it explicitly and
confirm it holds nothing private.

### B0.3 — Stats functions

Worker-a's Phase 4 charts read these; they must not `select *` and reduce in the browser. Write
them as SQL functions returning aggregates:

- `stats_kpis(owner uuid)` — total solved, current streak, longest streak, solved this month.
- `stats_activity(owner uuid, bucket text, from date, to date)` — counts per day/week/month.
- `stats_by_difficulty(owner uuid)` — grouped on `difficulty_rank`.
- `stats_by_platform(owner uuid)`, `stats_by_tag(owner uuid, limit int)`.
- `tag_usage` view — distinct tag + count, powering worker-a's tag autocomplete.

Streak logic is the fiddly one: consecutive calendar days with at least one `status='solved'`
entry, computed against `date_completed`, tolerant of `null` dates (exclude them). Write it as a
window function over a `generate_series` day spine, not a loop.

### B0.4 — Seed all ~25 platforms

`seed.sql` populates `platforms` from the matrix in `platform-sync-research.md`. Per row:
`slug`, `name`, `category` (`swe` | `cyber` | `bugbounty`), `url`, `icon_kind`, `icon_ref`,
`brand_color`, `sort_order`, and:

- `sync_adapter` — the adapter key, or **`null`** for every platform with no sanctioned API *and*
  every platform Gerald has no account on yet. Only `codewars` and `codeforces` get a non-null
  value in Phase 7. Platforms light up later by setting this column, no code change.
- `import_hint` — the text shown in the assisted-import UI telling Gerald where on that platform
  to copy his solved list from. Required for `leetcode`, `tryhackme`, `hackthebox`.

Reuse the existing `--brand-*` values from `apps/web/src/app/globals.css` where a platform
overlaps a tech logo; source the rest from each platform's own branding.

### B0.5 — Publish the provisional types  *(worker-a is waiting on this)*

Hand-write `types.provisional.ts` in the exact shape the Supabase generator emits
(`Database['public']['Tables'][...]['Row' | 'Insert' | 'Update']`, plus `Views` and `Functions`).
Mark it clearly as provisional at the top.

Worker-a builds against it during Phase 2 and 3. At Phase 1 you regenerate for real, **diff the
two**, and report every difference to the orchestrator — that diff is the moment silent breakage
would otherwise enter worker-a's code.

### B0.6 — LLM provider abstraction  *(pure TypeScript, writable now)*

`supabase/functions/_shared/llm/` — `provider.ts` (the interface), `gemini.ts`, `anthropic.ts`
(stub). Selected at runtime by a `LLM_PROVIDER` env var.

- Model ID is exactly **`gemini-3.5-flash-lite`**. Not a generic string, and specifically not
  `gemini-2.5-flash-lite`, which is retired 2026-10-16 and would break shortly after launch.
- The Gemini key is server-side only, read inside the Edge Function. It must never reach the
  client bundle.
- Free-tier Flash-Lite is roughly 30 RPM, and free-tier prompts may be used by Google for
  training. Since challenge `notes` can contain sensitive material, `generateWriteup()` must send
  only the fields intended for publication — never the raw `notes` column. Flag this to the
  orchestrator if the prompt design seems to require otherwise.
- Record `provider`, `model_used`, `input_tokens`, `output_tokens` on every `analyses` row.

### B0.7 — Adapter interface + registry  *(pure TypeScript, writable now)*

`supabase/functions/_shared/adapters/registry.ts` plus the interface every adapter implements:
fetch, normalize to `entries` rows, map the platform's difficulty label to `difficulty_rank`,
return an `external_id` per item. Write `codewars.ts` and `codeforces.ts` against their public
docs now; they can be tested against live public endpoints without any Supabase project, since
neither needs auth for public profile data.

- **Codewars:** `GET /api/v1/users/{user}/code-challenges/completed?page={n}`, 200 per page.
- **Codeforces:** `user.status`; **hard limit of 1 request per 2 seconds** or calls fail. Build
  the throttle into the adapter, not the caller.

**Do not write adapters for LeetCode, TryHackMe, or HackTheBox.** All three have ToS that forbid
this — LeetCode bans scraping outright, HTB bans compiling API responses into a dataset, THM bans
automated access. Gerald chose assisted import over building them anyway. If you find yourself
adding an HTTP call to any of those three hosts, stop.

**Track 0 exit:** the full `staging/db/` tree plus provisional types. Report to the orchestrator;
tell worker-a directly that the types file is ready.

---

## Phase 1 — Apply to the real project  *(blocked on Gerald's credentials)*

1. `supabase link`, rename migrations to real timestamp prefixes, `supabase db push`.
2. Run `seed.sql`.
3. Configure the GitHub OAuth provider in Supabase Auth with the callback URL; confirm the same
   callback is registered on the GitHub app for **both** preview and production origins.
4. `supabase gen types typescript` for real. Diff against `types.provisional.ts`, report every
   difference, then publish the real file as the contract.
5. Verify the security property by hand, not by inspection: connect with the **anon key** and
   confirm `select * from entries` is denied and `select * from public_entries` returns only
   solved rows with no `notes` column.

---

## Phase 6 — LLM layer

Edge functions `analyze` and `generate-writeup` on top of the B0.6 abstraction. Weekly schedule
via **`pg_cron` + `pg_net`** (`net.http_post()` from a SQL job) — there is still no native
external scheduler; the Supabase Cron UI wraps this same mechanism and is fine to use. The
function's auth credential goes in Vault, not in the job definition.

Manual "Regenerate insights" path for worker-a to call. Token counts recorded per analysis.

---

## Phase 7 — Sync + assisted import

- `sync-platform` Edge Function driving the registry. Every run writes a `sync_runs` row
  (`running` -> `success` | `partial` | `failed`) with created/updated counts and error text.
- **Fail-soft:** a failed sync must never block manual entry. The UI shows "last synced 3h ago";
  it does not error-gate the app.
- Idempotency comes from the `(platform_id, external_id)` partial unique index — upsert on it.
- `parse-import` Edge Function: Gerald pastes his own solved list, Gemini parses it to structured
  rows, the rows land in `import_batches.parsed` as `status='parsed'`, and nothing enters
  `entries` until he confirms. Batches he discards stay for audit.

---

## Phase 9 — CMS schema  *(with worker-a, after the tracker ships)*

Tables for projects, certificates, experiences, tech items, plus a real `project_tech` join table
replacing today's render-time string matching between `stack[]` and `matchKeys[]`. Icons stored
as `icon_kind` + `icon_ref`, resolved by a code-side registry — a React component reference
cannot become a column. Blog metadata to the DB; MDX bodies stay as files.

Open questions in `portfolio-data-inventory.md` section 10 (free-text dates, `text[]` vs. join
table, `badge_url` being unused) need Gerald's answers before this schema is finalized. Collect
them, do not decide them.

---

## Standing rules

- **Never `git commit` or `git push`.** Gerald commits manually. Report, do not commit.
- No AI or Claude attribution in any repo-visible content — code, comments, SQL, or docs.
- Secrets live in Supabase Vault or Vercel env vars. Never in the repo, never in a table column,
  never in a migration file. `.env.local` is not committed.
- Never write outside your owned paths. If you need something in worker-a's tree, ask through the
  orchestrator.
- Never grant `anon` access to `entries`, and never add `notes` to `public_entries`.
- No HTTP calls to leetcode.com, tryhackme.com, or hackthebox.com from any server-side code.
- Raise ambiguity to the orchestrator. Do not guess and proceed.
