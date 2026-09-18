# Execution Plan — dashboard.geraldmanurung.site

**Written:** 2026-09-17 · **Supersedes the gating in:** `WORKER-A-PLAN.md`, `WORKER-B-PLAN.md`
(everything else in those files still applies) · **Companion:** `MASTER-PLAN.md`

> **Wave A′ inserted 2026-09-18, before Wave 3 and Phase 8.** The tracker's data model was
> generalised into user-definable record kinds — see `RECORD-MODEL.md` (spec, with ten decisions
> signed off in §1.1), `WORKER-A-RECORDS.md` and `WORKER-B-RECORDS.md` (assignments).
> `TRACKER-EXPANSION-PLAN.md` holds the superseded seven-table design, kept as the fallback.
>
> Wave A′ goes **before** Phase 8 deploy and takes priority over Wave 3's Phase 7 (sync), because
> `entries` currently has 0 rows and that window closes the moment Gerald starts logging. Phase 7
> adapters are unaffected in substance — they write `records` with `kind = 'ctf'`.
>
> `difficulty_rank`, open since Wave 2, is **closed**: signed off as a shared 1–5 `rank` column
> with a verbatim `rank_label`.

Roles: **[O]** orchestrator (plans, verifies, opens gates) · **[A]** worker-a (frontend) ·
**[B]** worker-b (backend) · **[G]** Gerald

---

## 1. Where things stand

| Item | State |
|---|---|
| Track 0 (both workers) | Done. Staged in `docs/planning/staging/`. |
| Phase 0 — restructure | Half done. `git mv` into `apps/web/` is staged on `master`, `apps/web` builds. **Not committed, Vercel not changed, `master` is 10 commits behind `main`.** |
| Phase 0.5 — AGENTS.md | Written into `apps/web/AGENTS.md`. Not committed. |
| Credentials | All verified live 2026-09-17: Supabase URL/anon/service_role, access token, GitHub OAuth provider enabled, auth Site URL + redirect URLs, owner GitHub id (@geraldman), Gemini key. |
| `SUPABASE_DB_PASSWORD` | **Unverifiable from this machine.** Outbound 5432/6543 are blocked on this network. |

## 2. Gate change

The old plans said nothing enters `apps/` until Phase 0 is deployed. That gate existed to keep a
Phase 0 rollback clean. It is relaxed as follows:

- **Allowed now:** remote Supabase work (touches no repo file) and a brand-new, untracked
  `apps/dashboard/` directory (touches nothing Phase 0 moves).
- **Still forbidden for workers:** anything under `apps/web/**` and anything at the repo root.
- **Still gated on Phase 0:** Phase 8 (deploy). The dashboard cannot ship until the portfolio's
  Vercel project is rooted at `apps/web`.

Gerald must commit Phase 0 from the staged index only, so `apps/dashboard/` does not ride along.

## 3. Constraints every worker must know

1. **No direct database connection.** Ports 5432/6543 are blocked. No `psql`, no
   `supabase db push`, no `supabase link` that needs the DB. Use the **Supabase Management API**
   with `SUPABASE_ACCESS_TOKEN`:
   - SQL: `POST https://api.supabase.com/v1/projects/{ref}/database/query` with `{"query": "..."}`
   - Types: `GET https://api.supabase.com/v1/projects/{ref}/types/typescript?included_schemas=public`
   - Edge Functions / secrets: `npx supabase ... --project-ref {ref}` with the token in the env.
     Deploy without Docker (`functions deploy --use-api`); confirm the flag against `--help`.
2. **Secrets.** Read them from `apps/dashboard/.env`. Never print a value, never copy one into
   another file, never put one in a migration. Only the orchestrator edits `.env` and
   `.env.example` — ask if a new variable is needed.
3. `supabase secrets set` gets **only** `GEMINI_API_KEY` and `LLM_PROVIDER`. Never `--env-file .env`
   — that would upload the service_role key and the access token into Edge Function env.
4. **Never `git commit` / `git push`.** No AI attribution anywhere repo-visible.
5. Dashboard dev server runs on **port 3001** (`next dev -p 3001`); the auth redirect list
   is configured for exactly that.

## 4. Ownership in `apps/dashboard/`

| Path | Owner |
|---|---|
| `supabase/**` (migrations, seed, functions, `database.types.ts`) | [B] |
| everything else — `src/**`, `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.gitignore`, `AGENTS.md` | [A] |
| `.env`, `.env.example` | [O] |

**The contract:** `apps/dashboard/supabase/database.types.ts`. [A] imports it through a tsconfig
path alias (`@db/*` → `./supabase/*`). Until [B] publishes the real file, [A] copies
`staging/db/types.provisional.ts` to that path **only if it does not exist yet**, and [B]
overwrites it at B1.5.

---

## 5. Waves

### Wave 1 — start now, in parallel

#### [B] Phase 1 — Supabase foundation

**B1.0 — Close the non-owner write hole (blocking — do this before applying anything).**
The staged schema is not single-owner at the database layer:
- RLS policies are `auth.uid() = owner_id`. **Any** GitHub account that completes OAuth gets a
  Supabase user (the app's callback signs them out *after* the user row exists) and a valid JWT.
- With that JWT and the public anon key, a stranger can `insert` rows owned by themselves.
- `public_entries` filters only `status = 'solved'`, not by owner — so those rows appear on the
  **employer-facing page**.

Fix at the database, not the UI:
- A `private` schema (no grants to `anon`/`authenticated`) holding the owner's GitHub id.
  Insert the value at apply time from `DASHBOARD_OWNER_GITHUB_ID` — not hard-coded in a migration.
- `public.is_owner()` — `security definer`, `stable`, fixed `search_path`, true only when
  `auth.uid()` has an `auth.identities` row with `provider = 'github'` and `provider_id` equal to
  that id. Do **not** trust `user_metadata` — users can edit their own.
- Every write/read policy on owner tables becomes `auth.uid() = owner_id and is_owner()`.
- `public_entries` additionally restricts to rows whose `owner_id` is the owner's user.
- Stats functions keep their `owner <> auth.uid()` check and add `is_owner()`.

**B1.1** — Move `staging/db/` → `apps/dashboard/supabase/`: `migrations/` with real
`YYYYMMDDHHMMSS_name.sql` prefixes, `seed.sql`, `functions/_shared/**`. Add the B1.0 migration in
sequence. Delete the staged copies once moved.

**B1.2** — Apply each migration via the query endpoint, in order, stopping on the first error.
Record each one in `supabase_migrations.schema_migrations` (`version`, `name`, `statements`) —
create the schema/table if absent — so a future `supabase db push` from an open network does not
re-apply them.

**B1.3** — Run `seed.sql`; insert the owner id into the private config.

**B1.4 — Prove the security property with real requests, not by reading SQL.** Against
PostgREST (`{SUPABASE_URL}/rest/v1/...`):
1. anon key: `entries` is denied; `public_entries` returns 200 and has no `notes` key.
2. Create a throwaway email/password user via the admin API (service_role). Sign in as them.
   With their JWT: `insert` into `entries` is denied, `select` returns nothing, `stats_kpis`
   is denied. Delete the throwaway user afterwards.
3. With service_role, insert one `solved` entry owned by the throwaway user *before deleting
   them*, confirm it does **not** appear in `public_entries`, then clean up.

**B1.5** — Generate real types → `apps/dashboard/supabase/database.types.ts`. Diff against
`types.provisional.ts` and **list every difference** in your report; message [A] directly.

**B exit report:** migration list applied, B1.4 results (each request + status code), the types
diff, anything that deviated from `MASTER-PLAN.md` §4.

#### [A] Phase 2 — Scaffold + auth

Follow `WORKER-A-PLAN.md` Phase 2 as written, plus:
- `package.json` scripts: `"dev": "next dev -p 3001"`. Versions matched to `apps/web`.
- tsconfig alias `@db/*` → `./supabase/*` (see §4).
- **Owner check at `auth/callback`:** use `supabase.auth.getUser()` server-side, and compare the
  `provider_id` of the user's `github` entry in `identities` with `DASHBOARD_OWNER_GITHUB_ID`.
  Not `user_metadata`. Non-owner → sign out → "not authorized" screen.
- The UI gate is defence in depth; B1.0 is the real boundary. Do not remove either.
- `npm install` / `npm run build` from inside `apps/dashboard` only.

**A exit report:** `npm run build` output (pass/fail), route list, whether it builds against
provisional or real types, and anything from the Next 16 docs that contradicted `@supabase/ssr`.

#### [G] Phase 0 — in parallel, Gerald's track
1. Bring `main` into `master` (the CV PDF, `ContactSection.tsx`, `Button.tsx` must follow the
   rename to `apps/web/`). The orchestrator can do the merge on request; Gerald commits.
2. Commit the restructure from the staged index.
3. Vercel `personal-web`: Root Directory → `apps/web`; Ignored Build Step
   `git diff --quiet HEAD^ HEAD -- .`
4. Push, verify the **preview**, then promote.
5. Confirm or veto `difficulty_rank` (1–5 normalized difficulty) before Wave 3 charts use it.

### Gate 1 → 2 — orchestrator verifies independently
- `apps/dashboard` `npm run build` green (re-run by [O], not taken from the report).
- [O] repeats B1.4 probes 1 and 2.
- [A] has switched to the real types and still builds.
- **[G] signs in once at `http://localhost:3001`** — the only step that proves the OAuth round trip.

### Wave 2
- **[A] Phase 3** — Entry CRUD (per `WORKER-A-PLAN.md`). Flag `difficulty_rank` in the report.
- **[B] Phase 6** — LLM layer: deploy `analyze` and `generate-writeup`; set the two secrets;
  weekly `pg_cron` + `pg_net` job with its credential in Vault. The job must resolve the owner
  via the B1.0 private config, not a hard-coded uuid. Report token counts from one real run.

### Gate 2 → 3
- [O] creates, edits and deletes an entry through the UI; confirms the row via the API.
- One real `analyses` row exists with `provider`, `model_used`, token counts populated.

### Wave 3
- **[A] Phase 4** — Stats + charts. Every chart reads a `stats_*` function; none reduce rows in
  the browser.
- **[A] Phase 5** — Public view on `public_entries` only.
- **[B] Phase 7** — `sync-platform` (Codewars, Codeforces) and `parse-import`. No HTTP to
  leetcode.com, tryhackme.com, hackthebox.com — ever.

### Gate 3 → 4
- Public page shows only Gerald's solved entries, no `notes` anywhere in the payload (checked in
  the network response, not the rendered page).
- A sync run writes a `sync_runs` row; re-running it creates no duplicates.

### Wave 4 — Phase 8 deploy [O] + [G]
Requires Phase 0 fully done. Second Vercel project rooted at `apps/dashboard`, env vars (not the
CLI-only ones), `dashboard` DNS record, preview origins added to Supabase redirect URLs, Ignored
Build Step on both projects.

Phase 9 (portfolio CMS) stays out of this plan until the tracker ships.

---

## 6. UI approach — skeleton first (added 2026-09-18, Gerald's call)

Gerald intends to refactor the UI of **both** apps later. Until then, Waves 2 and 3 build
**structure, not visual design**.

- Every route, component and data path gets built for real. Styling stays at placeholder level:
  the monochrome tokens already in `globals.css` (`var(--color-*)`, `.glass`, `.glow`), plain
  layout, no bespoke visual work.
- **Do not** invest in polish, custom animation, illustration or per-screen art direction — it
  gets thrown away. This overrides "Phase 5 gets real design attention" in `WORKER-A-PLAN.md`;
  the public view still gets correct SEO metadata, OG tags and `sitemap.ts`, because those are
  structure, not styling.
- Build shared components (`DataTable`, `FilterBar`, `TagInput`, `DifficultyBadge`,
  `PlatformIcon`, `StatTile`, `EmptyState`, skeletons) as the seams the refactor will work
  through: styling in one place, no hex literals, no color decisions scattered across screens.
- Charts (Phase 4) still read the SQL aggregates. Use default Recharts styling with token
  colors; do not hand-tune chart appearance yet.
- `apps/web` is **not** in scope. Its refactor is a separate effort after the tracker works.

## 7. Reporting protocol

- Report to the orchestrator via message at each exit, and **immediately** on a blocker or on
  anything that would change `MASTER-PLAN.md` §4.
- Format: `DONE | BLOCKED | QUESTION` · what changed (paths) · how it was verified (commands +
  results) · open issues.
- A wave is not done when a worker says so; it is done when [O] has re-verified the gate.
- Workers talk to each other directly only for the types contract. Everything else goes
  through [O].
