# apps/dashboard — Agent Instructions

dashboard.geraldmanurung.site — challenge tracker + (later) portfolio CMS. Independent Next.js
app, own `package.json`, no npm workspaces. See `docs/planning/MASTER-PLAN.md` and
`docs/planning/EXECUTION-PLAN.md` at the repo root for the full plan.

## Ownership

- `src/**`, `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`,
  `eslint.config.mjs`, `.gitignore`, this file — worker-a (frontend).
- `supabase/**` (migrations, seed, functions, `database.types.ts`) — worker-b (backend).
- `.env`, `.env.example` — orchestrator only.

Never edit outside your own ownership without going through the orchestrator.

## Stack

Next.js 16.2.x App Router, TypeScript strict, Tailwind CSS v4, `@supabase/ssr` (not
`@supabase/auth-helpers`, which is deprecated), `clsx` + `tailwind-merge` via `cn()` in
`lib/utils.ts`. Fonts: `next/font/google` (`Geist` + `Geist_Mono`), same pattern as `apps/web`.

Design tokens: `src/app/globals.css`, ported from `apps/web` minus the `--brand-*` tech-logo
tokens (platform brand colors come from the `platforms.brand_color` column instead) and minus
the marketing navbar's scroll-locking boot sequence (this is an authenticated app shell, not a
landing page).

## Next.js 16 conventions

- The root convention file is `src/proxy.ts` exporting `proxy()`, not `middleware.ts` /
  `middleware()`. `src/lib/supabase/middleware.ts` is an ordinary helper module (not a Next
  convention file) and keeps that name to match the upstream `@supabase/ssr` guide.
- `proxy` always runs on the Node.js runtime — do not add `export const runtime = "edge"`.
- Server actions (`"use server"`) are not separate routes in the proxy matcher chain — check
  auth inside each server action, not just at the proxy layer.

## Auth

Single-owner allowlist. `src/lib/supabase/owner.ts` exports `isOwner(user)`, which checks the
GitHub identity's provider-side id (`identity.id` — `@supabase/auth-js`'s `UserIdentity` type has
no `provider_id` field) against `DASHBOARD_OWNER_GITHUB_ID`. Never trust `user.user_metadata`;
it's user-editable. This check runs both at `auth/callback` and in the `(admin)` layout — it is
UI-level defence in depth. The real boundary is the database's RLS + `is_owner()` (worker-b).

`(admin)/*` routes are gated once, at `src/app/(admin)/layout.tsx` — not per-page.

## Types contract

Import generated Supabase types via `@db/*` → `./supabase/*`. Until worker-b publishes the real
`database.types.ts`, this imports the provisional hand-written copy at
`supabase/database.types.ts` (sourced from `docs/planning/staging/db/types.provisional.ts`).
When the real file lands, rebuild and report any breakage.

## Standing rules

- Never `git commit` or `git push`. Report, don't commit.
- No AI or Claude attribution in any repo-visible content.
- `var(--color-*)` for every color, no hex literals in components.
- `npm install` / `npm run build` from inside `apps/dashboard` only.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
