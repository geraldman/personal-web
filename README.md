# personal-web

Monorepo for Gerald Manurung's personal sites.

| App | Domain | Status |
| --- | --- | --- |
| [`apps/web`](apps/web) | [geraldmanurung.site](https://geraldmanurung.site) | live |
| `apps/dashboard` | dashboard.geraldmanurung.site | planned — see [docs/planning](docs/planning) |

There are no npm workspaces. Each app is installed, built and deployed independently.

```bash
cd apps/web
npm ci
npm run dev
```

Each app is its own Vercel project, configured with a Root Directory of `apps/<name>` and an
Ignored Build Step so a push touching one app does not rebuild the other.
