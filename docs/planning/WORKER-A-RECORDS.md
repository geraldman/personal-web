# Worker-A Execution Plan — Record Model (Wave A′)

**Role:** dashboard frontend
**Owns (exclusive write access):** `apps/dashboard/src/**`
**Never writes:** `apps/dashboard/supabase/**` (worker-b), `apps/web/**`, `.env*` (orchestrator), repo root
**Spec — normative, do not redesign:** `RECORD-MODEL.md`
**Planned:** 2026-09-18 · Companions: `WORKER-B-RECORDS.md`, `EXECUTION-PLAN.md`

---

## 0. What changed, and why you are not blocked

`entries` becomes `records`, and every tracker — CTF, LFS, skills, competitions, blog pipeline,
resources, reviews — becomes a *kind*: a row in `record_kinds` declaring its own statuses, its own
fields (`field_schema`), and which features it switches on (`capabilities`). Adding a tenth kind
must require **no frontend code**. That is the whole point; if you find yourself writing
`if (kind === 'ctf')`, stop and reread §4.

Your Phases 3–5 work is not wasted — `EntryForm`, `DataTable`, `FilterBar`, `TagInput`,
`DifficultyBadge`, `PlatformIcon`, `StatTile`, `EmptyState` and the skeletons all survive. They
stop being called directly by routes and start being what the renderer renders.

**The rename blocks Track 2, not Track 1.** Track 1 is pure components against the `field_schema`
contract, testable with fixture kinds and no database at all. Start there today; worker-b's
B′.1–B′.3 land underneath you.

## 1. The contract

`database.types.ts` types `field_schema` as `Json`, which is useless to you. The real contract is
**`RECORD-MODEL.md` §5**, implemented on both sides:

| Side | Artifact | Owner |
|---|---|---|
| Frontend | `FieldDef` in `src/lib/types.ts` | **you** |
| Database | the `data` validation trigger | worker-b |

Field-type vocabulary, fixed: `text`, `textarea`, `markdown`, `code`, `number`, `date`, `bool`,
`url`, `select`, `multiselect`, `tags`, `keyvalue`. Plus `required` and `private` flags.

**Do not add a field type unilaterally.** Worker-b's trigger will reject data it does not know
about, and you will not find out until an insert fails at runtime. Changes go through the
orchestrator and update `RECORD-MODEL.md` §5 first.

`"private": true` means the field never reaches a public view. Worker-b strips it server-side —
you must **also** not render it on any public page. Two layers, as with `notes`.

---

## Track 1 — start now, no database dependency

### A′.1 — `src/lib/types.ts`: `FieldDef`, `Capability`, `RecordKind`

Hand-written, from spec §4 and §5. `Capability` is a union of the literal strings —
`'dates' | 'time' | 'platform' | 'rank:difficulty' | ... | 'children:${string}' | 'links:${string}'`
— so a typo is a compile error rather than a silently missing feature.

### A′.2 — `src/components/records/fields/` — one component per field type

Twelve small components with a single shared signature (`value`, `onChange`, `def`, `disabled`,
`error`). Reuse what exists: `tags` **is** `TagInput`; `select`/`multiselect` follow the existing
form controls; `keyvalue` is the only genuinely new widget.

Each renders its own label, `help` text and validation message. No field component knows what kind
it is inside.

### A′.3 — `RecordForm` — the renderer

Takes a `RecordKind` and an optional record; renders:
1. the shared spine (`title`, `status` from `kind.statuses`, plus whatever the capabilities add:
   `dates` → `started_on`/`completed_on`, `time` → `minutes_spent`, `platform` → platform picker,
   `rank:*` → `DifficultyBadge` input labelled per the capability, `tags` → `TagInput`,
   `public` → the `is_public` toggle);
2. then `kind.field_schema` in order, through A′.2.

Client-side validation mirrors the trigger: required present, declared keys only, types match.
**Mirror it; do not replace it.** The database is the boundary, this is the courtesy.

`status` options come from `kind.statuses` — never a hardcoded list. `rank` is one 1–5 control
whose *label* comes from the capability (`rank:difficulty` → "Difficulty", `rank:confidence` →
"Confidence", `rank:rating` → "Rating"), per decision 1.

### A′.4 — `RecordsTable` — generic list

Columns derived from capabilities + `field_schema`, not declared per kind. Reuses `DataTable`.
`FilterBar` filters on status (from `kind.statuses`), tags, platform and any `select` field.

### A′.5 — fixtures

A fixture file with the nine kinds from spec §6, so Track 1 is reviewable before worker-b's seed
exists. Delete it once A′.2 (theirs) lands — do not let it become a second source of truth.

---

## Gate A′1 → Track 2

Worker-b has published `records`, `record_kinds`, `record_links`, the seed and
`database.types.ts`. `npm run build` green from inside `apps/dashboard`.

---

## Track 2 — rewire the routes

### A′.6 — routes

`(admin)/records/[kind]/` (list), `[kind]/new`, `(admin)/records/[id]/` (detail). Keep `/entries`
as a redirect to `/records/ctf` — the auth redirect allow-list and your own muscle memory both
point at it.

Detail page grows, from capabilities only:
- `children:<slug>` → a child list plus an "add" button (LFS build → checkpoints → issues)
- `links:<rel>` → a relation picker writing `record_links`
- `writeup` → the existing "Generate writeup" button, writing `body`

### A′.7 — server actions

`src/lib/actions/records.ts`, generalising `entries.ts`. One create/update/delete path for every
kind. Never write `notes` or any `private` field into a component rendered on a public route.

### A′.8 — public view

`(public)/` reads **`public_records`** only — never `records`, never a `private` field, never
`notes`. Keep the existing `sitemap.ts` / `robots.ts` / OG metadata behaviour.

Note the kinds that are *not* public: `lfs_*` and `competition` (decision 6). Do not build public
routes for them. If a public page for them ever appears, it is a bug — the raw LFS log is private
source material and the public artifact is a `blog_post` linking back to it.

### A′.9 — charts from capabilities (decision 10)

A single `chartsForKind(capabilities)` helper. `dates` → activity, `rank:*` → distribution
(labelled per capability), `tags` → tag chart, `platform` → platform chart. Each calls the matching
`stats_*(owner, kind)` function.

**No chart reduces rows in the browser** — that rule is unchanged from Phase 4. If a chart needs a
shape SQL does not return, ask worker-b for a function; do not aggregate client-side.

---

## Track 3 — after Phase 8 deploy

- **A′.10 — assisted capture review UI** (decision 4). Paste terminal output → call `parse-import`
  → show the proposed checkpoint and issue rows **as an editable diff** → Gerald approves → insert.
  Nothing auto-inserts. A hallucinated package version must be easy to catch and impossible to
  commit accidentally.

  **Contract settled 2026-09-18** (orchestrator ruling on `RECORD-MODEL.md` §11 item 2). The
  function returns a batch, because one `make install` cascade is a single failure event that
  surfaces as several errors and one-at-a-time would mean re-pasting the same text per error:

  ```
  { kind, proposal: { checkpoint: {...}, issues: [ {...}, ... ] }, warnings[], usage{} }
  ```

  Three rules the UI must honour:
  - **Per-row accept/reject, nothing checked by default.** A batch makes bulk-accepting
    hallucinations easy; the default state is the defence.
  - **Render `source_excerpt` beside every proposed row.** Each proposal carries the verbatim span
    of pasted text it was derived from. Showing it is what turns a plausible invented root cause
    into an obviously unsupported one. It is a quote or it is empty — never paraphrase it.
  - **Surface `warnings[]` prominently**, including the truncation warning when more than 10
    issues were proposed.
- **A′.11 — review screen** (decision 8). Opens pre-filled from `review_prefill`: hours split by
  kind, records closed in the window, the window's `analyses` row attached. Gerald writes
  planned / done / adjustments, with a per-field "suggest" action that drafts text on demand.
  **Never auto-fill the prose** — a review he did not write is a review he did not think through.
- **A′.12 — kind editor** (decision 9). Create and edit kinds from the UI: `field_schema` builder,
  capability toggles, status vocabulary. This is what finally removes SQL from the loop.

---

## 2. Conventions — unchanged

- **Skeleton-first UI** (`EXECUTION-PLAN.md` §6). Structure, not visual design. Gerald refactors
  the UI of both apps later; polish now gets thrown away. The generic renderer is *structural*
  work and is exactly what that refactor will work through, so it is in scope.
- Monochrome tokens only — `var(--color-*)`, `.glass`, `.glow`. **No hex literals**, no per-screen
  colour decisions. `record_kinds.color` holds a token name, never a hex value.
- `npm` runs from inside `apps/dashboard` only. Dev server is port 3001 (`next dev -p 3001`) —
  the auth redirect list is configured for exactly that.
- **Never `git commit` / `git push`.** No AI attribution anywhere repo-visible.
- The machine runs out of RAM with both workers plus a dev server (~0.5 GB free of 13.9 GB). A
  route 500 with "Jest worker encountered 2 child process exceptions" is memory pressure, not a
  code defect — **confirm with `npm run build`, not the dev server.**

## 3. Reporting

`DONE | BLOCKED | QUESTION` · paths changed · how verified (`npm run build` output, routes
exercised) · open issues. Report immediately on a blocker or on anything that would change
`RECORD-MODEL.md`. Talk to worker-b directly only about the types and `field_schema` contract;
everything else goes through the orchestrator.
