# Tracker Expansion Plan — LFS, CTF, Skills, Competitions, Blog, Resources, Reviews

**Written:** 2026-09-18 · **Extends:** `MASTER-PLAN.md` §4 · **Sequencing owner:** `EXECUTION-PLAN.md`

> **§4, §5 and §6 are superseded by `RECORD-MODEL.md`** (same day, after Gerald asked for
> user-definable entry kinds rather than a fixed set of trackers). The seven bespoke tables in §5
> became nine seeded rows in one `records` table. §1–§3 and §7–§10 still apply verbatim, and the
> superseded sections are kept because they are the fallback if the generic model proves too
> costly — the reasoning in them (why `techniques` is not `tags`, why `last_practiced` is derived,
> why `analyses` is not `reviews`) carries over unchanged.

The tracker was scoped as "challenge log + portfolio CMS". This document widens it to the seven
logs Gerald actually intends to keep, without re-opening any decision already locked in
`MASTER-PLAN.md` §1 and without delaying Phase 8 (deploy).

---

## 1. The one fact that drives the sequencing

**`entries` currently holds zero rows.** Every check constraint, column and default on that table
is free to change today and expensive to change once there is a logging history. Everything else
in this document is additive — new tables that do not exist yet — and therefore costs the same
whether it is built now or in November.

So the work splits:

| Part | Scope | When |
|---|---|---|
| **A** | Extend `entries` in place for the CTF log | **Now**, before the first entry is logged |
| **B** | Five new tracker domains (Phase 10) | **After Phase 8 deploy** |

Part A is one migration and a form change. It does not touch Phase 7 (sync) or Phase 8 (deploy),
and it is not on their critical path.

## 2. Decisions locked (2026-09-18)

| Decision | Choice |
|---|---|
| Sequencing | Split — `entries` extension now, new domains as Phase 10 after deploy |
| CTF log storage | **Extend `entries`.** No separate `ctf_challenges` table |
| Public exposure | **Per-row toggles**, not a fixed per-tracker policy — see §6 |
| Time tracking | Per-row `minutes_spent`, rolled up by a view. No session log |
| Skill linkage | Staged: `techniques text[]` now, canonical `skills` table in Phase 10 |

## 3. What already exists — do not rebuild it

Roughly a third of the seven items is already built and live. Check here before writing anything.

| Requested | Already covered by | Gap |
|---|---|---|
| CTF: name, platform, difficulty, status, writeup notes | `entries` + `platforms` (28 seeded) | category taxonomy, tools, time, technique |
| CTF: "tag-able" | `entries.tags text[]` + GIN index + `stats_by_tag` | tags are free text and will drift |
| Weekly/monthly review | `analyses` (period, window, `stats_snapshot`, `pg_cron` weekly job) | it is LLM output, not *your* planned-vs-done |
| Blog: metadata in DB, body in repo | `MASTER-PLAN.md` §1 — MDX stays in repo | the pipeline table itself |
| Public exposure plumbing | `public_entries` view, anon grants, RLS | per-row toggles, views for new domains |

**`analyses` is not the review table.** It holds what the model generated about a window. A
review is what *you* wrote about that window. Phase 10 adds `reviews` with an optional FK to the
`analyses` row for the same window, so the two sit side by side.

---

## 4. Part A — extend `entries` (do now)

Migration: `20260918120000_entries_ctf_fields.sql`. Written, **not yet applied.**

### 4.1 Columns added

| Column | Type | Why |
|---|---|---|
| `ctf_category` | `text` check pwn/web/crypto/forensics/reversing/ai/osint/hardware/ppc/misc | The CTF taxonomy. **Sub**-category of `category = 'cyber'`, not a replacement |
| `tools_used` | `text[]` default `{}` | Requested. GIN indexed |
| `techniques` | `text[]` default `{}` | "Key technique learned." Separate from `tags` — see §4.3 |
| `minutes_spent` | `int`, `>= 0` | Time to solve. Feeds the review rollup |
| `is_public` | `boolean` default **`false`** | Per-row publish toggle — see §6 |

### 4.2 Constraint changed

`status` becomes `solved | in_progress | stuck | abandoned`. `attempted` is dropped — it means
the same thing as `stuck` and having both guarantees inconsistent logging. Safe because the table
is empty and every stats function filters only on `status = 'solved'` (verified:
`20260917150900_stats_functions.sql` lines 29, 44, 54, 84, 107, 131, 153).

`category` is **unchanged** (`swe | cyber`). `stats_by_category` groups on it and the Phase 4
chart reads that function; changing it would break a shipped chart for no gain.

### 4.3 Why `techniques` is not just `tags`

The stated goal is "query all challenges where I learned X". `tags` is free text with no
canonical list — six months in it holds `ROP`, `rop`, `rop-chain` and `ret2libc`, and that query
returns a third of the truth. Phase 10 introduces a `skills` table with canonical names and an
`entry_skills` join, and seeds it **from the `techniques` arrays accumulated between now and
then**. Logging into a dedicated array now means Phase 10 is a backfill script instead of a
manual re-tagging session.

`tags` keeps its current job: topical labels for the portfolio view.

### 4.4 `public_entries` behaviour change

The view currently publishes on `status = 'solved'` alone. It gains `and is_public`, so nothing
reaches the public page until the toggle is flipped. Fail-closed, and consistent with §6.

`ctf_category` and `tools_used` are added to the view. `techniques`, `minutes_spent` and `notes`
are **not** — how long something took you and what you did not know are private.

### 4.5 Frontend follow-on (worker-a)

- `EntryForm`: CTF-category select (shown when `category = 'cyber'`), `TagInput` reused for
  `tools_used` and `techniques`, minutes input, publish toggle.
- `EntriesTable` / `FilterBar`: filter by `ctf_category` and by status including the two new values.
- `DifficultyBadge` unchanged.
- No new chart in Part A. `stats_by_ctf_category` lands in Phase 10 with the rest.

---

## 5. Part B — Phase 10 schema (after deploy)

Seven tables, two views. All follow the existing security spine in §7 — none of it is optional.

### 5.1 LFS build log

Three tables, because a build has chapters and a chapter has failures, and the failures are the
part with blog value.

```sql
lfs_builds (
  id, owner_id, name, book_version, target_arch,
  host_distro, status,              -- planning | in_progress | complete | abandoned
  started_on date, completed_on date,
  notes, is_public, created_at, updated_at
)

lfs_checkpoints (
  id, owner_id, build_id -> lfs_builds,
  chapter text, title text,
  stage text,                       -- toolchain | temp-tools | chroot | basic-system
                                    -- | config | kernel | boot | blfs
  status text,                      -- pending | in_progress | done | blocked
  started_at, completed_at, minutes_spent int,
  commands text,                    -- what was actually run
  config_choices jsonb,             -- kernel flags, ./configure switches
  package_versions jsonb,           -- {"gcc":"14.2.0", ...}
  security_notes text,              -- attack surface / privilege boundary observations
  notes text, is_public bool, sort_order int
)

lfs_issues (
  id, owner_id, checkpoint_id -> lfs_checkpoints,
  title, symptom text,              -- the error output, verbatim
  root_cause text, resolution text,
  time_lost_minutes int, references text[],
  is_public bool, created_at
)
```

`security_notes` is a first-class column, not a tag, because it is the column that differentiates
this build log from the thousand others on the internet — and it is the direct feed for the
security-angle blog posts.

`package_versions` and `config_choices` are `jsonb` rather than columns: the key set differs per
chapter and will never be queried relationally.

**Time budget:** `minutes_spent` on checkpoints plus `time_lost_minutes` on issues gives the
"30–40% of total time" calibration directly — the second number is the one that actually answers
"where did the LFS time go".

### 5.2 Skills tracker

```sql
skills (
  id, owner_id, name, slug, area,
  confidence smallint check 1..5,
  first_learned_on date,
  last_practiced_override date,     -- manual, for practice that left no row
  resources_note text, notes, is_public
)
unique (owner_id, slug)

entry_skills (
  entry_id -> entries, skill_id -> skills,
  is_key_technique bool,            -- learned here, vs merely used here
  primary key (entry_id, skill_id)
)
```

**`last_practiced` is derived, never typed.** A manually maintained date column is stale within a
month and then actively misleading — the whole point is spotting rusty areas before a
competition, and a hand-updated date cannot do that. A view computes:

```
greatest(
  max(entries.date_completed) over linked entries,
  max(lfs_checkpoints.completed_at) over checkpoints tagged with the skill,
  last_practiced_override
)
```

Seeded in 10.3 by distinct-ing every `entries.techniques` value logged since Part A.

### 5.3 Competition tracker

```sql
competitions (
  id, owner_id, name, platform_id -> platforms (nullable), ctftime_event_id,
  format text,                      -- jeopardy | attack-defense | koth | mixed
  team_name, is_solo bool,
  started_at, ended_at,
  placement int, total_teams int, points numeric,
  retrospective text,               -- PRIVATE, never in a public view
  is_public bool
)
```

`entries` gains `competition_id` (nullable FK) in 10.4 — so a competition page lists the
challenges solved during it, and "what I needed but didn't have" cross-references the skills with
low confidence that showed up in those challenges.

### 5.4 Blog pipeline

```sql
posts (
  id, owner_id, title, slug,
  status text,                      -- idea | outlined | drafting | review | published | abandoned
  summary, target_publish_on date, published_on date,
  mdx_path text,                    -- repo path; the body stays in the repo (MASTER-PLAN §1)
  url, minutes_spent int, tags text[], is_public
)

post_sources (
  id, post_id -> posts,
  entry_id, lfs_checkpoint_id, lfs_issue_id, competition_id, skill_id,   -- all nullable FKs
  check (exactly one is non-null),
  note text
)
```

`post_sources` uses five nullable FKs with a check constraint rather than a
`(source_kind, source_id)` pair. Polymorphic ids cannot be enforced by the database, and an
unenforced link table quietly accumulates dangling rows.

### 5.5 Resource library

```sql
resources (
  id, owner_id, name,
  kind text,                        -- tool | book | course | writeup | paper | cheatsheet | video | site
  category text,                    -- recon | pwn | web | ai-security | osint | forensics | crypto | misc
  url, notes text,                  -- when/how to use it
  tags text[], rating smallint check 1..5, is_public, created_at
)
```

### 5.6 Reviews

```sql
reviews (
  id, owner_id, period text,        -- weekly | monthly
  window_start date, window_end date,
  planned text, done text, adjustments text,
  analysis_id -> analyses (nullable),
  created_at, updated_at
)
unique (owner_id, period, window_start)
```

Plus a view `time_rollup(kind, occurred_on, minutes)` — a `UNION ALL` over
`entries.minutes_spent`, `lfs_checkpoints.minutes_spent`, `lfs_issues.time_lost_minutes` and
`posts.minutes_spent`, labelled `ctf | lfs | lfs_debug | blog`. The weekly review reads one
`sum(minutes) group by kind` against it. No column duplicates that number.

No `is_public` on `reviews` — a retrospective is private by construction.

---

## 6. Visibility model — the toggles

Two independent gates, **both** required for anything to reach an anonymous reader:

1. **Per row:** `is_public boolean not null default false`. Default false everywhere. A row is
   private until deliberately published.
2. **Per tracker:** a `tracker_visibility (tracker text primary key, is_published boolean)` table
   — one switch per domain (`entries`, `lfs`, `skills`, `competitions`, `posts`, `resources`).
   Flipping `lfs` off hides the whole build log without touching a single row's toggle.

Every public view therefore reads:

```sql
where is_public
  and (select is_published from tracker_visibility where tracker = '<name>')
  and owner_id = (<inlined owner subquery — see §7.2>)
```

`tracker_visibility` gets **no** grant to `anon`. The views read it through
`security_invoker = off`, the same mechanism that already lets `public_entries` read `entries`
with zero grant on that table.

Private columns are excluded at the view level, never merely filtered: `notes`,
`competitions.retrospective`, `minutes_spent`, `time_lost_minutes`, `techniques`, and every
`reviews` column never appear in a public view's select list.

---

## 7. Security spine — non-negotiable for every new table

Three live security holes were found during Waves 1–2, all of them by running real requests
against the API rather than by reading the SQL. Each one generalises into a rule:

### 7.1 Default function grants leak to `anon`

Supabase's default privileges grant `EXECUTE` on every new `public`-schema function to `anon` and
`authenticated`, and `revoke ... from public` does **not** remove them. This let `anon` call
`owner_id()` then `compute_stats_snapshot(owner)` and read real statistics.

> Every new function ends with an explicit `revoke execute ... from anon, authenticated;` followed
> by a `grant execute` naming only the roles that genuinely need it.

### 7.2 A view can never call an owner function

`security_invoker = off` changes whose privileges are checked for *table* access inside a view. It
does **not** change which role's `EXECUTE` grant is checked for a *function* called in the view
body — that is always the querying role.

> Public views inline the owner lookup as a subquery against `auth.identities` /
> `private.app_config`. They never call `owner_id()` or `is_owner()`.
> (`authenticated` must keep `EXECUTE` on `is_owner()` — RLS policy expressions are evaluated as
> the querying role.)

### 7.3 NULL is not false

`is_owner()` returned SQL NULL before any GitHub identity had signed in, so
`if not is_owner() then raise` silently did not raise.

> Every PL/pgSQL guard uses `coalesce(is_owner(), false)`.

### 7.4 Per-table checklist

For each of the seven new tables:

- [ ] `alter table … enable row level security`
- [ ] Owner policies on select/insert/update/delete: `auth.uid() = owner_id and is_owner()`
- [ ] `revoke all on <table> from anon`
- [ ] `owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade`
- [ ] `set_updated_at` trigger where the table carries `updated_at`
- [ ] Verified with a **live** anon request and a **live** throwaway-user request — not by reading
      the migration

---

## 8. Phase 10 build order

| Step | Content | Depends on |
|---|---|---|
| 10.1 | `tracker_visibility`, `is_public` convention, public-view template | Part A applied |
| 10.2 | LFS: 3 tables, RLS, admin routes, public build-log view | 10.1 |
| 10.3 | `skills` + `entry_skills` + activity view + backfill from `techniques` | 10.1, Part A in use |
| 10.4 | `competitions` + `entries.competition_id` | 10.1 |
| 10.5 | `posts` + `post_sources` + `resources` | 10.1, 10.2 (sources reference LFS) |
| 10.6 | `reviews` + `time_rollup` view + review screen | all of the above |

10.2 first because LFS is the active work — the log is worthless if it starts after the build
does. 10.6 last because the rollup needs every `minutes_spent` column to exist.

## 9. Constraints carried forward

- Outbound 5432/6543 are blocked on this machine. All SQL goes through the Management API
  (`POST /v1/projects/{ref}/database/query`); migrations are recorded manually in
  `supabase_migrations.schema_migrations`.
- Skeleton-first UI (`EXECUTION-PLAN.md` §6) still applies — structure, not visual design.
- No AI attribution in commits, comments, or any repo-visible content.

## 10. Open questions

1. ~~**`difficulty_rank`** still lacks sign-off.~~ **Closed 2026-09-18** — signed off as a shared
   1–5 `rank` column with a verbatim `rank_label`, serving difficulty, confidence and rating.
   See `RECORD-MODEL.md` §1.1, decision 1.
2. **LFS `security_notes` → blog** — should an issue with security notes auto-create a `posts`
   row in `idea` status, or stay a manual promotion? Manual is assumed until decided.
3. **Competition ↔ CTFtime** — `ctftime_event_id` is reserved but CTFtime sync is not scoped.
   Phase 7 adapters could cover it; out of scope here.
