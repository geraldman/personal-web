# Design System Audit — What The Code Actually Does

Audited 2026-09-02. Source of truth: the files listed below, read in full. AGENTS.md was
deliberately NOT used as a reference while writing this — it is audited separately in the
"AGENTS.md drift" section at the end.

Files read: `src/app/globals.css`, `src/app/layout.tsx`, `src/mdx-components.tsx`,
`src/hooks/useScrollNavbar.ts`, `src/hooks/useOverlayHistory.ts`, every file under
`src/components/layout/`, `src/components/sections/`, `src/components/shared/`,
`src/components/ui/`.

---

## 1. CSS custom properties (`src/app/globals.css`, `:root` block, lines 3–63)

```css
:root {
  --color-bg: #050508;
  --color-bg-secondary: #0a0a10;
  --color-surface: #0d0d14;
  --color-surface-hover: #12121c;
  --color-border: rgba(255, 255, 255, 0.14);
  --color-border-hover: rgba(255, 255, 255, 0.34);
  --color-accent: #f2f2ee;
  --color-accent-secondary: #ffffff;
  --color-accent-dark: #9c9c95;
  --color-accent-dim: rgba(255, 255, 255, 0.12);
  --color-accent-glow: rgba(255, 255, 255, 0.28);
  --color-text-primary: #f5f5f2;
  --color-text-secondary: #b2b2ac;
  --color-text-muted: #6f6f6a;
  --color-success: #00e5a0;
  --color-warning: #f0b429;
  --color-danger: #ff4d6a;
  --brand-typescript: #3178c6;
  --brand-nextjs: #ffffff;
  --brand-postgresql: #4169e1;
  --brand-docker: #2496ed;
  --brand-react: #61dafb;
  --brand-tailwindcss: #06b6d4;
  --brand-nodejs: #339933;
  --brand-express: #ffffff;
  --brand-elastic: #005571;
  --brand-markdown: #ffffff;
  --brand-python: #3776ab;
  --brand-linux: #fcc624;
  --brand-redis: #dc382d;
  --brand-firebase: #dd2c00;
  --brand-vercel: #ffffff;
  --brand-supabase: #3ECF8E;
  --brand-n8n: #ea4b71;
  --brand-cplusplus: #00599c;
  --brand-laravel: #ff2d20;
  --brand-nginx: #009639;
  --brand-bash: #4eaa25;
  --brand-java: #007396;
  --brand-php: #777bb4;
  --brand-mysql: #4479a1;
  --brand-git: #f05032;
  --brand-wireshark: #1679a7;
  --brand-burpsuite: #ff6633;
  --brand-html: #E44D26;
  --brand-css: #663399;
  --brand-javascript: #F0DB4F;
  --brand-vite: #646CFF;
  --brand-go: #00ADD8;
  --brand-hivemq: #FF7A00;
  --brand-googlecloud: #4285F4;
  --brand-opensearch: #005EB8;
  --brand-redpanda: #E2401B;
  --brand-cloudflare: #F38020;
  --max-width: 1200px;
  --nav-height: 65px;
  --font-body: var(--font-geist-sans);
  --font-code: var(--font-geist-mono);
}
```

**The palette is grayscale/white, not electric blue/cyan.** `--color-accent` is `#f2f2ee`
(near-white), `--color-accent-secondary` is `#ffffff`. There is no blue or cyan anywhere in the
`--color-*` tokens. `--color-border` and `--color-border-hover` are white-alpha
(`rgba(255,255,255,…)`), not cyan-alpha. Only the semantic status colors
(`--color-success`, `--color-warning`, `--color-danger`) and the ~30 `--brand-*` tech-icon
colors carry any hue.

`--brand-*` tokens are a category that doesn't exist in the design doc at all — 30 of them,
one per tech-stack logo, consumed by `src/lib/techIcons.tsx` (see the data-inventory doc).

Layout tokens: `--max-width: 1200px`, `--nav-height: 65px`.

Font tokens: `--font-body: var(--font-geist-sans)`, `--font-code: var(--font-geist-mono)` — an
indirection layer, not a direct reference to the Next `next/font` variables.

## 2. Tailwind v4 `@theme` block (globals.css lines 65–69)

```css
@theme inline {
  --font-sans: var(--font-body);
  --font-mono: var(--font-code);
  --breakpoint-xs: 480px;
}
```

Only three tokens are registered: `font-sans`, `font-mono` (pointing at the indirection
variables above, not directly at `--font-geist-sans`), and a custom breakpoint `xs: 480px`
(used by `SkillsSection`/`LongSkillSection` marquee item labels: `hidden xs:block`). No color
tokens are registered in `@theme` — all color usage in components is via arbitrary-value
`var(--color-*)` syntax (e.g. `text-[var(--color-text-primary)]`), never Tailwind color
utilities like `text-accent`.

## 3. `@layer base` (globals.css lines 71–106)

- Universal box-sizing: `*, *::before, *::after { box-sizing: border-box; }`
- `html, body { min-height: 100%; }`
- `html { scroll-behavior: smooth; }`
- `body`: `margin: 0`, `background: var(--color-bg)`, `color: var(--color-text-primary)`,
  `font-family: var(--font-body), sans-serif`, `text-rendering: optimizeLegibility`,
  `-webkit-font-smoothing: antialiased`
- `a { color: inherit; text-decoration: none; }`
- `::selection { background: var(--color-accent-dim); color: var(--color-text-primary); }`

No scrollbar styling in `@layer base` — that lives in `@layer utilities` as `.overlay-scrollbar`
(section 4), and is opt-in per element, not global.

## 4. `@layer utilities` (globals.css lines 108–233), full CSS bodies

```css
.glass {
  background: rgba(13, 13, 20, 0.75);
  border: 1px solid var(--color-border);
  backdrop-filter: blur(14px);
}

.glow {
  box-shadow: 0 0 28px var(--color-accent-glow);
}

.text-gradient {
  background: linear-gradient(112deg, var(--color-accent) 0%, var(--color-accent-secondary) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.section-padding {
  padding: 6rem 1.5rem 2rem;
}

.container-width {
  margin-inline: auto;
  width: min(100%, var(--max-width));
}

.overlay-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: var(--color-border-hover) transparent;
}
.overlay-scrollbar::-webkit-scrollbar { width: 10px; }
.overlay-scrollbar::-webkit-scrollbar-track { background: transparent; }
.overlay-scrollbar::-webkit-scrollbar-thumb {
  border: 2px solid transparent;
  border-radius: 999px;
  background: var(--color-border-hover);
  background-clip: content-box;
}
.overlay-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--color-accent-dim);
  background-clip: content-box;
}

.marquee {
  position: relative;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
}

.marquee-track {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  width: max-content;
  animation: marquee-left var(--marquee-duration-mobile, 24s) linear infinite;
  will-change: transform;
  touch-action: pan-y;
}
@media (min-width: 640px) {
  .marquee-track {
    gap: 0.5rem;
    animation-duration: var(--marquee-duration, 36s);
  }
}
.marquee-track[data-direction="right"] { animation-direction: reverse; }
.marquee-track[data-paused="true"] { animation-play-state: paused; }
.marquee-item { flex: 0 0 auto; }

.animate-hero-fade-in-up {
  animation: hero-fade-in-up 0.65s cubic-bezier(0, 0, 0.2, 1) both;
}
.animation-delay-120 { animation-delay: 120ms; }
.animation-delay-240 { animation-delay: 240ms; }
.animation-delay-360 { animation-delay: 360ms; }
.animation-delay-480 { animation-delay: 480ms; }
```

Note: `.section-padding` is `6rem 1.5rem 2rem` (asymmetric top/bottom), not the AGENTS.md
`6rem 1.5rem` on all edges.

`.overlay-scrollbar` and the entire `.marquee*` / `.animate-hero-fade-in-up` family are real,
load-bearing utility classes that AGENTS.md never mentions.

## 5. Keyframes (globals.css lines 235–254)

```css
@keyframes marquee-left {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes hero-fade-in-up {
  from { opacity: 0; transform: translateY(32px); }
  to { opacity: 1; transform: translateY(0); }
}
```

Plus a component-scoped CSS module, `src/components/layout/NavbarLoader.module.css`, with its
own `@keyframes flash` used only by the navbar boot-loader dot animation (`.loader` class,
`styles.loader` in `Navbar.tsx`).

## 6. Font setup

`src/app/layout.tsx` (not `globals.css`, not a `geist` npm package):

```ts
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans", preload: false });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", preload: false });
```

Applied to `<html className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>`.
`globals.css` then indirects through `--font-body`/`--font-code` (section 1) and the `@theme`
block maps those to Tailwind's `font-sans`/`font-mono` (section 2). `body` uses `var(--font-body)`
directly (section 3).

## 7. Framer Motion conventions actually in use

No single shared "entrance variant" object exists — every component inlines its own
`initial`/`animate`/`transition`. Observed conventions, with file:line:

- **Standard section entrance** — `AnimatedSection.tsx:18-24`: `initial={{ opacity: 0, y: 24 }}`,
  `whileInView={{ opacity: 1, y: 0 }}`, `viewport={{ once: true, amount: 0.15 }}`,
  `transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}`. This is the closest thing to a shared
  wrapper and is used by every section component.
- **Hero entrance** is NOT Framer Motion — it's the CSS keyframe `.animate-hero-fade-in-up` plus
  `.animation-delay-*` utility classes (`HeroSection.tsx:87,93,99,105`), staggered at
  120/240/360/480ms, easing `cubic-bezier(0,0,0.2,1)` (matches AGENTS.md's "ease-out-expo" curve
  in spirit, but implemented in raw CSS, not Framer).
- **Navbar capsule boot/scroll animation** — `Navbar.tsx:168-187`: all four animated props
  (`width`, `height`, `borderRadius`, `y`) share `duration: 0.65, ease: [0.22, 1, 0.36, 1]` — a
  distinct curve from AGENTS.md's documented ease-out-quad/ease-out-expo pair.
- **Modal/overlay pattern** (used identically in `ProjectDetailsOverlay.tsx:144-160`,
  `CertificateDetailsOverlay.tsx:59-75`, `ExperienceDetailsOverlay.tsx:51-67`,
  `ContactVerificationModal.tsx:107-122`): backdrop `opacity 0→1` at
  `duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94]`; panel `opacity 0→1, y 24→0` at
  `duration: 0.35, ease: [0, 0, 0.2, 1]`. All four overlays are rendered via `createPortal` into
  `document.body`, all lock body scroll and compensate scrollbar width, all close on `Escape`.
- **Filter-pill transitions** — `ProjectsGrid.tsx:67-71`, `certificates/page.tsx:66-70`: Framer
  `layoutId` (`"project-filter-pill"` / `"certificate-filter-pill"`) with
  `transition={{ duration: 0.2 }}` (no custom easing curve specified — uses Framer's default).
- **Nav active-link pill** — `Navbar.tsx:274-281`: `layoutId` is NOT used here despite AGENTS.md
  saying "Active indicator uses Framer layoutId"; it's a plain `AnimatePresence`
  opacity-fade (`key="nav-pill"`, `duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94]`), no shared
  layout animation between routes.
- **Grid filter transitions** — `ProjectsGrid.tsx:82-89`: `AnimatePresence mode="wait"`, card
  grid keyed by `activeFilter`, `initial={{opacity:0,y:16}}`, `exit={{opacity:0,y:-16}}`,
  `duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94]`.
- **Hero status-badge width/text swap** — `HeroSection.tsx:66-77`: width animates over
  `duration: 0.45, ease: [0,0,0.2,1]`; the text itself cross-fades via `AnimatePresence
  mode="wait"` at `duration: 0.3, ease: [0.25,0.46,0.45,0.94]`.
- Stagger via `staggerChildren` (as AGENTS.md describes) is **not used anywhere** in the
  codebase — every stagger-like effect (hero, nav) is done with manual per-element
  `animation-delay` or `transition.delay`, not a Framer variants tree.
- Two distinct easing curves recur throughout: `[0.25, 0.46, 0.45, 0.94]` (~ease-out-quad, used
  for hover/close/fade transitions) and `[0, 0, 0.2, 1]` (ease-out-expo, used for entrances). A
  third, `[0.22, 1, 0.36, 1]`, is unique to the navbar capsule.

## 8. Component inventory

### `layout/`
- **`Navbar.tsx`** (client) — no props. Self-contained: manages a 3-phase boot sequence
  (`"loading" → "capsule" → "normal"`) that locks page scroll during initial load, animates a
  full-viewport panel down into a pill-shaped floating capsule, then hands off to
  `useScrollNavbar` for scroll-based capsule width. Renders `NAV_LINKS` from `lib/constants.ts`,
  a mobile hamburger drawer, active-route pill.
- **`Footer.tsx`** — no props. Renders logo, copyright, `SOCIAL_LINKS`, and (if
  `NEXT_PUBLIC_GIT_SHA`/`VERCEL_GIT_COMMIT_SHA`/`GIT_COMMIT_SHA` env var is set) a commit-SHA
  link to GitHub.
- **`NavbarLoader.module.css`** — CSS module, one `.loader` class + `@keyframes flash`, used only
  by `Navbar.tsx`'s boot-loading dots.

### `sections/`
- **`HeroSection.tsx`** (client) — no props. Full-viewport hero: `TopographyBackground` canvas
  layer, rotating status-badge text (`STATUS_MESSAGES`, 5s interval), CSS-keyframe staggered
  entrance, two `Button`s (Get in Touch / Download CV).
- **`AboutSection.tsx`** (async server component) — no props. Awaits `getStatTicker()` (which
  awaits a live GitHub API call), renders bio copy + a 2×2 stat-card grid + a grayscale portrait.
- **`CertificatesSection.tsx`** (client) — no props. Home-page preview: first 3 of
  `data/certificates.ts`, opens `CertificateDetailsOverlay`, links to `/certificates`.
- **`ContactSection.tsx`** (client) — no props. Full contact form with client-side validation
  (`EMAIL_REGEX`, length limits), honeypot field, opens `ContactVerificationModal` (Turnstile)
  before calling the `sendEmail` server action from `lib/resend.ts`. Right column is a static
  "terminal" panel with `STATIC_STATS` and `SOCIAL_LINKS`.
- **`DetailedAboutSection.tsx`** (client) — no props. `/about` page bio + an experience timeline
  built from `data/experiences.ts`, opens `ExperienceDetailsOverlay` per item.
- **`LongSkillSection.tsx`** exports **`LongSkillsSection`** (client, note the name mismatch
  between file and export) — no props. `/about`-page tech marquee, **byte-for-byte identical**
  to `SkillsSection.tsx` minus the `securityValues` sidebar aside (see drift note below).
- **`ProjectsGrid.tsx`** (client) — no props. `/projects` page: category filter tabs derived from
  `projects` data, skeleton-then-card reveal gated on `useInView`, opens
  `ProjectDetailsOverlay`.
- **`ProjectsPreviewSection.tsx`** (client) — no props. Home-page preview: first 3
  `featured: true` projects, same skeleton/overlay pattern as `ProjectsGrid`, links to
  `/projects`.
- **`SkillsSection.tsx`** (client) — no props. Home-page tech marquee (two rows, `techItems`
  data) plus a `securityValues` sidebar `aside`.
- **`AboutSection.tsx`, `ContactSection.tsx`, `CertificatesSection.tsx`, `DetailedAboutSection.tsx`,
  `SkillsSection.tsx`** all wrap content in the shared `AnimatedSection`.

### `shared/`
- **`AnimatedSection.tsx`** — props `{ id?, className?, children }`. The one reusable
  `whileInView` wrapper (section 7).
- **`PageHeader.tsx`** — props `{ label, title, description }`. Page-level header used by
  `/projects`, `/certificates`, `/blog`, `/blog/[slug]`, and `not-found.tsx`.
- **`SectionHeader.tsx`** — props `{ label, title, description?, className? }`. Section-level
  `// label` + heading + optional description, used inside every home/about section.

### `ui/`
- **`Button.tsx`** — props `{ href, children, variant?: "primary"|"outlined"|"ghost", size?:
  "sm"|"md"|"lg", className?, download?: boolean|string }`. Wraps `next/link`; shows a spinner
  via `useLinkStatus()` while the target route is pending (unless `download` is set, in which
  case it renders a plain `<a>`).
- **`CertificateCard.tsx`** — props `{ certificate: CertificateData, onOpenDetails?: (c) =>
  void }`. Preview image, issuer, title, status dot, truncated summary, target date.
- **`CertificateDetailsOverlay.tsx`** — props `{ certificate: CertificateData | null, onClose: ()
  => void }`. Portal modal (section 7 pattern), shows full summary, preview image, status, and
  `credentialUrl` link.
- **`ContactVerificationModal.tsx`** — props `{ open, siteKey, onClose, onConfirm: (token:
  string) => Promise<void> }`. Wraps `Turnstile`, state machine
  `"verifying"|"verified"|"sending"|"error"`.
- **`ExperienceDetailsOverlay.tsx`** — props `{ experience: TimelineItem | null, onClose: () =>
  void }`. Portal modal, full highlight list.
- **`ProjectCard.tsx`** — props `{ project: ProjectData, eagerImage?: boolean, onOpenDetails?:
  (p) => void }`. Preview image with optional hover-to-play video/gif swap, status dot, truncated
  description, up to 6 `TechIcon`s (+N more badge), GitHub/Live/Writeup/Devpost links.
- **`ProjectCardSkeleton.tsx`** — no props. `animate-pulse` placeholder matching `ProjectCard`
  shape.
- **`ProjectDetailsOverlay.tsx`** — props `{ project: ProjectData | null, onClose: () => void }`.
  Portal modal with its own image-preload state machine (`isFrameReady`/`isImageReady`), an
  image carousel over `previewImages`, full `stack` icon row, all four link types.
- **`TechIcon.tsx`** — props `{ name: string }`. Looks up `techIcons[name.toLowerCase()]`
  (note the `.toLowerCase()` — case-insensitive lookup); falls back to a text pill badge if the
  key isn't found (matches AGENTS.md's documented fallback behavior).
- **`Turnstile.tsx`** — props `{ siteKey, onVerify, onError?, onExpire?, onBeforeLoad? }`
  (`onBeforeLoad` is declared in the type but never called anywhere in the file — dead prop).
  Loads `https://challenges.cloudflare.com/turnstile/v0/api.js` via `next/script`, renders the
  widget explicitly on script load.
- **`reactBackground.tsx`** — exports `TopographyBackground` (props: `className?, children?,
  lineCount?, lineColor?, backgroundColor?, speed?, strokeWidth?, sampleStep?, maxDpr?, paused?`)
  and a default `TopographyBackgroundDemo`. Canvas-based animated contour-line background,
  `requestAnimationFrame` loop, `ResizeObserver`-driven resize, DPR-capped, pauses when
  `paused` is true or (per `HeroSection.tsx:56`) when out of viewport / boot not ready. **This is
  the "ReactBits" background AGENTS.md refers to as a future integration — it already exists,
  hand-built, not from a ReactBits library.**

### Hooks
- **`useScrollNavbar(enabled = true)`** (`src/hooks/useScrollNavbar.ts`) — returns `{ isScrolled:
  boolean }`. Threshold is **70px** (`SCROLL_THRESHOLD`), not AGENTS.md's 80px. Debounces via a
  `prevScrolled` ref so state only updates on actual boundary crossings, not every scroll event.
  Takes an `enabled` flag (used by `Navbar` to suppress scroll tracking during the boot
  animation) — not documented in AGENTS.md's hook signature (`Returns { isScrolled: boolean }`
  with no params).
- **`useOverlayHistory<T extends {id:string}>({ activeItem, setActiveItem, paramName })`**
  (`src/hooks/useOverlayHistory.ts`) — returns `{ handleCloseOverlay }`. Not mentioned in
  AGENTS.md at all. Syncs every detail overlay (project/certificate/experience) with browser
  history via `pushState`/`popstate`, so the back button closes the modal instead of navigating
  away. Used by every overlay-opening section.

## 9. Responsive breakpoint patterns actually used

Tailwind defaults (`sm`/`md`/`lg`/`xl`) plus the custom `xs: 480px` registered in `@theme`
(section 2). Real usage patterns, not the AGENTS.md per-component table:

- Hero name: `text-5xl sm:text-6xl lg:text-7xl xl:text-8xl` (`HeroSection.tsx:87`) — four steps,
  not AGENTS.md's `text-4xl → text-5xl → text-7xl → text-8xl`.
- Grids (`ProjectsGrid`, `ProjectsPreviewSection`, `CertificatesSection`,
  `certificates/page.tsx`): `grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6` — 1/2/3 columns,
  matching AGENTS.md's projects-grid spec but reused identically for certificates too (AGENTS.md
  says certificates should be 2-col base / 4-5-col lg, which the real grid never does).
  `certificates` preview and full page both cap at 3 columns.
  page also just does `md:grid-cols-2 lg:grid-cols-3`.
- `AboutSection`: `grid gap-10 lg:grid-cols-5` with `lg:col-span-3` / `lg:col-span-2`, matching
  AGENTS.md's 5-column split.
- `DetailedAboutSection` timeline: `lg:grid-cols-4` (four items across on desktop, one per
  timeline entry — count-driven, not a general breakpoint rule).
- `SkillsSection`/`LongSkillSection`: marquee icon sizing scales `h-12 w-12` (base) →
  `sm:h-16 sm:w-16` → `md:h-20 md:w-20`; the item label uses the custom `xs:` breakpoint
  (`hidden xs:block`) — the one real consumer of `--breakpoint-xs`.
- Custom `min-width: 480px` (`xs`) has exactly one consumer in the whole codebase.
- Touch targets: `min-h-[44px]` used consistently on interactive elements (buttons, nav links,
  form inputs, filter pills) — matches AGENTS.md's 44px rule.

---

## 10. AGENTS.md drift

This section is exhaustive — every place AGENTS.md's `design_system`/`typography`/
`file_structure` claims contradict the code.

1. **The accent palette is not electric blue/cyan.** AGENTS.md hardcodes
   `accent: "#00c8ff"`, `accent_secondary: "#00e5ff"`, border `rgba(0,200,255,0.10)`, etc. The
   real tokens (section 1) are a white/off-white grayscale palette: `--color-accent: #f2f2ee`,
   `--color-accent-secondary: #ffffff`, `--color-border: rgba(255,255,255,0.14)`. There is no
   cyan or blue in any `--color-*` token. The "Electric blue + cyan + dark cyan, purple fully
   removed" framing in AGENTS.md describes a palette that isn't in the repository.
2. **Wrong file path for the stylesheet.** AGENTS.md's `globals_css_is_source_of_truth` and
   `file_structure.styles` both say `/styles/globals.css`. The real, and only, file is
   `src/app/globals.css`. There is no `/styles` directory in the repo.
3. **Geist fonts are not installed via the `geist` npm package.** AGENTS.md's `typography`
   section mandates `npm i geist` and `import { GeistSans } from 'geist/font/sans'`. The real
   code (`src/app/layout.tsx:2`) imports `Geist, Geist_Mono` from **`next/font/google`** — the
   exact pattern AGENTS.md's `forbidden` list explicitly bans ("Do not install Geist from
   next/font/google"). `package.json`'s dependency on a `geist` package (if any) would need
   checking separately, but nothing in the component tree imports from it.
4. **`--font-sans`/`--font-mono` are not registered as direct aliases of
   `--font-geist-sans`/`--font-geist-mono`.** AGENTS.md says to register those in `@theme`
   pointing straight at the Geist variables. The real `@theme inline` block (section 2) points
   `--font-sans`/`--font-mono` at an extra indirection layer, `--font-body`/`--font-code`, which
   are themselves declared in `:root` (section 1). Functionally equivalent, but not what's
   documented, and adds two undocumented custom properties (`--font-body`, `--font-code`).
5. **`--breakpoint-xs: 480px` is undocumented.** AGENTS.md's `responsiveness.breakpoints` table
   lists only `base/sm/md/lg/xl`; the real `@theme` block registers a fifth, custom breakpoint
   used by the skills marquee.
6. **Roughly 30 `--brand-*` CSS variables are entirely undocumented.** AGENTS.md's
   `globals_css_is_source_of_truth.what_goes_here` list has no category for per-tech-stack brand
   colors, but they're a first-class, sizeable chunk of `:root` (section 1) feeding
   `lib/techIcons.tsx`.
7. **`.overlay-scrollbar`, `.marquee`, `.marquee-track`, `.marquee-item`,
   `.animate-hero-fade-in-up`, and four `.animation-delay-*` utilities are undocumented.**
   AGENTS.md's `utility_classes` list names only `.text-gradient`, `.glass`, `.glow`,
   `.section-padding`, `.container-width` — five classes. The real `@layer utilities` block
   defines thirteen, plus two `@keyframes` blocks AGENTS.md never mentions.
8. **`.section-padding` value differs.** AGENTS.md: `padding: 6rem 1.5rem` (symmetric two-value
   shorthand). Real: `padding: 6rem 1.5rem 2rem` (asymmetric three-value — top/sides/bottom).
9. **The hero background is not a "ReactBits" library component pending integration.**
   AGENTS.md's `hero_layout.background.reactbits` frames this as: "When ReactBits component is
   chosen, slot it in." It's already built and in production use —
   `components/ui/reactBackground.tsx`'s hand-rolled canvas `TopographyBackground`, wired into
   `HeroSection.tsx` today. The `fallback` gradient AGENTS.md describes as the interim state is
   not what's rendered; the canvas component is.
10. **The hero is single-column full-bleed, not a 55/45 split grid with a right-panel photo.**
    AGENTS.md's `hero_layout.desktop_layout` describes a `grid-cols-[55fr_45fr]` split with
    `gerald.webp` filling the right panel at all breakpoints ≥lg. The real `HeroSection.tsx` is
    one centered, full-width column with a canvas background — there is no image in the hero at
    all, mobile or desktop; the portrait only appears in `AboutSection`/`DetailedAboutSection`.
11. **The navbar's mobile drawer, boot sequence, and pill styling aren't documented.**
    AGENTS.md's `navbar` section describes only the scroll-to-capsule transform. The real
    `Navbar.tsx` has an undocumented three-phase boot sequence (`loading → capsule → normal`)
    that locks page scroll on first load, an undocumented `useScrollNavbar(enabled)` param, and
    a scroll threshold of 70px, not the documented 80px.
12. **Active nav-link indicator does not use a Framer `layoutId`.** AGENTS.md:
    `"active_indicator: Framer layoutId='nav-pill' on active route."` Real code
    (`Navbar.tsx:272-283`) uses a plain `AnimatePresence` opacity fade with a static `key`, no
    `layoutId`, so there's no shared-element slide animation between routes. (Filter tabs
    elsewhere, e.g. `ProjectsGrid`, do use real `layoutId`s — just not the navbar.)
13. **Motion easing/duration conventions don't match AGENTS.md's documented scale.** AGENTS.md
    specifies exactly two curves (`[0.25,0.46,0.45,0.94]` standard, `[0,0,0.2,1]` entrance) and a
    duration_scale table topping out at 800ms. The real codebase adds a third curve,
    `[0.22,1,0.36,1]`, used only by the navbar capsule at 650ms — within the documented ≤900ms
    ceiling but off the documented curve list. `staggerChildren`, which AGENTS.md prescribes for
    every multi-child entrance ("stagger: staggerChildren: 0.07 on container variants"), is not
    used anywhere; staggers are hand-rolled via CSS `animation-delay` (hero) or per-element
    `transition.delay` (navbar).
14. **`SectionHeader`/`PageHeader` prefix format is `"// label"`, matches AGENTS.md, but
    `shared/ScrollIndicator.tsx` (documented in AGENTS.md's `components.shared` list) does not
    exist in the repo.** `src/components/shared/` contains exactly `AnimatedSection.tsx`,
    `PageHeader.tsx`, `SectionHeader.tsx` — no scroll indicator component anywhere.
15. **Several components in `file_structure.components` don't exist**, and several real
    components aren't in AGENTS.md at all:
    - Documented but missing: `shared/ScrollIndicator.tsx`, `ui/Badge.tsx`.
    - Real but undocumented: `ui/ContactVerificationModal.tsx`, `ui/Turnstile.tsx`,
      `ui/ProjectDetailsOverlay.tsx`, `ui/CertificateDetailsOverlay.tsx`,
      `ui/ExperienceDetailsOverlay.tsx`, `ui/reactBackground.tsx`,
      `sections/DetailedAboutSection.tsx`, `sections/LongSkillSection.tsx`,
      `layout/NavbarLoader.module.css`, both hooks (`useScrollNavbar` is documented, but with a
      different threshold and signature; `useOverlayHistory` is entirely undocumented).
16. **`ProjectData` has more fields than AGENTS.md's data model.** AGENTS.md:
    `required_fields: [title, description, category, status, stack]`,
    `optional_fields: [githubUrl, liveUrl, writeupUrl, featured]`. Real `ProjectData`
    (`src/types/index.ts:5-21`) adds `previewImage`, `previewImages` (an array — a whole preview
    carousel AGENTS.md never mentions), `previewGif`, `previewVideo` (hover-to-play video
    preview, undocumented), and `devpostUrl` (a fourth external-link type beyond GitHub/
    Live/Writeup).
17. **Certificates and blog data models aren't specified in AGENTS.md's `data_file` structure at
    all** (AGENTS.md only documents `/data/projects.ts` under `data_file`), yet
    `CertificateData`, `BlogPost`, `TimelineItem`, and `StatTickerItem` are all real, populated
    interfaces (see the companion data-inventory doc). `certificates.ts` also has its own
    3-category enum (`web|security|community`) distinct from the project category enum, and its
    own local `CATEGORY_LABELS` re-declared inline in `app/certificates/page.tsx` rather than
    sourced from `lib/constants.ts`.
18. **`SkillsSection.tsx` and `LongSkillSection.tsx` are near-duplicate files** (the marquee
    implementation is copy-pasted verbatim between them, differing only in whether the
    `securityValues` aside is rendered) — a maintenance/drift risk in the codebase itself, not
    just versus AGENTS.md, but relevant to the planned restructure since a CMS-backed rewrite
    should not carry this duplication forward.
19. **The blog system is entirely undocumented in AGENTS.md.** AGENTS.md's `file_structure.app`
    mentions `/blog/page.tsx` and `/blog/[slug]/page.tsx` only as generic descriptions
    ("Blog index from /data/blog.ts", "Dynamic post with generateStaticParams"). The real system:
    posts are **`.md` files** in `src/content/blog/`, not entries in a `/data/blog.ts` array (no
    such file exists); frontmatter lives in an HTML-comment JSON block (`<!-- meta {...} -->`)
    parsed by regex in `src/lib/blog.ts`; MDX component overrides live in
    `src/mdx-components.tsx` (also undocumented) but posts are loaded via raw dynamic `import()`
    of the `.md` file as a component module, not through the MDX components file's declared
    `useMDXComponents` hook path directly — see the data-inventory doc for the full mechanism.

