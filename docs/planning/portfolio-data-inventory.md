# Portfolio Data Inventory — Current State and Postgres Mapping

Audited 2026-09-02. Source files read in full: `src/data/projects.ts`,
`src/data/certificates.ts`, `src/data/experiences.ts`, `src/data/techItems.ts`,
`src/types/index.ts`, `src/lib/blog.ts`, `src/lib/techIcons.tsx`, `src/lib/constants.ts`,
`src/content/blog/*.md` (both files present), plus every consumer found via `grep` across
`src/components/` and `src/app/`.

---

## 1. `ProjectData` (`src/data/projects.ts`)

### Interface (`src/types/index.ts:1-21`)

```ts
export type ProjectCategory = "web-development" | "security" | "ctf";
export type ProjectStatus = "live" | "in-progress" | "archived";

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  stack: string[];
  previewImage?: string;
  previewImages?: string[];
  previewGif?: string;
  previewVideo?: string;
  featured?: boolean;
  githubUrl?: string;
  liveUrl?: string;
  writeupUrl?: string;
  devpostUrl?: string;
}
```

### Row count: 7 active entries (`WHISPXR`, `assetra`, `ctf-lab-notes`, `panen-pas`, `bebas-qc`,
`crowdflow`, `project-guardian`). One additional entry (`auth-attack-simulator`) exists but is
commented out in the source — not live data.

### Field-by-field

| Field | Type | Required | Shape | Notes |
|---|---|---|---|---|
| `id` | string | yes | scalar | Used as both a stable key and as the URL slug placeholder (no dedicated slug field) |
| `title` | string | yes | scalar | |
| `description` | string | yes | scalar (long text) | Multi-paragraph prose, up to ~500 words per project; contains literal newlines and markdown-adjacent characters (emoji, `**bold**`-looking text is NOT rendered as markdown — it's shown raw via `whitespace-pre-line`, see `ProjectCard.tsx:121`, `ProjectDetailsOverlay.tsx:206`) |
| `category` | enum `ProjectCategory` | yes | scalar enum | 3 values |
| `status` | enum `ProjectStatus` | yes | scalar enum | 3 values |
| `stack` | `string[]` | yes | array of **code references** | See "hard fields" below |
| `previewImage` | string (path) | no | scalar | Single hero image path |
| `previewImages` | `string[]` | no | array of scalars | Carousel; `ProjectCard` uses `previewImage ?? previewImages?.[0]` as the card thumbnail, `ProjectDetailsOverlay` renders all of them as a clickable filmstrip |
| `previewGif` | string (path) | no | scalar | Hover-preview only shown if `previewVideo` is absent |
| `previewVideo` | string (path) | no | scalar | Hover-to-play `<video>` source, takes priority over gif |
| `featured` | boolean | no | scalar | Drives `ProjectsPreviewSection`'s home-page selection (`.filter(p => p.featured).slice(0,3)`) |
| `githubUrl` | string (URL) | no | scalar | |
| `liveUrl` | string (URL) | no | scalar | |
| `writeupUrl` | string (URL, sometimes internal e.g. `/blog`) | no | scalar | |
| `devpostUrl` | string (URL) | no | scalar | |

### Hard fields (code references, not data)

- **`stack: string[]`** — each string is a **lookup key into `lib/techIcons.tsx`**
  (`Record<string, TechIconConfig>`, where `TechIconConfig = { icon: IconType, label: string,
  color: string }`). `icon` is a **React component reference** (an imported `react-icons`
  component or a locally-defined `createImageIcon(...)` wrapper) — this cannot be stored as data
  without a lookup layer surviving in code. See section 5.
  - `TechIcon.tsx:8` does `techIcons[name.toLowerCase()]` — lookup is case-insensitive and falls
    back to a plain text badge if the key is missing, so an unrecognized stack string degrades
    gracefully rather than erroring.
  - `techItems.ts`'s `matchKeys` field (section 4) cross-references `stack` values from the
    opposite direction (skills marquee → related projects), meaning stack strings are also an
    implicit foreign key into the skills/tech taxonomy, not just an icon lookup.

## 2. `CertificateData` (`src/data/certificates.ts`)

### Interface (`src/types/index.ts:23-38`)

```ts
export type CertificateCategory = "web" | "security" | "community";
export type CertificateStatus = "completed" | "in-progress" | "planned";

export interface CertificateData {
  id: string;
  title: string;
  issuer: string;
  category: CertificateCategory;
  status: CertificateStatus;
  summary: string;
  date: string;
  previewImage?: string;
  credentialUrl?: string;
  badgeUrl?: string;
}
```

### Row count: 2 (`cert-slot-1`, `cert-slot-2`).

### Field-by-field

| Field | Type | Required | Shape | Notes |
|---|---|---|---|---|
| `id` | string | yes | scalar | |
| `title` | string | yes | scalar | |
| `issuer` | string | yes | scalar | Free text, e.g. `"Issued by BNSP"` — not normalized to a separate issuer entity |
| `category` | enum `CertificateCategory` | yes | scalar enum | **Distinct enum from `ProjectCategory`** — `web`/`security`/`community`, not `web-development`/`security`/`ctf` |
| `status` | enum `CertificateStatus` | yes | scalar enum | |
| `summary` | string | yes | scalar (long text) | |
| `date` | string | yes | scalar | Free-text, currently just a year (`"2025"`), not an ISO date — cannot assume `date` type without reformatting |
| `previewImage` | string (path) | no | scalar | |
| `credentialUrl` | string (URL) | no | scalar | |
| `badgeUrl` | string (URL) | no | scalar | **Declared in the type but never populated in current data and never read by any component** — dead field |

No hard/code-reference fields here — fully data-shaped already.

**Drift note relevant to migration**: `app/certificates/page.tsx:14-18` declares its own inline
`CATEGORY_LABELS: Record<CertificateCategory, string>` map, separate from
`lib/constants.ts`'s `CATEGORY_LABELS` (which is keyed by `ProjectCategory`, not
`CertificateCategory`, despite the identical name). A CMS should unify or clearly namespace
these two "category label" concepts.

## 3. `TimelineItem` (`src/data/experiences.ts`)

### Interface (`src/types/index.ts:72-78`)

```ts
export interface TimelineItem {
  id: string;
  title: string;
  org: string;
  period: string;
  highlights: string[];
}
```

### Row count: 4 (`google-sa`, `cs-sp`, `cs-hcktn`, `pufa-hod`).

### Field-by-field

| Field | Type | Required | Shape | Notes |
|---|---|---|---|---|
| `id` | string | yes | scalar | |
| `title` | string | yes | scalar | |
| `org` | string | yes | scalar | |
| `period` | string | yes | scalar | Free text, e.g. `"2026 - Present"` — not two structured date fields |
| `highlights` | `string[]` | yes | array of scalars | 2 items per entry currently; `DetailedAboutSection.tsx:111` only ever shows the first 2 in the timeline card (`slice(0, 2)`), full list shown in `ExperienceDetailsOverlay` |

No hard fields. Fully data-shaped.

## 4. `techItems.ts` (skills marquee + security values)

### No dedicated TypeScript interface — inferred inline as:

```ts
type TechItem = {
  key: string;
  label: string;
  badge?: string;
  matchKeys?: string[];
};
```

Not declared in `src/types/index.ts` at all — this is the one data source with no formal type,
just an untyped array literal.

### Row count: 29 tech items in `techItems`, 3 strings in `securityValues`.

### Field-by-field (`techItems`)

| Field | Type | Required | Shape | Notes |
|---|---|---|---|---|
| `key` | string | yes | scalar, **code reference** | Must match a `techIcons.tsx` key to render an icon; also the default match key against `project.stack` |
| `label` | string | yes | scalar | Display name |
| `badge` | string | no | scalar | Shown instead of `label` inside the icon slot when no icon is mapped for a *different-but-related* key — currently only used by the `sql` entry (`badge: "SQL"`) as a fallback marker, and `wazuh` (`badge: "WZ"`) which has no `techIcons` entry at all |
| `matchKeys` | `string[]` | no | array, **code reference** | Overrides which `project.stack` values count as "uses this tech" for the hover tooltip's related-projects list — e.g. the `sql` item matches projects whose stack contains `mysql`, `postgres`, or `postgresql` |

`securityValues: string[]` — 3 plain strings, no structure, rendered as a bullet list in
`SkillsSection`'s sidebar aside only (not present on `/about`'s `LongSkillSection`, per the
design-system-audit's drift note #18 about the two marquee components differing).

### Hard fields

- `key` is a code reference into `techIcons.tsx` (same mechanism as `ProjectData.stack`).
- `matchKeys` is a code reference back into `ProjectData.stack` strings — a bidirectional,
  implicit relationship between two otherwise-separate data files, computed at render time in
  both `SkillsSection.tsx:46-48` and `LongSkillSection.tsx:46-48` (`projects.filter(p =>
  matchKeys.some(k => p.stack.includes(k)))`), not stored anywhere.

## 5. `lib/techIcons.tsx` — the hard case

### Shape

```ts
export type TechIconConfig = { icon: IconType; label: string; color: string };
export const techIcons: Record<string, TechIconConfig>;
```

### Row count: 33 keys.

### Why this cannot cleanly move to Postgres

- `icon` is a **React component value** — for 30 of the 33 entries it's a direct import from
  `react-icons/si` / `react-icons/fa` / `react-icons/fi` (e.g. `SiPostgresql`, `SiReact`,
  `FaJava`); for 3 entries (`python-telegram-bot`, `psycopg`, `midtrans`, `redpanda` — actually
  4) it's a locally-defined `createImageIcon(src, alt)` factory that returns a component
  rendering a local `<img>` from `/public/assets/icons/*`.
- `color` is **mostly** a `var(--brand-*)` CSS custom-property reference (a string, storable as
  data) but for the four `createImageIcon` entries it's a **literal hex string**
  (`"#26A5E4"`, `"#336791"`, `"#0BADDC"`) not tied to any `--brand-*` token — inconsistent
  storage even within the same file today.
- `label` is plain text — the only field that's cleanly "data" as-is.

If this moves to a DB-backed CMS, the realistic split is:
- `label` and `color` (as a string — either a hex value or a `var(--brand-*)` name to resolve
  client-side) become real columns/JSONB fields.
- `icon` must stay **code-resident**: either (a) store an `icon_kind: "react-icons" |
  "local-image"` + `icon_ref` (e.g. `"SiPostgresql"` or an asset URL) and keep a static
  TypeScript lookup table mapping `icon_ref` strings to the actual `react-icons` component for
  the `"react-icons"` case, or (b) migrate every icon to the `"local-image"` (asset URL) shape
  and drop `react-icons` entirely for CMS-managed tech logos. Either way, a raw "icon" column of
  arbitrary React code is not a legitimate DB column — this is the single hardest field in the
  entire data layer to move.

## 6. `BlogPost` and the MDX/blog pipeline (`src/lib/blog.ts`, `src/content/blog/*.md`)

### Interface (`src/types/index.ts:40-51`)

```ts
export type BlogCategory = "security" | "ctf" | "template";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: BlogCategory;
  readTime: string;
  tags?: string[];
  toc?: Array<{ id: string; label: string }>;
}
```

### Row count: 2 files in `src/content/blog/`: `digital-forensic-writeup.md`,
`writeup-template.md`. **There is no `/data/blog.ts` array** — AGENTS.md's documented data
source for blog posts does not exist (see design-system-audit drift #19).

### How posts are discovered and parsed (`src/lib/blog.ts`)

1. `loadPosts()` (wrapped in React's `cache()`) reads every `.md` file in
   `src/content/blog/` via `fs.readdir`.
2. **Frontmatter is not YAML** — it's a JSON object embedded inside an HTML comment at the top of
   the file: `<!-- meta { ...json... } -->`, matched by `META_REGEX =
   /^<!--\s*meta\s*([\s\S]*?)\s*-->/` and parsed with `JSON.parse`. Required keys enforced at
   parse time: `title`, `excerpt`, `date`, `category`, `readTime`; `category` is further
   validated against the `BlogCategory` union via `isBlogCategory()`. A post missing any of these
   throws and is dropped (caught via `Promise.allSettled`, logged, excluded from the list — the
   whole site doesn't fail if one post is malformed).
3. `toc` (table of contents) is **derived, not authored** — extracted by regex from the post body
   itself, either from `<a id="...">` + adjacent `## heading` pairs (`H2_ANCHOR_REGEX`) or from
   literal `<h2 id="...">text</h2>` tags (`H2_REGEX`), whichever pattern the file uses. Neither
   sample post is checked here in full, but `digital-forensic-writeup.md`'s visible header block
   uses `<a id="...">` + `### heading` (h3, not h2) for its numbered sub-sections and a manually
   written `## Table of Contents` list — meaning the *displayed* TOC sidebar and the post's own
   inline "Table of Contents" section are two independently-maintained things today.
4. Posts are sorted by `date` string descending (`b.date.localeCompare(a.date)`) — relies on
   ISO-format (`YYYY-MM-DD`) date strings for correct ordering; not enforced by validation beyond
   presence.

### Where body content lives — this is the key finding

**Post BODY content is the Markdown file itself, rendered as a compiled MDX component**, not a
field in any data structure. `src/app/blog/[slug]/page.tsx:16-21`:

```ts
async function loadPostModule(slug: string) {
  return import(/* webpackInclude: /\.md$/ */ `@/content/blog/${slug}.md`);
}
```

This dynamically imports the raw `.md` file as a **Next.js MDX-compiled React component module**
(Next's MDX loader turns `.md`/`.mdx` files into components), then renders `<Content />` inside
the article shell. `src/mdx-components.tsx` supplies the `useMDXComponents()` override map (h1–h3,
p, ul/ol/li, a, blockquote, pre, code, hr — all styled with the site's `var(--color-*)` tokens)
that Next's MDX pipeline picks up automatically for every rendered `.md`/`.mdx` file.

**Implication for migration**: frontmatter (title/excerpt/date/category/readTime/tags) is cleanly
tabular. The post body is markdown *source* that today compiles at build/request time into a
live React component — moving it to a DB `content` text column is fine for storage, but the
render path must still run it through an MDX/markdown-to-React pipeline at read time (e.g.
`next-mdx-remote` or a markdown renderer), since the current mechanism (Next's static file-based
MDX compiler) requires the content to exist as a file at build time and cannot compile
arbitrary DB-sourced markdown the same way. The TOC-extraction regexes would also need to run
against DB content instead of file content, or be replaced with authored TOC data.

## 7. `StatTickerItem` (partially data, partially live-fetched — `lib/constants.ts`)

### Interface (`src/types/index.ts:63-70`)

```ts
export type StatTickerIcon = "projects" | "years" | "commits" | "certificates";

export interface StatTickerItem {
  id: string;
  value: string;
  description: string;
  icon: StatTickerIcon;
}
```

Not stored as a data array at all — built at request time by `getStatTicker()`
(`lib/constants.ts:42-71`), an async function `AboutSection.tsx` (a server component) awaits
directly. Three of four values are hardcoded in `STATIC_STATS` (`projects: "7+"`, `years: 2`,
`certificates: "99%"` — the "certificates" stat is actually mislabeled as an uptime percentage,
not a certificate count); the fourth (`commits`) is a **live external API call** —
`fetchGithubCommit()` in `lib/github-commit-fetch.ts` hits the GitHub REST API for every repo
under the `geraldman` user, sums per-repo commit counts (via `Link` header pagination parsing),
cached for 24h via `unstable_cache`. `icon` maps to a hardcoded `STAT_ICON_MAP` of `react-icons`
components in `AboutSection.tsx:11-16` — another icon-as-code-reference field, structurally
identical to the `techIcons` problem in section 5 but with only 4 fixed keys.

`ContactSection.tsx` separately reads `STATIC_STATS.projects`/`STATIC_STATS.years` directly
(not through `getStatTicker()`), so the "7+ projects" stat is duplicated across two render paths
that would both need to point at the same source post-migration.

## 8. Consumer list — every import from `src/data/*` or `src/lib/blog.ts`

| Consumer | Imports | file:line |
|---|---|---|
| `components/sections/ProjectsPreviewSection.tsx` | `projects` from `data/projects` | `ProjectsPreviewSection.tsx:11` |
| `components/sections/ProjectsGrid.tsx` | `projects` from `data/projects` | `ProjectsGrid.tsx:8` |
| `components/sections/SkillsSection.tsx` | `projects` from `data/projects`, `techItems`/`securityValues` from `data/techItems` | `SkillsSection.tsx:5,10` |
| `components/sections/LongSkillSection.tsx` | `projects` from `data/projects`, `techItems`/`securityValues` from `data/techItems` | `LongSkillSection.tsx:5,10` |
| `components/sections/CertificatesSection.tsx` | `certificates` from `data/certificates` | `CertificatesSection.tsx:8` |
| `components/sections/DetailedAboutSection.tsx` | `timelineItems` from `data/experiences` | `DetailedAboutSection.tsx:8` |
| `app/certificates/page.tsx` | `certificates` from `data/certificates` | `certificates/page.tsx:6` |
| `app/blog/page.tsx` | `getBlogPosts` from `lib/blog` | `blog/page.tsx:3` |
| `app/blog/[slug]/page.tsx` | `getBlogPost`, `getBlogPosts` from `lib/blog` | `blog/[slug]/page.tsx:5` |

Not a `data/*` import, but structurally identical (reads `lib/techIcons.tsx` directly): `TechIcon.tsx:1`, `SkillsSection.tsx:6`, `LongSkillSection.tsx:6`, `ProjectCard.tsx` (via `TechIcon`), `ProjectDetailsOverlay.tsx` (via `TechIcon`).

`AboutSection.tsx` does not import `data/*` — it calls `getStatTicker()` from `lib/constants.ts`
(section 7), which is itself not a `data/*` file, so it's outside AGENTS.md's `data_file`
category entirely but is still portfolio content that a CMS should probably own (at minimum the
three static numbers).

---

## 9. Proposed Postgres mapping

Draft only — column names/types, not migration SQL. Every table gets an implicit `id
uuid primary key default gen_random_uuid()` unless a natural key is noted.

### `projects`

| Column | Type | Notes |
|---|---|---|
| `id` | `text primary key` | Keep the existing slug-like `id` (`"panen-pas"`, etc.) as the natural key — it's already used as a URL-safe identifier in `writeupUrl: "/blog"`-style internal links and as React keys everywhere |
| `title` | `text not null` | |
| `description` | `text not null` | Store as markdown/plain text as today; consider a render pipeline change since it's currently shown raw (`whitespace-pre-line`), not markdown-rendered — decide whether the CMS migration is also the moment to start rendering it as markdown |
| `category` | `text not null` | Either a Postgres `enum` type or a `check` constraint against `('web-development','security','ctf')` |
| `status` | `text not null` | Same treatment, `('live','in-progress','archived')` |
| `stack` | `text[]` | Array of tech keys; keep as an array column (Postgres native `text[]`) rather than JSONB — it's a flat list of foreign-key-like strings, not nested data. See "open question" below on whether this becomes a real FK to a `tech_items` table. |
| `preview_image` | `text` | nullable, storage path/URL |
| `preview_images` | `text[]` | nullable array |
| `preview_gif` | `text` | nullable |
| `preview_video` | `text` | nullable |
| `featured` | `boolean not null default false` | |
| `github_url` / `live_url` / `writeup_url` / `devpost_url` | `text` | all nullable |
| `sort_order` | `integer` | **new** — not in current data (array order in the `.ts` file is the only ordering signal today; a DB table needs an explicit order column or the display order becomes arbitrary) |
| `created_at` / `updated_at` | `timestamptz` | standard CMS bookkeeping, doesn't exist today |

### `certificates`

| Column | Type | Notes |
|---|---|---|
| `id` | `text primary key` | |
| `title` | `text not null` | |
| `issuer` | `text not null` | Currently free text (`"Issued by BNSP"`); consider normalizing to an `issuers` lookup table later, but not required for v1 |
| `category` | `text not null` | `('web','security','community')` — **note this is a different enum from `projects.category`**, do not conflate |
| `status` | `text not null` | `('completed','in-progress','planned')` |
| `summary` | `text not null` | |
| `date` | `text` or `date` | Currently a bare year string (`"2025"`); if migrating to a real `date` type, existing values need to be backfilled to a real date or the column stays `text` and gets a `date_label` alias — open question below |
| `preview_image` | `text` | nullable |
| `credential_url` | `text` | nullable |
| `badge_url` | `text` | nullable — currently dead/unused; keep the column since the type already promises it, but no urgency |

### `experiences` (timeline)

| Column | Type | Notes |
|---|---|---|
| `id` | `text primary key` | |
| `title` | `text not null` | |
| `org` | `text not null` | |
| `period` | `text not null` | Free text (`"2026 - Present"`) — same open question as certificate `date` |
| `highlights` | `text[]` | Flat array of bullet strings; no sub-structure needed |
| `sort_order` | `integer` | **new**, same reasoning as `projects` |

### `tech_items` (skills marquee)

| Column | Type | Notes |
|---|---|---|
| `key` | `text primary key` | Must stay in sync with whatever the icon-resolution layer uses (see below) |
| `label` | `text not null` | |
| `badge` | `text` | nullable |
| `match_keys` | `text[]` | nullable; defaults to `[key]` at read time if empty, matching current `matchKeys ?? [item.key]` fallback logic |
| `sort_order` | `integer` | order currently implicit in array position; also currently split into two fixed marquee rows (`slice(0,14)` / `slice(14)`) — that row-count split is a presentation decision, probably keep it in code rather than DB |

`security_values` — 3 plain strings today, low-value to model as a table; could be a
`site_content` key-value/JSONB row (e.g. `settings.security_values: text[]`) or just stay
hardcoded, since it's copy, not portfolio content that changes often.

### `tech_icons` (the hard one — see section 5)

Cannot be a pure data table if `react-icons` components stay in play. Proposed split:

| Column | Type | Notes |
|---|---|---|
| `key` | `text primary key` | |
| `label` | `text not null` | |
| `color` | `text not null` | Either a `var(--brand-*)` token name or a literal hex — pick one convention for the migration and normalize the four `createImageIcon` entries that currently hardcode hex instead of using a token |
| `icon_kind` | `text not null` | `'react-icons' \| 'local-image'` |
| `icon_ref` | `text not null` | For `'react-icons'`: the exported symbol name (e.g. `"SiPostgresql"`) resolved through a static TS map maintained in code (NOT stored as executable code in the DB). For `'local-image'`: an asset URL/path. |

This table can be CMS-managed for adding new tech logos, but the `'react-icons'` kind still
requires a code deploy to add a new symbol to the static resolver map — flag this as a real
limitation, not solved by the DB alone.

### `blog_posts`

| Column | Type | Notes |
|---|---|---|
| `slug` | `text primary key` | |
| `title` | `text not null` | |
| `excerpt` | `text not null` | |
| `date` | `date not null` | Existing files already use `YYYY-MM-DD`, so this one can be a real `date` column without backfill pain |
| `category` | `text not null` | `('security','ctf','template')` |
| `read_time` | `text not null` | Free text (`"20 min read"`) — could become an `integer` minutes column instead, but that's a content-model change, not just a storage-format change; flag as open question |
| `tags` | `text[]` | nullable |
| `body_markdown` | `text not null` | The full markdown body (today: the `.md` file content after the `<!-- meta -->` block) |
| `toc` | `jsonb` | nullable; either keep deriving it at render time from `body_markdown` (same regex logic, ported to run against a DB string instead of a file) or persist it as authored/cached JSON `[{id, label}]` — recommend keeping it derived, to avoid a second source of truth that can drift from the body's actual headings |

### `stat_ticker` / site stats

Given `STATIC_STATS` is only 3 numbers plus one live-fetched one, this likely doesn't need a full
table — a single `site_settings` JSONB row (`{ projects: "7+", years: 2, certificates: "99%" }`)
is enough, with the GitHub commit count staying a runtime API call (already cached 24h) rather
than something the CMS writes. `ContactSection`'s duplicate direct read of `STATIC_STATS` should
be pointed at the same source as `AboutSection`'s `getStatTicker()` during migration so there's
one source of truth.

### What CANNOT cleanly move to a DB, summarized

1. **`techIcons.tsx`'s `icon` field** (section 5) — a live React component reference. Requires
   keeping a static code-side resolver keyed by a DB-stored string, not a pure-data column.
2. **Blog post body rendering** (section 6) — the *storage* of markdown can move to a `text`
   column trivially, but the *render path* (Next's file-based MDX compiler +
   `mdx-components.tsx`) assumes a file on disk at build time. Moving to DB-sourced content
   requires swapping in a runtime markdown/MDX renderer (e.g. `next-mdx-remote`,
   `react-markdown` + the same component-override map), which is a real engineering task, not
   just a data migration.
3. **`AboutSection`'s live GitHub commit count** (section 7) — not portfolio content at all, it's
   a live external API integration with its own caching; the dashboard/CMS shouldn't try to "own"
   this value, just the three static stats alongside it.
4. **Cross-referential `matchKeys` / `stack` relationship** (section 4) — currently computed at
   render time by string-matching two independently edited arrays. Moving both to Postgres makes
   this a real place to introduce either a proper `project_tech (project_id, tech_key)` join
   table (recommended — turns implicit string matching into an explicit relation and lets the
   UI query "projects using X" directly) or keep it as a runtime array-overlap query
   (`stack && ARRAY[...]`), which is closer to current behavior but keeps the implicit-matching
   fragility.

## 10. Open questions

- **Date fields stored as free text** (`certificates.date` = `"2025"`, `experiences.period` =
  `"2026 - Present"`) — does the CMS need real sortable/filterable dates, or is display-text
  sufficient? If real dates are wanted, existing values need manual backfill since they're not
  currently parseable as ISO dates.
- **Should `ProjectData.stack` become a real foreign-key join table (`project_tech`) or stay a
  `text[]` column?** A join table is more "correct" relationally and enables reverse queries
  (already needed today for the skills-marquee tooltip), but is more migration work up front.
- **Should `tech_icons.icon_kind = 'react-icons'` be phased out entirely** in favor of every tech
  logo being a `local-image` asset URL, so the CMS can add new tech logos without a code deploy?
  This removes the react-icons dependency for tech logos but is a larger asset-management change
  (SVG sourcing/hosting) than the current migration scope implies.
- **Blog render pipeline choice** — `next-mdx-remote` vs. a plainer markdown renderer — affects
  whether existing MDX-flavored features (if any are used beyond what `mdx-components.tsx`
  currently overrides: headings, lists, links, blockquote, pre/code, hr) keep working. Neither
  sample post was inspected for markdown edge cases (tables, embedded components) beyond the
  first ~60 lines of `digital-forensic-writeup.md`; a fuller pass over both files is recommended
  before finalizing the renderer choice.
- **`readTime` as free text vs. computed `integer` minutes** — free text allows exact phrasing
  control per post; a computed value would need a word-count heuristic and lose the "20 min read"
  editorial voice unless a `read_time_minutes` integer plus a formatting function is used instead
  of storing the label directly.
- **`certificates.badge_url` is unused today** — worth confirming with the site owner whether
  it's planned functionality before deciding whether to carry it into the schema.

