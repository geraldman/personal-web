# personal-web — monorepo root

Two independent Next.js apps in one repository. **There are no npm workspaces.** Each app has
its own `package.json` and `node_modules`, and each is a separate Vercel project with its own
Root Directory.

```
apps/
  web/         geraldmanurung.site              — the portfolio (live)
  dashboard/   dashboard.geraldmanurung.site    — challenge tracker + portfolio CMS (not built yet)
docs/planning/ plan of record for the dashboard build
```

## Read the right file

Guidance is per-app. Do not apply one app's conventions to the other.

| Working in | Read |
|---|---|
| `apps/web/**` | `apps/web/AGENTS.md` |
| `apps/dashboard/**` | `apps/dashboard/AGENTS.md` (created in Phase 2) |
| Planning / architecture | `docs/planning/MASTER-PLAN.md` |

`docs/planning/design-system-audit.md` documents the **real** design system, verified against
`apps/web/src/app/globals.css`. It is the source of truth for any design claim.

## Rules that apply everywhere

- Run npm commands from inside an app directory, never from the root — there is no root
  `package.json`, and `npm install` at the root is always a mistake.
- Never commit `.env*`. Secrets live in Vercel env vars or Supabase Vault.
- Both Vercel projects use an Ignored Build Step (`git diff --quiet HEAD^ HEAD -- .`) so a push
  touching one app does not rebuild the other.
- No AI or assistant attribution in commits, comments, or any repo-visible content.
