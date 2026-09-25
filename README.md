# didi-build/web

Public site for [Didi Build](https://didi.build): a landing page and contact form. Submissions are verified with Cloudflare Turnstile, summarized with Claude, and filed as Linear issues.

See [AGENTS.md](./AGENTS.md) for repo rules and architecture.

## Stack

- Next.js (App Router) + TypeScript (strict)
- Tailwind CSS v4 (tokens from `design/HANDOFF.md`)
- Deployed to Cloudflare Workers via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare)

## Local development

```bash
npm ci
cp .env.example .env.local   # optional for `next dev` if you wire env manually
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For the full Workers runtime locally (including secrets from `.dev.vars`):

```bash
cp .dev.vars.example .dev.vars
# fill in secrets
npm run preview
```

## Environment variables

| Variable                         | Where       | Purpose                                                    |
| -------------------------------- | ----------- | ---------------------------------------------------------- |
| `ANTHROPIC_API_KEY`              | server      | Claude API key for lead summaries (Worker secret)          |
| `ANTHROPIC_MODEL`                | server      | Model id (default in code if unset; Worker secret or var)  |
| `LINEAR_API_KEY`                 | server      | Linear API key for `issueCreate` (Worker secret)           |
| `LINEAR_TEAM_ID`                 | server      | Linear team id (Worker secret or var)                      |
| `LINEAR_PROJECT_ID`              | server      | Linear project id (Worker secret or var)                   |
| `LINEAR_LEAD_LABEL_ID`           | server      | Linear label id for leads (Worker secret or var)           |
| `TURNSTILE_SECRET_KEY`           | server      | Turnstile secret for `/api/leads` (Worker secret)          |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | build + dev | Turnstile site key (inlined at **build time**; see Deploy) |

**Server secrets** (`ANTHROPIC_API_KEY`, `TURNSTILE_SECRET_KEY`, Linear vars, etc.): Cloudflare **Worker secrets** in production; `.dev.vars` for `npm run preview` (gitignored).

**`NEXT_PUBLIC_TURNSTILE_SITE_KEY`:** Next.js inlines this at **build time**, not at request time. Set it in Cloudflare **Workers Builds** environment variables (and in `.env.local` for `npm run dev`). Setting it only as a runtime Worker var will ship a build without the Turnstile widget.

Never commit real secrets.

## Scripts

| Script                                     | Description                            |
| ------------------------------------------ | -------------------------------------- |
| `npm run dev`                              | Next.js dev server                     |
| `npm run build`                            | Production Next.js build               |
| `npm run preview`                          | OpenNext build + local Workers preview |
| `npm run deploy`                           | OpenNext build + deploy to Cloudflare  |
| `npm run lint` / `format` / `format:check` | ESLint + Prettier                      |
| `npm run typecheck`                        | `tsc --noEmit`                         |
| `npm run test`                             | Vitest                                 |

## Design

UI is implemented from the handoff in `design/` (`Didi Build.dc.html`, `HANDOFF.md`). Marketing copy lives in `src/content/site.ts`.

## Lead pipeline

`POST /api/leads` validates input, verifies Turnstile, summarizes via `ClaudeLeadSummarizer`, and submits through `LinearLeadSink`. If summarization fails, the raw lead is still submitted with a "summary unavailable" note.

## CI

GitHub Actions runs on pushes to `main` and on pull requests: format check, lint, typecheck, test, build (no production secrets required).

## Deploy

Cloudflare deploys from `main` after the repo is connected in the dashboard. Use `npm run deploy` for manual deploys with Wrangler authenticated.

Before deploy:

1. Set **build-time** env in Workers Builds: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (required for the form widget).
2. Set **Worker secrets** for server-side keys (`ANTHROPIC_API_KEY`, `TURNSTILE_SECRET_KEY`, Linear IDs, etc.).
3. Attach custom domains (`didi.build`, etc.) in the Cloudflare dashboard.
