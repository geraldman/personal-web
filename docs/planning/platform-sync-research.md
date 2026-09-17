# Platform Sync Research — Challenge Tracker (dashboard.geraldmanurung.site)

Research date: 2026-09-02. Sources cited inline; anything not independently verified is marked **unverified**.

---

## Part 1: Platform Sync Matrix

Legend for **Reliability verdict**: A = official API, safe to depend on. B = unofficial but widely used/stable. C = fragile scrape. D = not feasible / prohibited.

### SWE practice platforms

| Platform | API status | Docs/endpoint | Auth | Data available | Rate limits | ToS stance | Verdict |
|---|---|---|---|---|---|---|---|
| **LeetCode** | Unofficial — internal GraphQL endpoint (`leetcode.com/graphql`), no public docs | Community wrappers document it: [alfa-leetcode-api](https://github.com/alfaarghya/alfa-leetcode-api), [leetcode-query npm](https://www.npmjs.com/package/leetcode-query) | None for public profile stats; session cookie for private data | Solved counts by difficulty, badges, contest history, submission calendar; per-problem solved list available via `/:username/solved` style wrappers | Undocumented; wrappers self-impose limits | **LeetCode's own ToS explicitly forbids "crawling," "scraping," or "spidering" any part of the Service** and reverse engineering ([leetcode.com/terms](https://leetcode.com/terms/)) | **C** — works technically, but explicitly against ToS |
| **HackerRank** | No public/official API for personal use. `hackerrank.com/rest/contests/master/hackers/{user}/profile` is an internal REST endpoint used by badge-scraper projects | [HackerRank for Work API](https://www.hackerrank.com/work/apidocs) exists but is for recruiting/Work customers, not personal profile sync | None (public profile scrape) | Badges, level, favorite languages, last submission status | Undocumented | ToS doesn't name scraping explicitly but has a broad "unauthorized use" clause ([hackerrank.com/terms-of-service](https://www.hackerrank.com/terms-of-service/)) — **unverified** whether this covers personal-profile reads | **C** |
| **CodeSignal** | Has official APIs, but aimed at recruiting/assessment customers, not individual practice-history export | [CodeSignal API docs](https://support.codesignal.com/hc/en-us/articles/18050947755031-CodeSignal-APIs) | API key (enterprise) | Assessment/company data, not personal solved-problem history | Unverified | Unverified | **D** for this use case |
| **Codewars** | Official, documented public API (v1) | [dev.codewars.com](https://dev.codewars.com/) — `GET /api/v1/users/{user}/code-challenges/completed?page={n}` | None for public data | Full completed-challenge list with name, slug, completed languages, completedAt date, paginated 200/page | Undocumented numeric limit; API "was never actively developed," v2 has no ETA ([GitHub issue #806](https://github.com/Codewars/codewars.com/issues/806)) | No prohibition found; this is an official, intentionally public endpoint | **A** |
| **Exercism** | Has an API v2 used internally, no comprehensive public docs found | [exercism.org/docs](https://exercism.org/docs); community client [mini_exercism](https://docs.rs/mini_exercism/) | Personal API token | Unverified exact shape of solutions endpoint | Unverified | Unverified | **B** (unverified depth) |
| **CodeChef** | Official API existed at `api.codechef.com` but was **deprecated**; only unofficial scrapers remain | [CodeChef Discuss thread](https://discuss.codechef.com/t/access-to-codechef-api/27308); unofficial: [codechef-api](https://github.com/harshit-budhraja/codechef-api) | None (scrape) | Rating, solved problem links, submission details | None documented | Unofficial scrapers explicitly disclaim CodeChef affiliation — implies no sanctioned access | **C** |
| **Codeforces** | **Official, documented API** | [codeforces.com/apiHelp](https://codeforces.com/apiHelp) — `user.status`, `user.info`, etc. | None for public data; API key+secret from [codeforces.com/settings/api](https://codeforces.com/settings/api) for private data | Full submission history (`user.status`) incl. verdict, problem, time, language | **1 request per 2 seconds**, else `FAILED`/"Call limit exceeded" ([Codeforces blog](https://codeforces.com/blog/entry/108575)) | Official, sanctioned use | **A** |
| **TopCoder** | Official API (v6/v5), oriented around challenges/engagements platform, not classic algorithm-arena solved-history | [engagements-api-v6](https://github.com/topcoder-platform/engagements-api-v6) | JWT (user) or M2M token | Public engagement data; personal classic-arena solved history not clearly exposed | Unverified | Unverified | **B**, weak fit |
| **NeetCode** | No public API found | — | — | — | — | Unverified | **D** — manual entry only |
| **Project Euler** | No public API. Community only posts solutions on GitHub/Kaggle, not an official sync mechanism | — | — | — | — | Unverified, but no official programmatic access exists | **D** — manual entry only |
| **AtCoder** | No official API. Long-standing community tooling (`kenkoooo/AtCoderProblems`) scrapes/mirrors problem and submission data via a third-party service, not the official site directly | [AtCoderProblems API](https://github.com/kenkoooo/AtCoderProblems/blob/master/doc/api.md); [online-judge-tools/api-client](https://github.com/online-judge-tools/api-client) | None for the mirror API | Solved/submission history via the AtCoderProblems mirror, which itself scrapes AtCoder | Community tools "recommend respecting rate limits" — no official statement found | AtCoder has recently drawn controversy for **licensing user submission data to AI companies** ([Codeforces blog discussion](https://codeforces.com/blog/entry/154851)) — no explicit anti-scraping clause found, but treat as **unverified/gray area** | **B** via the AtCoderProblems mirror, **C** if scraping atcoder.jp directly |
| **SPOJ** | Vague reference to "an API" exists but no usable public documentation found | [spoj.com](https://www.spoj.com/) | Unverified | Unverified | Unverified | Unverified | **D** — insufficient info, treat as manual |

### Cybersecurity practice platforms

| Platform | API status | Docs/endpoint | Auth | Data available | Rate limits | ToS stance | Verdict |
|---|---|---|---|---|---|---|---|
| **TryHackMe** | Unofficial-but-stable public-profile endpoint exists and is widely used by badge-generator projects | `GET https://tryhackme.com/api/v2/public-profile/completed-rooms?user={user_id}&limit=16&page=1` (observed in [virtualISP/tryhackme-profile-badge](https://github.com/virtualISP/tryhackme-profile-badge) and similar tools) | None for this public endpoint | Completed rooms list, paginated | Undocumented | **Flag: TryHackMe's Acceptable Use Policy explicitly prohibits accessing the platform via "any bot, crawler, scraper, spider, headless browser, automation framework, AI agent, large language model... or any other automated means, except through an interface expressly provided by TryHackMe"** ([help.tryhackme.com](https://help.tryhackme.com/en/articles/6498330-enterprise-api), AUP referenced in search — recommend the user personally re-read [tryhackme.com/legal/acceptable-use-policy](https://tryhackme.com/legal/acceptable-use-policy) before relying on this) | **B**, but ToS risk — the public-profile endpoint looks like an intentionally exposed feature (it's what badge widgets use), which is arguably "an interface expressly provided," but this is **not certain** — flag to user |
| **HackTheBox** | **Official v4 API with personal App Tokens** | Community-compiled docs: [Propolisa/htb-api-docs](https://github.com/Propolisa/htb-api-docs), [D3vil0p3r/HackTheBox-API](https://github.com/D3vil0p3r/HackTheBox-API); official Enterprise API intro at [enterprise-help.hackthebox.com](https://enterprise-help.hackthebox.com/en/articles/13375637-introduction-to-enterprise-public-api) | **Bearer App Token** — generate under Profile → Profile Settings → App Tokens → Create App Token (name + expiry) | User profile (`GET https://labs.hackthebox.com/api/v4/user/profile/basic/{user_id}`: rank, points, owns), activity, solved machines/challenges | Enterprise API "enforces rate limits ... use filtering/pagination, avoid unnecessary per-resource calls, cache responses" — no numeric limit found for the personal v4 API | **Flag: HTB's Acceptable Use Policy (effective 1 Apr 2026) explicitly prohibits "harvest[ing], aggregat[ing], or compil[ing] data from API responses into any dataset or knowledge base," whether by manual or automated means, beyond ordinary authorized use** ([resources.hackthebox.com AUP PDF](https://resources.hackthebox.com/hubfs/Legal/AUP.pdf)) — storing your own solved-challenge history in a personal tracker DB is very plausibly "ordinary authorised use" of your own account data, but literally building a "dataset" from API responses is the exact phrase the AUP names. **Recommend the user re-read the AUP personally before wiring this up** | **B**, real ToS ambiguity flagged |
| **PicoCTF** | Has an internal API (Flask, OpenAPI docs auto-generated at `/api/v1`), built for the platform's own scoreboard/challenge UI, not published as a stable public integration surface | [picoCTF/docs/api-documentation.md](https://github.com/picoCTF/picoCTF/blob/master/docs/api-documentation.md) | Session-based (site login), CSRF token required on some endpoints | Score, team membership, per-category progress | Unverified | Unverified — no explicit public-API ToS found | **C** |
| **OverTheWire** | No API found | — | — | — | — | Unverified | **D** — manual entry only |
| **VulnHub** | No API — it's a static VM-download archive, no accounts/progress system | — | — | — | — | N/A | **D** — manual entry only |
| **PentesterLab** | No public API found | — | — | — | — | Unverified | **D** — manual entry only |
| **PortSwigger Web Security Academy** | No public API found; progress is tracked only via the account dashboard/Hall of Fame UI | [portswigger.net/web-security](https://portswigger.net/web-security) | — | — | — | General Website Terms of Use exist ([portswigger.net .../website-terms-of-use](https://portswigger.net/web-security/certification/terms-and-conditions/website-terms-of-use)) but specific automated-access language is **unverified** — page content wasn't retrievable in this pass | **D** — manual entry only |
| **CyberDefenders** | No public API found | — | — | — | — | Unverified | **D** — manual entry only |
| **LetsDefend** | Confirmed **no official API, support, or partnership for community data access** | — | — | — | — | N/A (no access to build against) | **D** — manual entry only |
| **Root-Me** | No public API documentation found | — | — | — | — | Unverified | **D** — manual entry only |

### Bug bounty platforms

| Platform | API status | Docs/endpoint | Auth | Data available | Rate limits | ToS stance | Verdict |
|---|---|---|---|---|---|---|---|
| **HackerOne** | **Official, documented API**, including a Hacktivity endpoint (added Mar 2024, sort params documented Jun 2026) | [api.hackerone.com](https://api.hackerone.com/hacker-reference/); [Getting Started](https://api.hackerone.com/getting-started-hacker-api/) | HTTP Basic auth with API username + token | Reports, programs, bounties, earnings; Hacktivity items (state, bounty amount, program, reporter) — this is public disclosure data, not necessarily "your" full submission history in one call, but your own report data is queryable | Unverified numeric limit | Official, sanctioned | **A** |
| **Bugcrowd** | Official documented API | [docs.bugcrowd.com/api/usage](https://docs.bugcrowd.com/api/usage/) | API key | Programs, submissions | Unverified | Official | **A** |
| **Synack** | **No public programs or public API** — invite-only, disclosure goes through a third-party (responsibledisclosure.com) | [synack.com/comparisons/synack-vs-bugcrowd](https://www.synack.com/comparisons/synack-vs-bugcrowd/) | N/A | N/A | N/A | N/A | **D** — manual entry only |

### Worth adding (not in the original list)

| Platform | Why it fits | API status | Verdict |
|---|---|---|---|
| **CTFtime** | Tracks CTF competition results/rankings, not per-challenge, but useful if the user competes in live CTFs | Official, documented JSON API, explicitly "for data analysis and mobile applications only" ([ctftime.org/api](https://ctftime.org/api/)) | **A** for team/event/rating data |
| **Advent of Code** | Annual coding challenge the user may do | Unofficial community libraries exist (session-cookie auth); creator has asked people **not** to build a "new global leaderboard" from the data, and private leaderboards are capped at 200 users ([adventofcode.com/2025/leaderboard/private](https://adventofcode.com/2025/leaderboard/private)) | **B** for personal use, but respect the explicit "don't rebuild the leaderboard" request |
| **Kaggle** | If the user does Kaggle competitions/notebooks alongside CTFs | Official public API, well documented | [kaggle.com/docs/api](https://www.kaggle.com/docs/api) | **A**, but for competitions/datasets, not "challenges solved" in the CTF sense |

---

## Part 2: Recommended Adapter Tiers

**Build now**
- **Codewars** — official API, public, zero ToS risk, full solved-challenge list with dates. Easiest real win.
- **Codeforces** — official API, public, well-documented, clean rate limit (1 req/2s).
- **CTFtime** — official API, if the user wants live-CTF results alongside room/machine solves.

**Build later (technically feasible, but confirm ToS comfort first / lower priority)**
- **HackTheBox** — official App Token auth and real endpoints exist, but the AUP's "no compiling data from API responses into a dataset" clause needs a personal read-through before shipping this, since it's a priority platform. If comfortable, build it — it's the most "official" of the three priority platforms.
- **TryHackMe** — the public-profile completed-rooms endpoint is stable and used by many badge tools, but the AUP's bot/scraper/automation-framework language is broad. Same recommendation: user should personally confirm comfort with the public-profile endpoint before automating it.
- **HackerOne / Bugcrowd** — official, documented, zero ToS risk, but only relevant if the user actually does bug bounty work; low priority unless they do.
- **AtCoder** (via the AtCoderProblems community mirror, not atcoder.jp directly) — reasonably stable, but adds a dependency on a third-party mirror.

**Manual entry only**
- **LeetCode** — technically easy (GraphQL wrappers everywhere), but LeetCode's own ToS explicitly bans crawling/scraping. Given the user is one of the three priority platforms and cares about not violating ToS, **do not build an automated adapter** — manual entry, or revisit only if LeetCode ships an official API.
- HackerRank, CodeChef, TopCoder, NeetCode, Project Euler, SPOJ, PicoCTF, OverTheWire, VulnHub, PentesterLab, PortSwigger, CyberDefenders, LetsDefend, Root-Me, Synack — no reliable/sanctioned programmatic path found.

---

## Part 3: Stack Fact-Check

### Google Gemini — Flash-Lite family
- Current Flash-Lite model IDs (Sept 2026): `gemini-3.5-flash-lite` (newest, released 2026-07-21), `gemini-3.1-flash-lite` (preview), `gemini-2.5-flash-lite` (**being retired 2026-10-16**). ([ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite), [blog.google announcement](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-6-flash-3-5-flash-lite-3-5-flash-cyber/))
- **The user's brief numbers ($0.30/M in, $2.50/M out) match `gemini-3.5-flash-lite` exactly, not a generic "gemini-flash-lite."** Use the exact model ID string **`gemini-3.5-flash-lite`** in code. Do not use `gemini-2.5-flash-lite` — it's being sunset next month (2026-10-16) and would break in production shortly after launch.
  - For reference: `gemini-3.1-flash-lite` is $0.25/M in (text/image/video, $0.50 for audio) / $1.50/M out — cheaper on output but not what the brief specified.
- Free tier on Google AI Studio (per [ai.google.dev/gemini-api/docs/rate-limits](https://ai.google.dev/gemini-api/docs/rate-limits) and corroborating third-party trackers): **Flash-Lite gets ~30 RPM**; Gemini 2.5 Flash gets 15 RPM / 1,500 RPD / 1M TPM. No credit card required, doesn't expire. Note: free-tier prompts may be used by Google for model training (paid tier/Vertex AI are excluded) — worth knowing if any challenge write-ups contain sensitive info. Exact current RPD/TPM specifically for the Flash-Lite tier is **unverified** — check `ai.google.dev/gemini-api/docs/rate-limits` directly at build time since these numbers move often.

### Supabase Edge Functions — scheduling
- Current runtime/deployment: standard Supabase CLI deploy (`supabase functions deploy`); Deno-based Edge Functions, unchanged in kind.
- Scheduled invocation today is **still `pg_cron` + `pg_net`**, not a native external scheduler: `pg_cron` handles the cron schedule inside Postgres, `pg_net` performs the `net.http_post()` call to the function's URL from a SQL job. Credentials for the call should live in Supabase Vault. Official doc: [supabase.com/docs/guides/functions/schedule-functions](https://supabase.com/docs/guides/functions/schedule-functions). There is also a separate "Supabase Cron" product/UI wrapper for this same pg_cron mechanism — [supabase.com/docs/guides/cron](https://supabase.com/docs/guides/cron) / [supabase.com/modules/cron](https://supabase.com/modules/cron) — worth using instead of hand-rolling the SQL if a UI is preferred.

### Supabase free tier limits (as of Sept 2026)
Per multiple 2026 trackers (no single official page enumerates all of these together, cross-referenced — flag as **best-available, not a single primary source**):
- 2 active projects
- 500 MB database storage
- 5 GB database egress + 5 GB cached egress
- 50,000 monthly active users (auth)
- 500,000 Edge Function invocations/month
- 1 GB file storage; 200 concurrent realtime connections, 2M realtime messages/month
- Projects auto-pause after 7 days of inactivity; no backups/SLA/SSO/HIPAA on free tier
- Recommend the user cross-check the live [supabase.com/pricing](https://supabase.com/pricing) page before relying on exact numbers, since these were aggregated from third-party 2026 blog posts rather than one canonical page in this pass.

### Supabase Auth + GitHub OAuth in Next.js App Router
- **`@supabase/ssr` is still the current, recommended package** for server-side/App Router auth — `@supabase/auth-helpers` is deprecated, with all bug fixes/features going to `@supabase/ssr` going forward.
- Current pattern: install `@supabase/supabase-js` + `@supabase/ssr`; GitHub OAuth uses the PKCE flow with a callback Route Handler that exchanges the auth code for a session; a `middleware.ts` at project root refreshes expired auth tokens via cookies (Server Components can't write cookies themselves, so middleware is required for token refresh).
- Official doc: [supabase.com/docs/guides/auth/server-side/nextjs](https://supabase.com/docs/guides/auth/server-side/nextjs) (setup) and [supabase.com/docs/guides/auth/quickstarts/nextjs](https://supabase.com/docs/guides/auth/quickstarts/nextjs) (quickstart) — check these directly for the exact current code snippets since Supabase revises them periodically.

---

## Summary of flags for the user

1. **LeetCode's ToS explicitly forbids scraping/crawling** — despite being one of the three priority platforms and having easy unofficial GraphQL access, recommend **manual entry only**, not an automated adapter.
2. **HackTheBox's AUP** explicitly prohibits "compiling data from API responses into any dataset" — ambiguous as applied to a personal solved-history tracker of your own account, but worth a personal read before building.
3. **TryHackMe's AUP** broadly bans bots/scrapers/"automation frameworks," though the public-profile completed-rooms endpoint looks like an intentionally exposed feature (badge tools use it). Also worth a personal read before automating.
4. **The user's Gemini pricing brief is correct, but only for the newest model** — the exact ID to hardcode is `gemini-3.5-flash-lite`, not `gemini-2.5-flash-lite` (retiring 2026-10-16) or a generic string.
5. Reliability-A platforms with no ToS concerns: **Codewars, Codeforces, HackerOne, Bugcrowd, CTFtime, Kaggle**.
