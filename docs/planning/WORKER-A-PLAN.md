# Worker-A Execution Plan — Frontend

**Role:** dashboard frontend + the AGENTS.md correction
**Owns (exclusive write access):** `apps/dashboard/src/**`, `docs/planning/staging/agents-web.md`
**Never writes:** `apps/dashboard/supabase/**` (worker-b), `apps/web/**` (orchestrator, Phase 0), anything at repo root
**Reads freely:** everything — especially `docs/planning/design-system-audit.md`
**Planned:** 2026-09-03 · Companion: `MASTER-PLAN.md`

---

## 0. Why you are idle right now

Two gates you do not own:

- **Phase 0** (orchestrator) — `git mv` the live site into `apps/web/` and flip the Vercel Root
  Directory. Until that is deployed and verified, `apps/` does not exist and no tracker code may
  be written into it.
- **Phase 1** (worker-b, blocked on Gerald) — Supabase project + generated types. You build
  against that types file; it is the contract between you and worker-b.

**Neither gate blocks Track 0 below.** Do Track 0 now. It is real, reviewable output that lands
outside `apps/`, so a Phase 0 rollback cannot be muddied by it.

---

## Track 0 — Unblocked, start immediately

All output goes under `docs/planning/staging/`. Nothing enters `apps/` until Phase 0 is green.
*(Staging rather than writing straight into `apps/dashboard/` is my call, so Phase 0 and any
rollback stay a clean diff. Gerald can override.)*

### A0.1 — Draft the corrected AGENTS.md → `docs/planning/staging/agents-web.md`

This is Phase 0.5's payload, written early. Source it **entirely** from
`design-system-audit.md`, never from the current `AGENTS.md` — that file is the thing being
corrected, and it is imported into every session's context via the `@AGENTS.md` line in
`CLAUDE.md`, so it actively misleads until this lands.

Must document, verbatim from the audit:

| Topic | The truth |
|---|---|
| Palette | Monochrome. `--color-accent: #f2f2ee`, `--color-accent-secondary: #ffffff`, borders `rgba(255,255,255,0.14 / 0.34)`. No blue. No cyan. |
| `--brand-*` | ~30 tokens, one per tech logo, consumed by `src/lib/techIcons.tsx`. AGENTS.md does not mention this category at all. |
| Fonts | `next/font/google` — `Geist` + `Geist_Mono` in `src/app/layout.tsx`, `preload: false`. The `geist` npm package is a dependency but is **not** the font source. Delete the ban on `next/font/google`. |
| `@theme inline` | Exactly three tokens: `--font-sans`, `--font-mono`, `--breakpoint-xs: 480px`. No color tokens registered — components use `text-[var(--color-text-primary)]` arbitrary values. |
| Utilities | `.glass`, `.glow`, `.text-gradient`, `.overlay-scrollbar` (opt-in scrollbar, not a global base style). |
| Motion | Three real curves: `[0,0,0.2,1]` entrances, `[0.25,0.46,0.45,0.94]` hover/fade, `[0.22,1,0.36,1]` navbar capsule only. Hero entrance is **CSS keyframes**, not Framer. `staggerChildren` is used nowhere. |
| Navbar | 3-phase boot (loading, capsule, normal) that locks scroll on load. `useScrollNavbar(enabled)` threshold is **70px**, and it takes a param. Active pill is `AnimatePresence` opacity, **not** `layoutId`. |
| Hooks | `useOverlayHistory` exists and is undocumented — back button closes overlays via `pushState`/`popstate`. |
| Paths | `src/app/`, no route groups. Real component inventory from audit section 8. |
| Blog | MDX files in `src/content/blog/`, parsed by `src/lib/blog.ts`, `@next/mdx` + `mdx-components.tsx`. |

**Delete outright:** ReactBits hero background, the split `55fr_45fr` hero, the `geist`-package
import rules, the electric-blue palette, the fictional file tree, and the per-component
responsive table that contradicts the real grids (certificates are 1/2/3 columns, not 2/4-5).

Keep the parts that *are* true and worth keeping: 44px touch targets, mobile-first, no light
mode, `cn()` from `lib/utils`, Resend for contact, the "no lorem ipsum" rule.

**Acceptance:** every factual claim traceable to a line in `design-system-audit.md`. Zero claims
carried over from the old AGENTS.md unverified.

### A0.2 — Dashboard token sheet → `docs/planning/staging/dashboard-globals.css`

The design-token contract for `apps/dashboard`, ported from `apps/web/src/app/globals.css`.

- **Port:** the full `--color-*` block, `--max-width`, `--nav-height`, the
  `--font-body`/`--font-code` indirection, the `@theme inline` block, `@layer base`, and
  `.glass` / `.glow` / `.text-gradient` / `.overlay-scrollbar`.
- **Do not port** the ~30 `--brand-*` tokens. Platform brand colors live in the `platforms` table
  as a `brand_color` column (`MASTER-PLAN.md` section 4) and are applied inline from data.
  Duplicating them as CSS vars creates a second source of truth the CMS cannot edit.
- **Do not port** the navbar boot sequence or `NavbarLoader.module.css`. The dashboard is an
  authenticated app shell, not a marketing landing page — a scroll-locking boot animation on
  every admin page load is wrong. Say so in the file header so nobody "fixes" it later.
- **Do port** the `useOverlayHistory` pattern — entry detail views want back-button-closes-modal.

### A0.3 — Route + component spec → `docs/planning/staging/dashboard-ui-spec.md`

Screen by screen, before any JSX exists. For each route: purpose, the data it reads (name the
table or view), auth requirement, loading/empty/error states, and the components it needs.

```
(admin)/            -> redirect to /entries
(admin)/entries     -> list: filter/sort/search, bulk actions
(admin)/entries/new
(admin)/entries/[id]
(admin)/stats       -> KPI tiles + charts
(admin)/import      -> paste, parse, review table, confirm
(admin)/settings    -> platform accounts, sync toggles, LLM provider
(public)/           -> employer-facing solved list  [anon key, public_entries only]
auth/login          -> GitHub button + not-authorized state
auth/callback       -> PKCE code exchange
```

Name the shared components you will build once and reuse: `DataTable`, `FilterBar`, `TagInput`,
`DifficultyBadge`, `PlatformIcon`, `StatTile`, `EmptyState`, plus a skeleton per async surface.

### A0.4 — Read `node_modules/next/dist/docs/`

Root `CLAUDE.md` warns this Next.js has breaking changes vs. training data. Before writing any
App Router code in Phase 2, read the relevant guides for Next 16.2.x — route handlers, server
actions, middleware, `next/font`. Record anything that contradicts the Supabase `@supabase/ssr`
docs (which assume an older Next) in `dashboard-ui-spec.md`.

**Track 0 exit:** four staged files. Report to the orchestrator. Do not proceed past this
without confirmation that Phase 0 is green.

---

## Phase 0.5 — Land the AGENTS.md correction  *(after Phase 0 only)*

One move: `docs/planning/staging/agents-web.md` becomes `apps/web/AGENTS.md`. Reconcile against
the thin root `AGENTS.md` the orchestrator writes in Phase 0 so scope does not overlap. Then
delete the staged copy.

Sequencing matters: doing this *before* Phase 0 means editing a file the orchestrator is about
to `git mv` — a guaranteed conflict.

---

## Phase 2 — Scaffold + auth  *(needs Phase 0; needs worker-b's provisional types)*

1. `apps/dashboard` with an independent `package.json`, **no workspaces**. Match `apps/web`:
   Next 16.2.x, React 19.2.x, TS strict, Tailwind v4 via `@tailwindcss/postcss`.
2. `src/app/globals.css` from `staging/dashboard-globals.css`. Fonts wired exactly as
   `apps/web/src/app/layout.tsx` does it (`next/font/google`, `variable`, `preload: false`).
3. `src/lib/supabase/` — `client.ts`, `server.ts`, `middleware.ts` on `@supabase/ssr`
   (`@supabase/auth-helpers` is deprecated). Token refresh is mandatory, not optional: Server
   Components cannot write cookies.

   **Next 16 renames the convention file.** Verified in `node_modules/next/dist/docs/`
   (`01-app/01-getting-started/16-proxy.md`, `02-guides/upgrading/version-16.md:625-650`):

   - The root convention file is **`src/proxy.ts`**, exporting **`proxy()`**. Both the
     `middleware.ts` filename and the `middleware` named export are deprecated. Write it as
     `proxy.ts` from day one — do not write `middleware.ts` and run the codemod later.
   - **`src/lib/supabase/middleware.ts` keeps its name.** It is an ordinary helper module, not a
     Next convention file, and it is what the upstream `@supabase/ssr` guide calls it. Renaming
     it only diverges from the docs a future reader will follow. Only the root file is renamed.
   - **`proxy` runs on the `nodejs` runtime and that is not configurable — `edge` is not
     supported.** Any `@supabase/ssr` snippet carrying `export const runtime = 'edge'` must drop
     it. Node is the better fit for Supabase here anyway; just don't copy the edge line in.
   - Config flags renamed too: `skipMiddlewareUrlNormalize` is now `skipProxyUrlNormalize`.

   Per the proxy docs, Server Functions are not separate routes in the proxy matcher chain, so
   proxy alone cannot gate them. Auth is still checked in the layout and at `auth/callback`
   against the owner allowlist, exactly as step 4 says.
4. GitHub OAuth PKCE callback at `auth/callback`, with a **single-owner allowlist** — compare the
   authenticated GitHub id against an env-configured owner id and sign out anyone else behind an
   explicit "not authorized" screen. Do not rely on RLS alone for the UI gate.
5. App shell: sidebar nav, auth state, sign-out, 404 and error boundaries.

**Acceptance:** `npm run build` green; signing in as Gerald reaches `/entries`; any other GitHub
account is rejected at the callback; an unauthenticated hit on `(admin)/*` redirects to login.

---

## Phase 3 — Entry CRUD

List with filter (platform, category, status, difficulty rank, tag), sort, and search.
Create/edit/delete through **server actions**, not route handlers. Tag autocomplete from the
`tag_usage` view worker-b provides. The difficulty control writes both fields: the platform's
verbatim `difficulty` label *and* the normalized `difficulty_rank` 1-5.

> `difficulty_rank` was a planning-time call by the orchestrator, not something Gerald explicitly
> confirmed. Build it, but flag it in your Phase 3 report so he can veto before the Phase 4
> charts depend on it.

Skeletons on every async surface. Optimistic delete with rollback on failure.

---

## Phase 4 — Stats + charts

Recharts. KPI tiles: total solved, current streak, longest streak, this month. Charts: activity
over time, difficulty distribution, per-platform counts, tag frequency, category split.

**Hard rule:** every chart reads a SQL aggregate function from worker-b. Never `select *` and
reduce client-side — it breaks as soon as the entry count is non-trivial and it burns the
Supabase free-tier egress budget (5 GB/mo).

Chart color: the palette is monochrome. Use opacity and lightness ramps off `--color-accent`,
plus the three semantic colors (`--color-success`, `--color-warning`, `--color-danger`) for
status only. Do not introduce a categorical hue palette — it would be the only color on the site.

---

## Phase 5 — Public view  *(the employer-facing artifact — highest design bar)*

Read-only, `anon` key, **`public_entries` view only** — never the `entries` table. The view has
no `notes` column, so a mistake here cannot leak private notes. That is the whole point of the
design; do not work around it.

Real SEO metadata, OG tags, and a `sitemap.ts`. This is the page a recruiter actually opens, so
it gets the design attention the admin routes do not.

---

## Phase 9 — Portfolio CMS  *(separate effort, after the tracker ships)*

Admin CRUD for projects, certificates, experiences, tech items. Two known-hard parts, both
already documented in `portfolio-data-inventory.md`:

- **Icons** — `techIcons.tsx` stores live React component references; a component cannot become a
  column. Pattern: the DB stores `icon_kind` + `icon_ref`, code resolves it through a static
  registry. The existing `createImageIcon()` local-logo pattern already solves half of this.
- **Blog bodies** — MDX bodies stay as files. Only metadata moves to the DB.

`apps/web` fetches at build time; a revalidation webhook fires on publish.

---

## Standing rules

- **Never `git commit` or `git push`.** Gerald commits manually. Report, do not commit.
- No AI or Claude attribution in any repo-visible content — code, comments, or docs.
- Never write outside your owned paths. If you need something in worker-b's tree, ask through
  the orchestrator; do not edit it.
- `var(--color-*)` for every color. No hex literals in components.
- Verify design claims against `apps/web/src/app/globals.css`, **never** against AGENTS.md until
  Phase 0.5 has landed.
- Raise ambiguity to the orchestrator. Do not guess and proceed.
