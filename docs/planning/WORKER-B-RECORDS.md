# Worker-B Execution Plan — Record Model (Wave A′)

**Role:** Supabase schema, RLS, SQL functions, Edge Functions
**Owns (exclusive write access):** `apps/dashboard/supabase/**`
**Never writes:** `apps/dashboard/src/**` (worker-a), `apps/web/**`, `.env*` (orchestrator), repo root
**Spec — normative, do not redesign:** `RECORD-MODEL.md`
**Planned:** 2026-09-18 · Companions: `WORKER-A-RECORDS.md`, `EXECUTION-PLAN.md`

---

## 0. What changed

The tracker stopped being "a CTF log plus six more tables" and became one generic `records` table
whose behaviour is declared per *kind* in a row. `RECORD-MODEL.md` is the specification and its
§1.1 holds ten decisions already signed off by Gerald. **Implement it; do not relitigate it.**
If something in it is wrong or impossible, report `QUESTION` to the orchestrator before writing
SQL around it.

You are on the critical path. Worker-a's Track 1 can proceed in parallel against the
`field_schema` contract (§1.2), but nothing they build can touch real data until B′.3 lands.

## 1. Hard constraints — unchanged from Waves 1–2

1. **No direct database connection.** Outbound 5432/6543 are blocked on this machine. No `psql`,
   no `supabase db push`, no `supabase link`. Everything goes through the Management API:
   `POST https://api.supabase.com/v1/projects/{ref}/database/query` with `{"query": "..."}`.
   Record every migration manually in `supabase_migrations.schema_migrations`.
2. **Secrets** are read from `apps/dashboard/.env`, never printed, never copied into a file, never
   put in a migration. `supabase secrets set` gets **only** `GEMINI_API_KEY` and `LLM_PROVIDER` —
   never `--env-file .env`, which would upload the service_role key and the access token.
3. **Never `git commit` / `git push`.** No AI attribution anywhere repo-visible.
4. The live project is real and populated: 16 migrations applied, 28 platforms seeded, 3 real
   `analyses` rows, 1 auth user. **`entries` has 0 rows** — that window is why this wave is
   happening now. Confirm it is still 0 before B′.1.

### 1.2 The contract with worker-a

`database.types.ts` types `field_schema` as `Json` — useless to worker-a. The real contract is
**`RECORD-MODEL.md` §5**, implemented twice:

| Side | Artifact | Owner |
|---|---|---|
| Database | the `data` validation trigger | **you** |
| Frontend | the `FieldDef` TypeScript type in `src/lib/types.ts` | worker-a |

These two must agree on the field-type vocabulary (`text`, `textarea`, `markdown`, `code`,
`number`, `date`, `bool`, `url`, `select`, `multiselect`, `tags`, `keyvalue`) and on `required`
and `private`. **Any change to that vocabulary goes through the orchestrator and updates
`RECORD-MODEL.md` §5 first.** Do not add a field type unilaterally — worker-a cannot render one
they do not know about, and the failure is silent.

---

## Track 1 — blocking, do in order

### B′.1 — `20260918NNNNNN_record_model.sql`

**Evolve `entries`, do not drop it** (decision 2). Its RLS policies, grants, indexes and triggers
follow the rename, so the Wave 1–2 security audit is amended rather than redone. Views tracking
the table by OID repoint automatically.

**Order matters.** Create `record_kinds` first — `records.kind_id` is `not null` and needs a
default resolvable for the existing zero rows.

Column mapping, `entries` → `records`:

| From | To | Note |
|---|---|---|
| `challenge_name` | `title` | |
| `difficulty` | `rank_label` | verbatim source label, unchanged semantics |
| `difficulty_rank` | `rank` | now also serves confidence and rating (decision 1) |
| `category` | `data->>'discipline'` | `swe \| cyber`. **Not** the CTF taxonomy — see §9.1 of the spec |
| `status` | `status` | values become `solved \| in_progress \| stuck \| abandoned`; `attempted` dropped |
| `portfolio_writeup` | `body` | |
| `problem_url` | `url` | |
| `date_completed` | `completed_on` | |
| `notes`, `tags`, `owner_id`, `platform_id`, `source`, `external_id`, `synced_at`, `writeup_model`, `writeup_generated_at`, `created_at`, `updated_at` | unchanged | `platform_id` becomes **nullable** |

Added: `kind_id`, `parent_id`, `slug`, `summary`, `minutes_spent`, `data jsonb not null default '{}'`,
`is_public boolean not null default false`, `sort_order`.

Index work:
- Drop `entries_platform_external_id_key`; create
  `unique (kind_id, platform_id, external_id) where external_id is not null`.
- Add `records_kind_id_idx`, `records_parent_id_idx`, `gin (data)`.
- Keep the existing owner/status/date/tags indexes (they survive the rename; rename them for
  legibility only if it costs nothing).

Then `record_links` per spec §3.3.

**`status` is not a check constraint.** Each kind owns its status vocabulary, so validate it in
the same trigger as `data`: `new.status = any(kind.statuses)`. A table-level check constraint
cannot express this and would have to be dropped the first time a kind is added.

**The validation trigger** (decision 7) fires `before insert or update` only. It must:
- resolve the kind row once,
- reject a `status` not in `kind.statuses`,
- reject a `data` key not declared in `field_schema`,
- reject a missing `required` key,
- type-check each value against its declared `type`,
- **never** touch or re-validate rows it was not fired for.

Guards inside it use `coalesce(..., false)` — see §3.3.

### B′.2 — `..._record_kinds_seed.sql`

The nine kinds from spec §6, exactly. Specifically:

- `public` in `capabilities` for **`ctf`, `skill`, `resource`, `blog_post` only** (decision 6).
  LFS kinds and `competition` get none. This is deliberate, not an oversight.
- `competition.retrospective` carries `"private": true` in its `field_schema` regardless.
- `ctf.field_schema` declares both `discipline` (`swe | cyber`) **and** `ctf_category`
  (pwn/web/crypto/forensics/reversing/ai/osint/hardware/ppc/misc). They are different axes.
- `is_system = true` on all nine.
- `owner_id` defaults to `public.owner_id()`, **not** `auth.uid()` — this seed runs as
  service_role through the Management API, where `auth.uid()` is NULL and a `not null` owner
  column would fail. Verify that resolves before running the whole file.

### B′.3 — public views

`public_records` per spec §7, plus `public_entries` rebuilt as a thin compatibility view over
`public_records where kind = 'ctf'` so the portfolio page and its audited anon grants survive.

Both are `security_invoker = off`. Both **inline the owner lookup as a subquery** — see §3.2.

The private-key strip is the part to get exactly right:

```sql
r.data - coalesce(
  (select array_agg(f->>'key')
     from jsonb_array_elements(k.field_schema) f
    where (f->>'private')::bool),
  '{}'::text[]
) as data
```

`notes`, `minutes_spent`, `rank` where it means confidence, and every `private` field must be
**absent from the select list**, not filtered by a `where`. Absent cannot leak.

`record_kinds` gets `select` granted to `authenticated` only — never `anon`. The view reads it
through `security_invoker = off`, the same mechanism that already lets `public_entries` read
`entries` with zero grant.

### B′.4 — stats functions

Each takes `(owner uuid, kind text)` and reads `records`. Per spec §9.1:

| Function | Reads |
|---|---|
| `stats_activity` | `completed_on` |
| `stats_by_rank` | `rank`, `rank_label` — replaces `stats_by_difficulty` |
| `stats_by_tag` | `tags` |
| `stats_by_platform` | `platform_id` |
| `stats_by_category` | `data->>'discipline'` — **retargeted**, so the shipped Phase 4 chart keeps working |
| `stats_by_ctf_category` | `data->>'ctf_category'` — new |
| `stats_kpis` | counts, scoped by kind |

Keep the `owner <> auth.uid()` check **and** `is_owner()` on every one. Every function ends with
the explicit revoke in §3.1 — this is where the Wave 2 leak happened.

Publish regenerated `database.types.ts` and message worker-a directly with the diff, as at B1.5.

---

## Gate B′ — the orchestrator re-verifies with live requests

A wave is not done because you report it done. Expect these to be re-run independently:

1. anon key against `records`: denied. Against `record_kinds`: denied. Against `record_links`: denied.
2. anon against `public_records`: 200, and the payload contains **no** `notes` key and **no**
   `private` field key for any kind.
3. anon against `public_records` for an LFS row: returns nothing, because `lfs_*` kinds have no
   `public` capability — verify this by *publishing* an LFS row (`is_public = true`) and
   confirming it still does not appear.
4. anon `rpc/` on each new stats function and on the validation helper: denied.
5. Throwaway user (service_role admin API, deleted after): insert into `records` denied, select
   returns nothing, every `stats_*` denied.
6. Validation trigger: an insert with an undeclared `data` key is rejected; an insert with a
   `status` outside the kind's vocabulary is rejected; **editing a kind's `field_schema` leaves
   existing rows readable and editable** (decision 7).

---

## Track 2 — after deploy

### B′.5 — assisted capture (decision 4)

Extend `parse-import`, do not write a second function. Input: pasted terminal output or freeform
notes plus a target `kind`. Output: a **proposal**, never an insert — one `lfs_checkpoint` shape
plus one `lfs_issue` shape per failure detected, returned for review in the UI.

- Reuse the deployed provider abstraction in `_shared/llm/`. Gemini wraps JSON in a ```json
  fence — strip it before `JSON.parse`; this has bitten twice.
- The function writes nothing to `records`. Worker-a's review screen inserts what Gerald approves.
- Report token counts from one real run.
- Open question for the orchestrator before you build it: whether one paste may propose several
  issue rows in one batch (spec §11, item 2).

### B′.6 — `time_rollup` + review pre-fill (decision 8)

```sql
create view time_rollup as
select k.slug as kind, r.completed_on as occurred_on, r.minutes_spent as minutes
from records r join record_kinds k on k.id = r.kind_id
where r.minutes_spent is not null
```

Plus `data->>'time_lost_minutes'` from `lfs_issue` as its own `lfs_debug` bucket, so "where did
the LFS time actually go" is answerable — that number is the point of tracking it separately.

A `review_prefill(owner uuid, window_start date, window_end date)` function returns the rollup
sums by kind, the records closed in the window, and the `analyses` row for the same window.
**It returns facts only.** It does not draft prose — Gerald writes that, with per-field LLM assist
triggered from the UI (decision 8), never auto-filled.

---

## 3. Security spine — the three traps, restated

Every one of these reached a "DONE" report in Waves 1–2 and was caught only by live requests.

### 3.1 Default grants leak EXECUTE to `anon`
Supabase grants `EXECUTE` on every new `public`-schema function to `anon`/`authenticated` by
default, and `revoke ... from public` does **not** remove it. `anon` could call `owner_id()` then
`compute_stats_snapshot(owner)` and read real statistics.
> End every new function with an explicit `revoke execute ... from anon, authenticated;` then a
> `grant execute` naming only the roles that need it.

### 3.2 A view can never call an owner function
`security_invoker = off` governs *table* access inside a view, not which role's `EXECUTE` grant is
checked for a *function* in the view body — that is always the querying role. Revoking anon's
EXECUTE on `owner_id()` broke `public_entries` live.
> `public_records` inlines the owner lookup as a subquery against `auth.identities` /
> `private.app_config`. It never calls `owner_id()` or `is_owner()`.
> `authenticated` must keep EXECUTE on `is_owner()` — RLS policies evaluate as the querying role.

### 3.3 NULL is not false
`is_owner()` returned SQL NULL before any GitHub identity had signed in, so
`if not is_owner() then raise` silently did not raise.
> Every PL/pgSQL guard uses `coalesce(is_owner(), false)`. This includes the new validation
> trigger.

### 3.4 Per-table checklist
For `records` (post-rename), `record_kinds` and `record_links`:
- [ ] RLS enabled; owner policies `auth.uid() = owner_id and is_owner()` on all four verbs
- [ ] `revoke all on <table> from anon`
- [ ] `set_updated_at` trigger where `updated_at` exists
- [ ] Verified by live request, not by reading the migration

## 4. Reporting

`DONE | BLOCKED | QUESTION` · paths changed · how verified (commands + status codes) · open issues.
Report immediately on a blocker or on anything that would change `RECORD-MODEL.md`. Talk to
worker-a directly only about the types and `field_schema` contract; everything else goes through
the orchestrator.
