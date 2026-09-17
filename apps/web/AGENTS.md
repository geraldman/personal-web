# apps/web — Agent Instructions

This corrects the previous root `AGENTS.md`, which documented a design system that does not
exist in the code. Every claim below is sourced from `design-system-audit.md`
(audited 2026-09-02, read against `src/app/globals.css`, `src/app/layout.tsx`, and the full
`src/components/` tree). Where the audit found real code that the old doc never mentioned, it is
included here. Nothing in this file is carried over from the old `AGENTS.md` unverified.

## Stack

- Next.js (App Router), TypeScript strict, Tailwind CSS v4, Framer Motion, react-icons, Resend
  (contact email), `clsx` + `tailwind-merge` via `cn()` in `lib/utils.ts`.
- Fonts: `next/font/google` — `Geist` and `Geist_Mono`, imported in `src/app/layout.tsx`:
  ```ts
  import { Geist, Geist_Mono } from "next/font/google";
  const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans", preload: false });
  const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", preload: false });
  ```
  Applied as `<html className={\`${geistSans.variable} ${geistMono.variable} h-full antialiased\`}>`.
  The `geist` npm package is not the font source — do not import from it, and do not "fix" the
  `next/font/google` import back to it.

## Design tokens — the single source of truth is `src/app/globals.css`

There is no `/styles` directory. All tokens live in `src/app/globals.css`'s `:root` block.

**The palette is monochrome, not electric blue/cyan.**

```css
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
```

No blue or cyan exists in any `--color-*` token. The only hue in the system comes from the three
semantic status colors above and the `--brand-*` block below.

**`--brand-*` tokens** — roughly 30 of them, one per tech-stack logo (e.g. `--brand-typescript`,
`--brand-react`, `--brand-postgresql`), consumed by `src/lib/techIcons.tsx` to tint icons. This
category does not exist in any prior design doc — treat it as load-bearing, first-class data.

Layout tokens: `--max-width: 1200px`, `--nav-height: 65px`.

Font tokens: `--font-body: var(--font-geist-sans)`, `--font-code: var(--font-geist-mono)` — an
indirection layer. `body` uses `var(--font-body)` directly.

### `@theme inline` block

Exactly three tokens are registered for Tailwind v4:

```css
@theme inline {
  --font-sans: var(--font-body);
  --font-mono: var(--font-code);
  --breakpoint-xs: 480px;
}
```

No color tokens are registered here. All component color usage is arbitrary-value
`var(--color-*)` syntax (e.g. `text-[var(--color-text-primary)]`), never Tailwind color utility
classes like `text-accent`. `--breakpoint-xs: 480px` is a real custom breakpoint, used by the
skills marquee (`hidden xs:block`) — its only consumer in the codebase.

### Utility classes (`@layer utilities`)

Thirteen classes exist. Use these, do not invent new ones outside `globals.css`:

- `.glass` — `background: rgba(13, 13, 20, 0.75); border: 1px solid var(--color-border); backdrop-filter: blur(14px);`
- `.glow` — `box-shadow: 0 0 28px var(--color-accent-glow);`
- `.text-gradient` — `linear-gradient(112deg, var(--color-accent) 0%, var(--color-accent-secondary) 100%)` clipped to text.
- `.section-padding` — `padding: 6rem 1.5rem 2rem;` (asymmetric — not the same value on all four
  sides).
- `.container-width` — `margin-inline: auto; width: min(100%, var(--max-width));`
- `.overlay-scrollbar` — opt-in thin scrollbar styling (`scrollbar-width: thin` plus
  `::-webkit-scrollbar*` rules). Applied per-element where needed, not globally in `@layer base`.
- `.marquee`, `.marquee-track`, `.marquee-item` — the skills-marquee horizontal scroll mechanism,
  with `data-direction`/`data-paused` attribute hooks and a mask-image fade at the edges.
- `.animate-hero-fade-in-up` plus `.animation-delay-120/240/360/480` — the hero's CSS-keyframe
  entrance stagger (see Motion below).

`@layer base` itself only sets box-sizing, `html`/`body` sizing, `body` background/color/font,
link color reset, and `::selection` styling. No scrollbar styling lives in `@layer base`.

## Motion

No shared "entrance variants" object exists — every component inlines its own
`initial`/`animate`/`transition`. Three real easing curves recur:

- `[0, 0, 0.2, 1]` — entrances (section reveals, modal panels).
- `[0.25, 0.46, 0.45, 0.94]` — hover/close/fade transitions.
- `[0.22, 1, 0.36, 1]` — navbar capsule only, at `duration: 0.65`.

`staggerChildren` is **not used anywhere**. Every stagger-like effect is hand-rolled: the hero
uses CSS `animation-delay` on `.animate-hero-fade-in-up` (120/240/360/480ms), the navbar uses
per-element `transition.delay`.

The hero entrance is CSS keyframes (`@keyframes hero-fade-in-up`, translateY 32px → 0), not
Framer Motion.

The standard section-entrance pattern (used by `AnimatedSection.tsx`, the one reusable wrapper):
`initial={{ opacity: 0, y: 24 }}`, `whileInView={{ opacity: 1, y: 0 }}`,
`viewport={{ once: true, amount: 0.15 }}`, `transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}`.

Modal/overlay pattern (all four overlays: project, certificate, experience, contact
verification): backdrop `opacity 0→1` at `duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94]`; panel
`opacity 0→1, y 24→0` at `duration: 0.35, ease: [0, 0, 0.2, 1]`. Rendered via `createPortal` into
`document.body`, lock body scroll, compensate scrollbar width, close on `Escape`.

Filter-pill transitions (`ProjectsGrid`, `/certificates`) use real Framer `layoutId`s. The navbar
active-link indicator does **not** — it's a plain `AnimatePresence` opacity fade with a static
key, no shared-element animation between routes.

## Navbar

`Navbar.tsx` is self-contained and has a 3-phase boot sequence: `"loading" → "capsule" →
"normal"`, which locks page scroll during initial load, animates a full-viewport panel down into
a pill-shaped floating capsule, then hands off to `useScrollNavbar` for scroll-driven capsule
width.

`useScrollNavbar(enabled = true)` — returns `{ isScrolled: boolean }`. Scroll threshold is
**70px**, not 80px. Takes an `enabled` param (used to suppress scroll tracking during the boot
animation) — don't strip this param when touching the hook.

`NavbarLoader.module.css` is a real CSS module (one `.loader` class + `@keyframes flash`) used
only by the boot-loading dots.

## Hooks

- `useScrollNavbar(enabled?)` — see above.
- `useOverlayHistory<T extends {id:string}>({ activeItem, setActiveItem, paramName })` — returns
  `{ handleCloseOverlay }`. Syncs every detail overlay (project/certificate/experience) with
  browser history via `pushState`/`popstate`, so the back button closes the modal instead of
  navigating away. Used by every overlay-opening section.

## Paths — no route groups

Real tree: `src/app/`, `src/components/{layout,sections,shared,ui}/`, `src/lib/`, `src/hooks/`,
`src/data/`, `src/types/`, `src/content/blog/`. There is no `(root)` route group and no
`/styles` directory.

### Component inventory (real, from the audit)

`layout/`: `Navbar.tsx`, `Footer.tsx`, `NavbarLoader.module.css`.

`sections/`: `HeroSection.tsx`, `AboutSection.tsx` (async server component, awaits
`getStatTicker()`), `CertificatesSection.tsx`, `ContactSection.tsx`, `DetailedAboutSection.tsx`,
`LongSkillSection.tsx` (exports `LongSkillsSection` — file/export name mismatch; near-duplicate
of `SkillsSection.tsx` minus the `securityValues` aside), `ProjectsGrid.tsx`,
`ProjectsPreviewSection.tsx`, `SkillsSection.tsx`.

`shared/`: `AnimatedSection.tsx`, `PageHeader.tsx`, `SectionHeader.tsx`. There is no
`ScrollIndicator.tsx` — do not reference or recreate it without checking first.

`ui/`: `Button.tsx`, `CertificateCard.tsx`, `CertificateDetailsOverlay.tsx`,
`ContactVerificationModal.tsx` (wraps `Turnstile.tsx`), `ExperienceDetailsOverlay.tsx`,
`ProjectCard.tsx`, `ProjectCardSkeleton.tsx`, `ProjectDetailsOverlay.tsx`, `TechIcon.tsx`,
`Turnstile.tsx`, `reactBackground.tsx` (exports `TopographyBackground` — a hand-built canvas
contour-line animation, **not** a "ReactBits" library component pending integration; it is
already in production in the hero). There is no `Badge.tsx`.

## Hero

Single centered full-width column with the `TopographyBackground` canvas as its background
layer. There is **no split grid, no right-panel photo, no image in the hero at all**, on any
breakpoint. The portrait (`gerald.webp`) only appears in `AboutSection` / `DetailedAboutSection`.
Name sizing: `text-5xl sm:text-6xl lg:text-7xl xl:text-8xl` (four steps).

## Projects

`ProjectData` (`src/types/index.ts`) fields: `id`, `title`, `description`, `category`
(`"web-development" | "security" | "ctf"`), `status` (`"live" | "in-progress" | "archived"`),
`stack: string[]`, plus optional `previewImage`, `previewImages[]` (carousel), `previewGif`,
`previewVideo` (hover-to-play, takes priority over gif), `featured`, `githubUrl`, `liveUrl`,
`writeupUrl`, `devpostUrl`.

`stack[]` strings are lookup keys into `lib/techIcons.tsx` (`TechIcon.tsx` does
`techIcons[name.toLowerCase()]` — case-insensitive, falls back to a text pill badge if
unrecognized). Filter tabs and `CATEGORY_LABELS` are still data-driven from
`lib/constants.ts` — keep doing that.

Grids (`ProjectsGrid`, `ProjectsPreviewSection`, and — contrary to any doc that says otherwise —
`CertificatesSection`/`/certificates`) all use the same `grid gap-4 md:grid-cols-2
lg:grid-cols-3 lg:gap-6`: 1/2/3 columns, capped at 3. Certificates do **not** go to 4-5 columns
at `lg`.

## Certificates

`CertificateData` has its own category enum, `"web" | "security" | "community"` — distinct from
`ProjectData`'s category enum, not a shared type. `app/certificates/page.tsx` declares its own
inline `CATEGORY_LABELS` for this enum, separate from `lib/constants.ts`'s
`CATEGORY_LABELS` (which is keyed by `ProjectCategory`). Don't conflate the two.

## Blog

Posts are `.md` files in `src/content/blog/`, not a `/data/blog.ts` array (no such file exists).
Frontmatter is JSON embedded in an HTML comment (`<!-- meta {...} -->`), parsed by regex in
`src/lib/blog.ts`. Posts are loaded via dynamic `import()` of the `.md` file as a Next MDX-compiled
component; `src/mdx-components.tsx` supplies the `useMDXComponents()` override map. Table of
contents is derived by regex from the post body, not authored data.

## Responsiveness

Mobile-first, real grids as documented above (not a generic per-component breakpoint table).
Touch targets: `min-h-[44px]` used consistently on interactive elements — keep doing this.

## Rules carried forward (still true, keep following)

- Dark only. No light mode, no theme toggle.
- `cn()` from `lib/utils.ts` for all className merging.
- `var(--color-*)` for every color — no hardcoded hex in components.
- Resend for the contact form, via a server action (`lib/resend.ts`), not a route handler.
  Contact form keeps its honeypot field and client-side + server-side validation.
- No lorem ipsum or placeholder text unrelated to Gerald's actual background.
- Loading skeletons (`ProjectCardSkeleton`, etc.) for async/filtered content.

## Deleted from the old AGENTS.md — do not resurrect

The ReactBits-as-future-integration framing (it's already built, see `reactBackground.tsx`
above), the `55fr_45fr` split hero with a right-panel photo, the `npm i geist` /
`geist/font/sans` import instructions, the electric-blue/cyan color palette and its hex values,
the `/styles/globals.css` path, the fictional file tree entries (`ScrollIndicator.tsx`,
`Badge.tsx`), and the per-component responsive table that gives certificates 2/4-5 columns.
