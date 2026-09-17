# Dashboard — Route + Component Spec

Screen-by-screen spec for `apps/dashboard`, written before any JSX exists (Phase 2+ builds
against this). Source: `MASTER-PLAN.md` section 3-4, `WORKER-A-PLAN.md` A0.3, and the Next
16.2.x docs findings in section "Next 16 findings" below. Table/column names reference
`MASTER-PLAN.md` section 4's data model — worker-b's generated types are the actual contract;
this spec names the shapes without inventing SQL.

No JSX or route code is written here — this stages only.

---

## Routes

### `(admin)/` → redirect to `/entries`

Plain redirect, no data, no UI. Auth-gated by the root layout (see Auth below), so this never
renders for a logged-out visitor.

### `(admin)/entries` — list

- **Purpose:** primary working view — every tracked challenge, filterable.
- **Reads:** `entries` table (own rows only, RLS-scoped via `owner_id = auth.uid()`), joined to
  `platforms` for name/icon/brand_color.
- **Auth:** required. Redirect to `/auth/login` if no session.
- **States:**
  - Loading: `DataTable` skeleton (row-shaped placeholders, not a spinner).
  - Empty (no entries at all): `EmptyState` with a CTA into `/entries/new` and `/import`.
  - Empty (filtered to zero): `EmptyState` with "clear filters" action, distinct copy from the
    true-empty case.
  - Error: inline error banner above the table, table area shows nothing, retry action.
- **Components:** `DataTable`, `FilterBar` (platform, category, status, difficulty rank, tag,
  free-text search), `DifficultyBadge`, `PlatformIcon`, bulk-action bar (appears when rows are
  selected — bulk status change, bulk delete via server action).
- **Interaction:** filter/sort state should be URL-driven (searchParams), not component state
  only — list state needs to survive a back-navigation from `/entries/[id]`.

### `(admin)/entries/new`

- **Purpose:** manual entry creation form.
- **Reads:** `platforms` (for the platform picker) and the `tag_usage` view (for tag
  autocomplete) — both from worker-b.
- **Auth:** required.
- **States:** form has no async load state beyond the two reads above (skeleton the platform
  picker and tag input until they resolve); submit states are idle/submitting/error, matching
  the `useContactForm` pattern already established in `apps/web` (field state + validation +
  submission state hook, not ad hoc `useState` scatter).
- **Components:** entry form (shared with `/entries/[id]` edit — see "shared form" note below),
  `TagInput`, `DifficultyBadge` (as a picker: platform's verbatim label input +
  `difficulty_rank` 1-5 selector, writing both fields per `MASTER-PLAN.md` section 4).
- **Mutation:** server action (create), not a route handler — see "Server Functions vs. Route
  Handlers" in Next 16 findings.

### `(admin)/entries/[id]`

- **Purpose:** view/edit one entry, including the private `notes` field.
- **Reads:** single `entries` row by id (RLS-enforced — a non-owner id 404s, not a leaked row).
- **Auth:** required.
- **States:** loading skeleton matching the form shape; not-found (id doesn't exist or isn't
  owned) renders the shared 404, not a generic error; error banner on save failure, form input
  preserved (same "don't reset user input on error" rule as the portfolio contact form).
- **Components:** same entry form as `/entries/new` (build once, pass `mode: "create" |
  "edit"` — do not fork into two components), plus a delete action with confirmation and
  optimistic-remove-with-rollback on the list when navigated back to.
- **Route, not modal (orchestrator decision):** `(admin)/entries/[id]` is a real, deep-linkable
  route, not a modal-over-`/entries`. It holds an editable form with unsaved state, and
  modal-over-list buys nothing on an admin surface. `useOverlayHistory` (the back-button-closes-
  modal hook `apps/web` uses for its project/certificate/experience overlays) is therefore not
  ported into the dashboard — see the note in `dashboard-globals.css`. It may earn its place in
  Phase 5's public view instead (a recruiter clicking a solved entry via overlay vs. navigation),
  left open for that phase to decide.

### `(admin)/stats` — KPI tiles + charts

- **Purpose:** the insights view (Phase 4 scope, but the route shell is part of this spec).
- **Reads:** SQL aggregate functions from worker-b — never `select *` + client reduction (hard
  rule from `WORKER-A-PLAN.md` Phase 4). Specifically: total solved, current streak, longest
  streak, this-month count, activity-over-time series, difficulty distribution, per-platform
  counts, tag frequency, category split.
- **Auth:** required.
- **States:** each chart/tile is an independent async boundary with its own skeleton (`StatTile`
  skeleton is a pulsing block matching tile dimensions) — one slow aggregate should not block the
  others from rendering. Empty state (zero entries): tiles show 0/—, charts show
  `EmptyState`-in-chart-area rather than an empty axes grid.
- **Components:** `StatTile` (×4+), chart components (Recharts, Phase 4) reading pre-aggregated
  rows only.
- **Color:** per `WORKER-A-PLAN.md` Phase 4 — monochrome, opacity/lightness ramps off
  `--color-accent`, semantic colors reserved for status only. No categorical hue palette.
- **Null `difficulty_rank` handling (worker-b constraint, confirmed 2026-09-03):** Codewars'
  completed-challenges endpoint doesn't return kyu rank per entry, and a per-challenge N+1 call
  against an API with an undocumented rate limit was rejected — so `difficulty_rank` is `null`
  for every Codewars entry today, and plausibly for other platforms/sources later (manual entries
  left blank, future adapters with the same gap). Every difficulty-distribution chart and any
  tile/aggregate that reads `difficulty_rank` **must** handle null rows explicitly:
  - Render them as their own visible **"unranked"** bucket in the difficulty distribution chart
    (not dropped silently, not folded into a bucket for rank 0 or rank 1 — a null is not a real
    difficulty level and must not read as one).
  - Any KPI tile or aggregate that would otherwise imply "all entries have a rank" (e.g. an
    average-difficulty figure) should show the unranked count alongside it or exclude unranked
    rows with a visible "N unranked" note — pick whichever reads better per-tile, but the count
    must be visible somewhere, never a silent drop.
  - This applies to `stats_by_difficulty` specifically, and to any other chart/tile in this
    route that groups or averages over `difficulty_rank`.

### `(admin)/import` — paste, parse, review, confirm

- **Purpose:** assisted import for ToS-restricted platforms (LeetCode/THM/HTB) —
  `platform-sync-research.md` established these can't be scraped.
- **Reads:** `platforms` (for the platform picker + `import_hint` guidance text shown per
  platform).
- **Auth:** required.
- **Flow/states:** four-step flow, not four routes — `paste → parsing → review → confirmed`:
  1. Paste raw text + pick platform.
  2. Parsing: calls the `parse-import` edge function (worker-b), loading state while it runs
     (this can take several seconds — LLM call — show progress copy, not a bare spinner).
  3. Review: editable table of parsed rows before insert — each row shows what will be created,
     lets the user fix a misparsed field or discard a row. This is not optional per
     `MASTER-PLAN.md` section 2 — "he reviews before insert" is the whole safety property of
     assisted import.
  4. Confirm: bulk insert via server action, writes to `import_batches` (status → `confirmed`)
     and `entries` (`source: "import"`).
  - Error at parse step: show raw model output alongside the error so the user can retry or
    manually fix, don't just say "parsing failed."
- **Components:** platform picker, textarea, review `DataTable` (editable cells, row-discard),
  confirm bar with row count.

### `(admin)/settings` — platform accounts, sync toggles

- **Purpose:** manage `platform_accounts` (handle, sync_enabled) and read-only visibility into
  `sync_runs` status ("last synced 3h ago" per the Phase 7 fail-soft UI rule). No LLM provider UI
  in v1 (orchestrator decision): the provider abstraction lives behind the `LLM_PROVIDER` env
  var, the model is pinned to `gemini-3.5-flash-lite`, and the Anthropic implementation is a
  stub — a picker for a single working provider is dead UI. Revisit if/when a second provider
  actually ships.
- **Reads:** `platform_accounts` joined to `platforms`, latest `sync_runs` per platform.
- **Auth:** required.
- **States:** per-platform row: connected/not-connected, sync toggle (disabled entirely for
  `sync_adapter = null` platforms — those are assisted-import-only and the UI should say so, not
  show a dead toggle), last-synced-at, last sync status badge.
- **Components:** settings list rows, toggle control, `credential_secret_name` is **never**
  rendered as a secret value — only its existence (connected/not) is shown, per
  `MASTER-PLAN.md`'s vault-secret-name-not-value column design.

### `(public)/` — employer-facing solved list

- **Purpose:** the artifact a recruiter actually opens (Phase 5, "highest design bar").
- **Reads:** `public_entries` view ONLY, via the `anon` key. Never the `entries` table, never a
  service-role client. `public_entries` has no `notes` column by construction — this route
  cannot leak private notes even via a bug, per `MASTER-PLAN.md` section 4's safe-by-construction
  design. Do not add a "debug" path that queries `entries` directly from this route group.
- **Auth:** none — genuinely public, no session check.
- **States:** loading skeleton, empty (no solved entries yet) with quiet copy (not "error"),
  standard content render.
- **SEO:** real metadata, OG tags, `sitemap.ts` — per Phase 5.
- **Components:** its own card/list components — likely distinct from the admin `DataTable`
  since this is a read-only, recruiter-facing, real-design-attention surface, not a data-entry
  tool. Do not reuse `DataTable` here just to save a component.

### `auth/login` — GitHub button + not-authorized state

- **Purpose:** entry point for GitHub OAuth PKCE.
- **Reads:** nothing (renders same regardless of state) except query params — a
  `?error=not_authorized` state (set by the callback route when a non-owner GitHub account signs
  in) shows an explicit "not authorized" message, not a silent redirect loop.
- **Auth:** must be reachable when logged out; if already authenticated, redirect straight to
  `/entries`.

### `auth/callback` — PKCE code exchange

- **Purpose:** exchanges the OAuth code for a session, then enforces the single-owner allowlist:
  compare the authenticated GitHub id against an env-configured owner id; anyone else gets signed
  out and redirected to `/auth/login?error=not_authorized`. Per `WORKER-A-PLAN.md` Phase 2: do
  not rely on RLS alone for this UI gate — this callback is the explicit check.
- **Not a page component** — this is a Route Handler (`route.ts`), since it must read the
  `code` query param and perform a redirect with cookies set, which is exactly the Route Handler
  use case (see Next 16 findings: Route Handlers vs. Server Functions).

---

## Shared components (build once, reuse)

- **`DataTable`** — used by `/entries` (list) and `/import` (review, editable variant). Needs a
  read-only mode and an editable-cell mode; don't fork into two components for that difference.
- **`FilterBar`** — platform/category/status/difficulty/tag/search. URL-searchParams-driven.
- **`TagInput`** — autocomplete against the `tag_usage` view (worker-b), free-entry for new tags.
- **`DifficultyBadge`** — display mode (colored dot + rank, tooltip shows the platform's verbatim
  label) and picker mode (used in the entry form).
- **`PlatformIcon`** — resolves `platforms.icon_kind` (`'react-icons' | 'local-image' |
  'initial'`, confirmed by worker-b 2026-09-03) + `icon_ref` the same way `TechIcon.tsx` resolves
  tech logos in `apps/web`: a static TS map keyed by the `icon_ref` string, never anything
  executable read from the DB (mirrors `portfolio-data-inventory.md` section 5). For
  `'react-icons'`, `icon_ref` is the react-icons/si export name (e.g. `SiHackthebox`,
  `SiCodewars`) resolved through the static map; for `'local-image'`, an asset URL; for
  `'initial'` — platforms with no matching icon (CTFtime, picoCTF, at minimum) — render a
  text/initial badge, same graceful-degradation fallback `TechIcon.tsx` already does for unknown
  keys. `brand_color` from the `platforms` row is applied inline, not from a CSS var (this is why
  `--brand-*` tokens are deliberately not ported into `dashboard-globals.css`).
- **`StatTile`** — KPI display, skeleton variant.
- **`EmptyState`** — parameterized by message + optional CTA; used across entries-list-empty,
  filtered-to-zero, stats-empty, public-view-empty. One component, different copy/props per call
  site — do not create `EntriesEmptyState`, `StatsEmptyState`, etc.
- **Skeletons per async surface:** table-row skeleton (`DataTable`), tile skeleton (`StatTile`),
  form-field skeleton (entry form's platform/tag async fields).

---

## Auth architecture (ties routes together)

`(admin)/*` routes are protected by a root layout check (session read via `src/lib/supabase/
server.ts`), not per-page checks scattered across every route file — one gate, not N. Proxy
(see below) handles token refresh only; it is not the authorization boundary by itself per Next's
own guidance (see Next 16 findings) — the layout-level session check plus RLS are the real gates.

---

## Next 16 findings (A0.4)

Read: `01-app/01-getting-started/16-proxy.md`, `01-app/03-api-reference/03-file-conventions/
proxy.md`, `01-app/03-api-reference/01-directives/use-server.md`,
`01-app/01-getting-started/15-route-handlers.md`, `01-app/01-getting-started/13-fonts.md`. No
dedicated `middleware.md` exists in this Next version's docs tree — that absence is itself the
finding below.

### `middleware.ts` is deprecated — the file is now `proxy.ts` (breaking, conflicts with Phase 2)

**This is the one that will bite Phase 2 if not caught now.** As of Next 16.0.0, "Middleware" is
renamed to "Proxy": the file convention is `proxy.ts` (project root or `src/`, same level as
`app/`), the exported function is `proxy` (not `middleware`), and `middleware.ts` is marked
deprecated in the docs (a codemod, `npx @next/codemod@canary middleware-to-proxy .`, exists to
migrate old projects). Functionality is otherwise the same — same `NextRequest`/`NextResponse`
API, same `matcher` config, same execution model, defaults to the Node.js runtime now (previously
Edge-only in older versions).

**Conflict with `WORKER-A-PLAN.md` Phase 2 and `MASTER-PLAN.md` section 3:** both name
`src/lib/supabase/middleware.ts` and "root `middleware.ts` for token refresh," and note
"`@supabase/auth-helpers` is deprecated, use `@supabase/ssr`." The `@supabase/ssr` docs' standard
pattern (as of any training-data-era version) is built around a root `middleware.ts` exporting
`middleware()` that calls `supabase.auth.getUser()` to refresh the session cookie. On Next 16.2.x
that file must be `proxy.ts` exporting `proxy()` instead — same body, renamed file and export.
This is a small mechanical change (rename `middleware` → `proxy` per the codemod) but it **will**
silently no-op if the root convention file is created as `middleware.ts` instead of `proxy.ts`,
since Next 16 does not read that filename the same way (the docs frame it as deprecated, not
confirmed-still-functional as an alias — do not assume backward-compat without testing).

**Scope, per orchestrator correction:** only the root Next.js convention file is renamed —
`src/proxy.ts` exporting `proxy()`. `src/lib/supabase/middleware.ts`, the ordinary (non-convention)
helper module that follows the upstream `@supabase/ssr` guide's naming, stays named
`middleware.ts` — renaming it would just diverge from the docs a future reader will follow for no
functional gain. `MASTER-PLAN.md` section 3 has been corrected to add `src/proxy.ts` to the tree
rather than rename the helper.

Two more details from `version-16.md` (lines ~625-650) worth carrying into Phase 2:
- Proxy always runs on the Node.js runtime — this is **not configurable**, Edge is explicitly
  unsupported. If any `@supabase/ssr` example snippet in the wild is copied with
  `export const runtime = 'edge'`, drop that line — it would error, and Node is the better fit
  here anyway (this is where the Supabase session cookie logic runs).
- `skipMiddlewareUrlNormalize` is renamed to `skipProxyUrlNormalize`. Not currently needed by this
  project, but if a future edge case calls for it, use the new name.

Also relevant to the single-owner-allowlist gate (Phase 2, `auth/callback`): the proxy docs
explicitly warn that Server Functions (`'use server'`, i.e. server actions) are **not separate
routes** in the proxy execution chain — they're POST requests to the page route they're called
from, so a proxy `matcher` that excludes a path also skips proxy for Server Functions called on
that path. The docs' own recommendation: "verify authentication and authorization inside each
Server Function rather than relying on Proxy alone." This reinforces (doesn't contradict) the
plan's existing rule of checking the owner-id allowlist at `auth/callback` and gating `(admin)/*`
at the layout level — proxy/token-refresh is necessary but not sufficient, consistent with what
WORKER-A-PLAN already says about not relying on RLS alone. No plan change needed here, just
confirms the layered-auth approach is the documented-correct one.

### Server Functions (`'use server'`) vs. Route Handlers — confirms the plan's choice

`use-server.md` confirms the pattern `WORKER-A-PLAN.md` Phase 3 already specifies (server actions
for entry CRUD, not route handlers): a `'use server'` file's exports are Server Functions,
callable directly from Client Components, auth-checked inside the function body (read from
cookies/headers, not passed as params — matches doing the session check via
`src/lib/supabase/server.ts` inside each action). Return values are serialized to the client — the
docs explicitly warn not to return raw DB records, only what the UI needs. Worth enforcing in
Phase 3: entry server actions should return typed, trimmed shapes, not the raw Supabase row.

Route Handlers remain the right (only) tool for `auth/callback`, since it needs `request.url`
query-param access and to set cookies via a redirect response — that's not a Server Function
shape. No conflict here, just confirms the split already implied by the route list above.

### Fonts — confirms `next/font/google` usage is fine, no Phase 2 change needed

Skimmed `13-fonts.md`; nothing in Next 16.2.x changes the `next/font/google` API the way
`apps/web` already uses it (`Geist`/`Geist_Mono`, `variable`, `preload: false`). Phase 2 point 2
("Fonts wired exactly as `apps/web/src/app/layout.tsx` does it") is fine as written — no
correction needed.

---

## Resolved by orchestrator, 2026-09-03

1. **Q:** Should `MASTER-PLAN.md`/`WORKER-A-PLAN.md` be corrected for the `middleware.ts` →
   `proxy.ts` rename now, and does the rename touch `src/lib/supabase/middleware.ts` too?
   **Decision:** yes, both plan docs corrected (root `src/proxy.ts` added to the
   `MASTER-PLAN.md` tree, `WORKER-A-PLAN.md` Phase 2 step 3 updated). Only the root Next.js
   convention file renames; `src/lib/supabase/middleware.ts` is an ordinary helper module, not a
   convention file, and keeps its name to match the upstream `@supabase/ssr` guide.
   **Reason:** renaming the helper would diverge from docs a future reader will follow, for no
   functional gain — the convention-file rename is the only one Next 16 actually requires.
2. **Q:** Is `(admin)/entries/[id]` a route or a modal-over-list, and does `useOverlayHistory`
   get ported? **Decision:** route, not modal; `useOverlayHistory` dropped from the A0.2 port
   (see `dashboard-globals.css`), revisit only for Phase 5's public view. **Reason:** the entry
   detail view is deep-linkable and holds an editable form's worth of unsaved state —
   modal-over-list buys nothing on an admin surface. A recruiter clicking a solved entry in the
   public view is a different case that Phase 5 can decide on its own.
3. **Q:** Does `(admin)/settings` need a user-facing LLM provider picker in v1? **Decision:** no
   — `/settings` is platform accounts + sync toggles only. **Reason:** the provider abstraction
   is env-var-driven (`LLM_PROVIDER`), Gemini is pinned, Anthropic is a stub — a picker for one
   working provider is dead UI. Revisit if a second provider ships.

No ambiguity found in A0.2's two "deliberate exclusion" calls (`--brand-*` tokens, navbar boot
sequence) — both are clearly reasoned in `WORKER-A-PLAN.md` and this spec/`dashboard-globals.css`
just carries them forward with the same reasoning restated inline so a future reader doesn't
"fix" them.
