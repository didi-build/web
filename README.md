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

| Variable                         | Where  | Purpose                                |
| -------------------------------- | ------ | -------------------------------------- |
| `ANTHROPIC_API_KEY`              | server | Claude API key for lead summaries      |
| `ANTHROPIC_MODEL`                | server | Model id (default in code if unset)    |
| `LINEAR_API_KEY`                 | server | Linear API key for `issueCreate`       |
| `LINEAR_TEAM_ID`                 | server | Linear team id                         |
| `LINEAR_PROJECT_ID`              | server | Linear project id                      |
| `LINEAR_LEAD_LABEL_ID`           | server | Linear label id for leads              |
| `TURNSTILE_SECRET_KEY`           | server | Turnstile secret for `/api/leads`      |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | client | Turnstile site key for the form widget |

Production: set these as **Cloudflare Worker secrets** (and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` as a Worker var). Local preview: use `.dev.vars` (gitignored).

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
