# Record Model — user-definable entry kinds with composable capabilities

**Written:** 2026-09-18 · **Supersedes:** `TRACKER-EXPANSION-PLAN.md` §5 (the seven bespoke
tables) · **Extends:** `MASTER-PLAN.md` §4

---

## 1. The requirement

A new kind of thing to track — a log, a tracker, a progress series, something not yet imagined —
must not require a migration, a new table, a new form component and a new route. Creating a kind
should be a row, and that kind should pick up the features that already exist (tags, time,
difficulty, platform icons, LLM writeup, public toggle, charts) by switching them on.

The seven trackers in `TRACKER-EXPANSION-PLAN.md` then stop being seven schemas and become nine
seeded rows in one table.

### 1.1 Decisions locked (2026-09-18)

| # | Decision | Choice |
|---|---|---|
| 1 | `rank` scale | **1–5, one shared column**, with `rank_label` holding the source's verbatim words. Serves difficulty, confidence and rating. **This closes the long-open `difficulty_rank` question.** |
| 2 | Fate of `entries` | **Evolve in place** — `alter table entries rename to records`. RLS policies and grants survive the rename; stats functions and `public_entries` get edits, not rewrites |
| 3 | LFS depth | **Three levels** — `lfs_build` → `lfs_checkpoint` → `lfs_issue`. Errors are queryable rows, not a markdown blob |
| 4 | Assisted capture | **Yes** — extend `parse-import`: paste a terminal session, Gemini proposes a checkpoint plus one issue row per failure, reviewed before insert. Nothing auto-inserts |
| 5 | Form renderer | **Generic renderer first, before Phase 8 deploy.** No hand-rendered kind forms |
| 6 | Public-capable kinds | **`ctf`, `skill`, `resource`, `blog_post` only.** LFS and competitions are private — see §7.1 |
| 7 | Schema drift | **Validate on write only**, never retroactively. Existing rows are never invalidated by a later `field_schema` edit |
| 8 | Reviews | **Pre-filled hours + activity; Gerald writes the prose**, with on-demand LLM assist per field — never auto-filled |
| 9 | Kind editor | **After deploy.** Until then kinds are seeded by SQL via the Management API |
| 10 | Charts | **Derived from capabilities**, not configured per kind — see §9.1 |

Also applied, as the only sensible reading of the CTF requirement: `ctf` statuses become
`solved | in_progress | stuck | abandoned`. The existing `attempted` is dropped — it means the
same thing as `stuck`, and keeping both guarantees inconsistent logging.

## 2. The honest trade

This is worth naming before the design, because it is a real cost, not a formality.

| You gain | You pay |
|---|---|
| New kinds with no migration, no deploy | Kind-specific fields lose database `check` constraints — a trigger validates them instead |
| One CRUD screen, one form renderer, one table component for everything | A dynamic form renderer is the single largest new frontend piece in the project |
| Cross-kind queries for free ("everything I touched in October") | `stats_*` and the Phase 3/4/5 UI must be reworked to read `records` |
| One security surface to audit instead of eight | `jsonb` fields are less self-documenting than columns |

**The rewrite cost is the reason to do this now.** `entries` holds zero rows and the Phase 3/4/5
code is one wave old. The same change in three months means migrating a real logging history and
rewriting screens you have built habits around.

Decision 2 keeps that cost as low as it can go: `entries` is **altered and renamed**, not dropped
and recreated. Its RLS policies, grants, indexes and triggers follow the rename, so the security
surface audited in Waves 1–2 is amended rather than rebuilt from zero — the `is_owner()` policy
pattern, the `revoke all ... from anon` grant, and the `public_entries` owner-subquery inlining
all stay exactly as verified. Only the columns change.

If you would rather keep the shipped `entries` path intact, the fallback is
`TRACKER-EXPANSION-PLAN.md` §5 as originally written — seven purpose-built tables, no dynamic
kinds. That plan is still valid and is not deleted.

## 3. Shape

Three tables carry all seven trackers.

### 3.1 `record_kinds` — a "mode" is a row

```sql
record_kinds (
  id uuid pk,
  owner_id uuid not null default auth.uid() references auth.users on delete cascade,
  slug text not null, name text not null, plural_name text not null,
  icon text, color text,                  -- token name, never a hex literal
  statuses text[] not null,               -- this kind's own status vocabulary
  default_status text not null,
  done_statuses text[] not null,          -- subset of statuses meaning "finished"
  capabilities text[] not null default '{}',   -- §4
  field_schema jsonb not null default '[]',    -- §5
  is_system bool not null default false,       -- seeded kinds: editable, not deletable
  sort_order int not null default 0,
  created_at, updated_at
)
unique (owner_id, slug)
```

`statuses` per kind is the point: a CTF challenge is `solved | in_progress | stuck | abandoned`,
an LFS checkpoint is `pending | in_progress | done | blocked`, a blog post is
`idea | outlined | drafting | review | published | abandoned`. One hardcoded status enum could
never serve all three, and that is exactly the kind of hardcoding to remove.

**`done_statuses` was added during A′.4, not in the original design.** It became necessary the
moment stats stopped being CTF-only: every stats function had filtered on `status = 'solved'`, a
word that is meaningless for an `lfs_issue` (`resolved`, `workaround`) or a `blog_post`
(`published`). Each kind now declares which of its statuses mean finished, exactly as it already
declares its vocabulary, and the stats functions filter on that. Constrained to a subset of
`statuses`. Seeded values: ctf `{solved}`, lfs_build `{complete}`, lfs_checkpoint `{done}`,
lfs_issue `{resolved, workaround}`, skill `{comfortable, strong}`, competition `{complete}`,
blog_post `{published}`, resource `{using}`, review `{final}`.

### 3.2 `records` — one table, every log

The columns are the fields that genuinely recur across all seven trackers. Everything rarer lives
in `data`.

```sql
records (
  id uuid pk,
  owner_id uuid not null default auth.uid() references auth.users on delete cascade,
  kind_id uuid not null references record_kinds,
  parent_id uuid references records on delete cascade,   -- build → checkpoint → issue

  title text not null,
  slug text,
  status text not null,             -- validated against kind.statuses by trigger
  summary text,                     -- public-safe blurb
  body text,                        -- public-safe long form (writeup, post draft, how-to-use)
  notes text,                       -- PRIVATE. Never in a public view, never sent to the LLM

  url text,
  tags text[] not null default '{}',

  rank smallint check (rank between 1 and 5),
  rank_label text,                  -- the source's own words: "6 kyu", "Insane", "Chapter 5"

  platform_id uuid references platforms,
  started_on date, completed_on date,
  minutes_spent int check (minutes_spent >= 0),

  data jsonb not null default '{}',        -- kind-specific, per field_schema
  is_public bool not null default false,

  source text not null default 'manual',   -- manual | sync | import
  external_id text, synced_at timestamptz,
  sort_order int not null default 0,
  created_at, updated_at
)
unique (kind_id, platform_id, external_id) where external_id is not null
```

The dedupe key keeps `platform_id` rather than narrowing to `(kind_id, external_id)`: two sync
adapters can legitimately hand back the same numeric id for different challenges, and the
existing `entries_platform_external_id_key` already encodes that. `kind_id` is added so a future
non-platform kind with external ids cannot collide with a CTF row.

**One `rank` column, three meanings.** CTF difficulty, skill confidence and resource rating are
all "1–5 with a label". They share the column and the `DifficultyBadge` component; the capability
flag decides what it is called on screen. `rank_label` keeps the platform's verbatim string, as
`entries.difficulty` does today.

Indexes: `owner_id`, `kind_id`, `parent_id`, `status`, `completed_on`, `gin(tags)`, `gin(data)`.

### 3.3 `record_links` — every relationship

```sql
record_links (
  id uuid pk, owner_id uuid not null default auth.uid() references auth.users on delete cascade,
  from_id uuid not null references records on delete cascade,
  to_id   uuid not null references records on delete cascade,
  rel text not null,        -- source | skill | competition | resource | related
  note text,
  created_at
)
unique (from_id, to_id, rel)
```

This single table replaces `post_sources`, `entry_skills` and competition membership from the
previous plan. A blog post's sources, a challenge's key techniques, and the challenges solved
during a competition are all rows here with a different `rel`.

`parent_id` handles containment (an LFS issue belongs to exactly one checkpoint); `record_links`
handles association (a post draws on four unrelated things).

---

## 4. Capabilities — the feature switches

A capability is a string in `record_kinds.capabilities`. It turns on a column's UI, a component,
and a behaviour that already exists. Nothing new is invented per kind.

| Capability | Turns on |
|---|---|
| `dates` | `started_on` / `completed_on` fields, timeline and activity charts |
| `time` | `minutes_spent` field; the record counts toward the review hours rollup |
| `platform` | `platform_id` picker, `PlatformIcon` in tables and cards |
| `rank:difficulty` | `rank` + `rank_label` as difficulty, `DifficultyBadge`, difficulty charts |
| `rank:confidence` | same columns, labelled confidence — the skills matrix |
| `rank:rating` | same columns, labelled rating — the resource library |
| `tags` | `TagInput`, tag charts, tag filters |
| `writeup` | "Generate writeup" button → the deployed `generate-writeup` function, writing `body` |
| `analysis` | included in the weekly `analyze` window and `stats_snapshot` |
| `public` | the row may be published — `is_public` toggle appears at all |
| `children:<slug>` | this kind nests that kind; the detail page grows a child list + "add" button |
| `links:<rel>` | a relation picker for that `rel` on the detail page |
| `external` | sync/import fields (`source`, `external_id`, `synced_at`) and dedupe |
| `body:markdown` / `body:code` | how `body` is edited and rendered |

Adding a capability later is a string in an array — no schema change, no data migration.

## 5. `field_schema` — kind-specific fields

An ordered array of field definitions. The form renderer, the table column picker and the public
view all read it.

```json
[
  { "key": "ctf_category", "label": "Category", "type": "select", "required": true,
    "options": ["pwn","web","crypto","forensics","reversing","ai","osint","hardware","ppc","misc"] },
  { "key": "tools_used", "label": "Tools used", "type": "tags" },
  { "key": "security_notes", "label": "Security notes", "type": "markdown",
    "help": "Attack surface, privilege boundaries, what this step exposes" },
  { "key": "commands", "label": "Commands run", "type": "code" },
  { "key": "package_versions", "label": "Package versions", "type": "keyvalue" },
  { "key": "time_lost_minutes", "label": "Time lost", "type": "number", "private": true }
]
```

**Types map onto components that already exist or are trivial:** `text`, `textarea`, `markdown`,
`code`, `number`, `date`, `bool`, `url`, `select`, `multiselect`, `tags` (`TagInput`), `keyvalue`.

`"private": true` marks a field that never leaves the dashboard — enforced in the view, §7.

A trigger validates `data` on insert and update: every `required` key present, every key declared,
every value the declared type. That replaces per-kind check constraints. It is the price named in
§2 and it is the only integrity mechanism here that is weaker than the bespoke design.

**Known asymmetry, found 2026-09-18 by the workers' contract exchange:** `select` values are
validated against `options`; `multiselect` values are type-checked as an array but their elements
are **not** checked against `options`. Latent rather than live — none of the nine seeded kinds
uses `multiselect` today, and all seven `select` fields carry options and are enforced. Two
consequences for whoever adds the first `multiselect` field: tighten the trigger at the same time,
and do not let the client-side mirror over-validate `multiselect` in the meantime, or the form
will reject values the database would happily accept.

Also settled there: `date` is not special-cased server-side — it falls through to the string case,
so the client sends ISO date strings, not a jsonb date type. And an absent key and an explicit
null are treated identically for `required` (both fail), which matches the form stripping empty
values before submit.

---

## 6. The nine seeded kinds

All `is_system = true`. Each is a `record_kinds` row in the seed, not a table.

| slug | Covers | Key capabilities | `data` fields |
|---|---|---|---|
| `ctf` | CTF challenge log | `dates time platform rank:difficulty tags writeup analysis` **`public`** `external links:skill links:competition` | `ctf_category`, `tools_used` |
| `lfs_build` | An LFS run | `dates children:lfs_checkpoint` | `book_version`, `target_arch`, `host_distro` |
| `lfs_checkpoint` | Chapter / stage | `dates time tags analysis children:lfs_issue body:markdown assisted` | `chapter`, `stage`, `commands`, `config_choices`, `package_versions`, `security_notes` |
| `lfs_issue` | Error hit + fix | `time body:markdown links:skill assisted` | `symptom`, `root_cause`, `resolution`, `time_lost_minutes`, `references` |
| `skill` | Skills / topics | `rank:confidence tags` **`public`** `links:resource` | `area`, `last_practiced_override` |
| `competition` | Competitions | `dates platform links:skill` | `format`, `team_name`, `is_solo`, `placement`, `total_teams`, `points`, `retrospective` |
| `blog_post` | Content pipeline | `dates time tags` **`public`** `links:source body:markdown` | `mdx_path`, `target_publish_on` |
| `resource` | Resource library | `rank:rating tags` **`public`** | `kind`, `category` |
| `review` | Weekly / monthly | `dates analysis prefill` | `period`, `window_start`, `window_end`, `planned`, `done`, `adjustments` |

Two capabilities are added by the locked decisions: **`assisted`** (decision 4 — the kind accepts
pasted text for LLM-structured capture) and **`prefill`** (decision 8 — the kind's form opens
pre-populated from the time rollup and the window's records).

Every one of the seven requested trackers is in there, and a tenth kind — a reading log, a
home-lab machine inventory, a certification tracker — is a form you fill in, not a migration.

**`last_practiced` for skills stays derived**, as argued in `TRACKER-EXPANSION-PLAN.md` §5.2: a
view takes `greatest(max(completed_on) over records linked by rel='skill', override)`. A
hand-typed date is stale in a month and then actively misleading.

---

## 7. Visibility

Unchanged in principle from `TRACKER-EXPANSION-PLAN.md` §6 — two gates — but now generic:

1. **Per row:** `records.is_public`, default `false`.
2. **Per kind:** `record_kinds.capabilities` contains `public`. Remove it and the whole kind goes
   dark regardless of row toggles. This replaces the `tracker_visibility` table.

### 7.1 The LFS log is private source material

Decision 6 gives `public` to `ctf`, `skill`, `resource` and `blog_post` — **not** to the three LFS
kinds or to `competition`. That is a coherent split rather than a cautious one: the raw build log
holds verbatim error output, half-formed reasoning and security notes about a system you are
still building, while the *public* artifact drawn from it is a `blog_post` that links back to
those records with `rel = 'source'`. The log feeds the post; it is not itself the post.

Flipping any of them public later is one string added to the kind's `capabilities` array — no
migration, and every row still defaults to `is_public = false`, so nothing publishes by surprise.

`competition.retrospective` stays marked `"private": true` in `field_schema` regardless, so it
would be stripped by the view even if the kind were made public.

`public_records` is the one public view, and it strips private `data` keys at the view layer
rather than trusting the UI:

```sql
create view public_records with (security_invoker = off) as
select r.id, r.kind_id, k.slug as kind, r.title, r.slug, r.summary, r.body,
       r.url, r.tags, r.rank, r.rank_label, r.platform_id,
       r.started_on, r.completed_on, r.parent_id,
       r.data - coalesce(
         (select array_agg(f->>'key')
            from jsonb_array_elements(k.field_schema) f
           where (f->>'private')::bool),
         '{}'::text[]
       ) as data
from records r join record_kinds k on k.id = r.kind_id
where r.is_public
  and 'public' = any(k.capabilities)
  and r.owner_id = ( <inlined owner subquery — see §8.2> );
```

`notes`, `minutes_spent` and every `private` field are absent from the select list, not filtered
by a `where`. Absent cannot leak.

`public_entries` is kept as a thin compatibility view over `public_records where kind = 'ctf'`, so
the portfolio page and its verified anon grants do not need re-auditing from scratch.

## 8. Security spine

The three holes found in Waves 1–2 generalise identically here, and the generic model makes each
rule easier to honour because there is one view and one table to get right instead of eight.

### 8.1 Default function grants leak to `anon`
Supabase grants `EXECUTE` on new `public` functions to `anon`/`authenticated` by default, and
`revoke ... from public` does not remove it.
> Every new function ends with an explicit `revoke execute ... from anon, authenticated`, then a
> `grant execute` naming only the roles that need it.

### 8.2 A view can never call an owner function
`security_invoker = off` governs *table* access inside a view, not which role's `EXECUTE` grant is
checked for a *function* in the view body — that is always the querying role.
> `public_records` inlines the owner lookup as a subquery against `auth.identities` /
> `private.app_config`. It never calls `owner_id()` or `is_owner()`.

### 8.3 NULL is not false
> Every PL/pgSQL guard uses `coalesce(is_owner(), false)`.

### 8.4 Checklist for the three new tables
- [ ] RLS enabled; owner policies `auth.uid() = owner_id and is_owner()` on all four verbs
- [ ] `revoke all on records, record_kinds, record_links from anon`
- [ ] `set_updated_at` trigger on `records` and `record_kinds`
- [ ] Verified with a live anon request and a live throwaway-user request, not by reading SQL
- [ ] `public_records` returns no `notes` key and no `private` field key — checked in the network
      payload, per Gate 3

---

## 9. Build order

Part A of `TRACKER-EXPANSION-PLAN.md` is replaced by A′: build the spine while `entries` is empty.

| Step | Content | Notes |
|---|---|---|
| **A′.1** | `alter table entries` → `records`; add `record_kinds`, `record_links`, RLS, validation trigger | **Applied 2026-09-18.** Zero rows migrated; policies/grants survived the rename |
| **A′.2** | Seed the nine system kinds | **Applied 2026-09-18.** One seed file, no code |
| **A′.3** | `public_records` + `public_entries` compatibility view | **Applied 2026-09-18.** Gate B′ passed 17/17 anon probes |
| **A′.4** | `stats_*` take a `kind` argument and read `records` | **Applied 2026-09-18.** Added `done_statuses`; `compute_stats_snapshot` verified working |
| **A′.5** | Dynamic form renderer + generic `RecordsTable` from `field_schema` | In progress — worker-a |
| **A′.6** | Extend `parse-import` for assisted capture (decision 4) | worker-b. Reuses the deployed Gemini provider |
| **A′.7** | `time_rollup` view + review pre-fill (decision 8) | worker-b. Needs every `minutes_spent` path in place |

**Before Phase 8 deploy:** A′.1 through A′.5. Decision 5 puts the generic renderer on the
critical path — hand-rendering CTF and LFS forms to start logging sooner would build exactly the
hardcoding this model exists to remove, and then throw it away.

**After Phase 8 deploy:** A′.6, A′.7, and the kind editor (decision 9). Until the editor exists,
a new kind is an `insert into record_kinds` through the Management API — a workflow already
proven across 16 migrations.

The open risk in this ordering: your LFS build may start before A′.5 lands. If it does, log
checkpoints as plain rows via the API and let A′.6 backfill the structure from your terminal
history — that is precisely what assisted capture is for.

### 9.1 Charts derive from capabilities

Decision 10: no per-kind chart configuration. The stats screen reads the kind's capabilities and
renders what they imply.

| Capability present | Chart shown | Backing function |
|---|---|---|
| `dates` | Activity over time | `stats_activity(owner, kind)` |
| `rank:difficulty` / `rank:confidence` / `rank:rating` | Distribution across 1–5, labelled per capability | `stats_by_rank(owner, kind)` |
| `tags` | Top tags | `stats_by_tag(owner, kind, limit)` |
| `platform` | Breakdown by platform | `stats_by_platform(owner, kind)` |

A tenth kind gets sensible charts the moment a capability is switched on, with no chart code and
no configuration.

The existing `entries.category` (`swe | cyber`) is **not** the CTF taxonomy and the two must not
be merged. It becomes `data->>'discipline'` on the `ctf` kind, and `stats_by_category` is
retargeted to read it so the shipped Phase 4 chart keeps working unchanged. A separate
`stats_by_ctf_category` reads `data->>'ctf_category'` for the pwn/web/crypto split.

### 9.2 Validation is write-only

Decision 7: the `data` trigger fires on insert and update only. A later `field_schema` edit never
invalidates, rewrites or deletes an existing row — keys that no longer appear in the schema render
as read-only extras on the record's detail page rather than vanishing. The cost, accepted
knowingly, is that `data` drifts from `field_schema` over time; the alternative was blocking
routine schema edits until you migrate old rows, which would make you avoid editing schemas at all.

## 10. What this does to the existing plan

- `TRACKER-EXPANSION-PLAN.md` §4 (extend `entries`) → replaced by A′.1. Same urgency, same
  zero-row window, wider scope.
- `TRACKER-EXPANSION-PLAN.md` §5 (seven tables) → replaced by §6 here (nine seeded rows).
- `TRACKER-EXPANSION-PLAN.md` §6 (`tracker_visibility`) → replaced by the `public` capability.
- `TRACKER-EXPANSION-PLAN.md` §7–§9 (security spine, sequencing, constraints) → still apply
  verbatim.
- Phase 7 (sync) is unaffected: adapters write `records` with `kind = 'ctf'`, `source = 'sync'`,
  and the dedupe index moves from `(platform_id, external_id)` to `(kind_id, external_id)`.
- Phase 8 (deploy) is unaffected and still not blocked by any of this.

## 11. Open questions

The ten questions that shaped this document were settled on 2026-09-18 and are recorded in §1.1 —
including `difficulty_rank`, which had been open since Wave 2 and is now closed as decision 1.

What remains genuinely undecided:

1. **`skill.area` taxonomy.** A free-text field, or a fixed list (`binary-exploitation`, `web`,
   `crypto`, `linux-internals`, `ai-security`, `forensics`, `netsec`)? Free text drifts, exactly as
   `tags` does; a fixed list is one more thing to maintain. Decide at A′.2, low stakes either way
   since the kind editor can change it later.
2. **Assisted capture scope for `lfs_issue`.** Should one pasted terminal session be allowed to
   create several issue rows in a single reviewed batch, or one at a time? Batch is more useful and
   more to get right in the review UI. Decide at A′.6.
3. **Does a `blog_post` reaching `published` flip its sources public?** An LFS checkpoint cited by
   a published post is arguably already public by reference. Current answer is no — §7.1 keeps the
   log private and the post is the artifact — but it is worth revisiting once posts exist.
