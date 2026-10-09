# didi-build/web

Public site for [Didi Build](https://didi.build): a founders-focused landing page. Booking CTAs go to `/book`, which redirects to the configured scheduler URL.

See [AGENTS.md](./AGENTS.md) for repo rules and architecture.

## Stack

- Next.js (App Router) + TypeScript (strict)
- Tailwind CSS v4 (design tokens in `src/app/globals.css`, sourced from `design/web.dc.html`)
- Deployed to Cloudflare Workers via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare)

## Local development

```bash
npm ci
cp .env.example .env.local
npm run dev
```

`npm ci` installs [husky](https://typicode.github.io/husky/) git hooks: pre-commit runs lint-staged (ESLint + Prettier on staged files); pre-push runs typecheck and tests. Do not use `--no-verify`. Set `HUSKY=0` only in environments that must skip hook installation (e.g. some CI/build images).

Open [http://localhost:3000](http://localhost:3000).

For the full Workers runtime locally (including secrets from `.dev.vars`):

```bash
cp .dev.vars.example .dev.vars
# fill in secrets
cp .env.example .env.local
# NEXT_PUBLIC_TURNSTILE_SITE_KEY is required for the visibility tool (see below)
npm run preview
```

### Turnstile test keys (local)

Cloudflare documents always-pass test keys for development:

| Kind   | Value                                 |
| ------ | ------------------------------------- |
| Site   | `1x00000000000000000000AA`            |
| Secret | `1x0000000000000000000000000000000AA` |

Put the site key in `.env.local` as `NEXT_PUBLIC_TURNSTILE_SITE_KEY` for both `npm run dev` and `npm run preview` if you use the visibility checker. Preview runs a production build, so the site key must be present at build time when testing that page.

## Environment variables

| Variable                         | Where       | Purpose                                                   |
| -------------------------------- | ----------- | --------------------------------------------------------- |
| `ANTHROPIC_API_KEY`              | server      | Claude API key for visibility explanations                |
| `ANTHROPIC_MODEL`                | server      | Model id (default in code if unset; Worker secret or var) |
| `TURNSTILE_SECRET_KEY`           | server      | Turnstile secret for `/api/visibility-check`              |
| `BOOKING_URL`                    | server      | HTTPS scheduler URL for `GET /book` redirect              |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | build + dev | Turnstile site key for the visibility tool                |

**Server secrets** (`ANTHROPIC_API_KEY`, `TURNSTILE_SECRET_KEY`, etc.): Cloudflare **Worker secrets** in production; `.dev.vars` for `npm run preview` (gitignored).

**`BOOKING_URL`:** Also set in `wrangler.jsonc` `vars` for production. If missing or invalid, `/book` falls back to the homepage.

**`NEXT_PUBLIC_TURNSTILE_SITE_KEY`:** Next.js inlines this at **build time**, not at request time. Set it in Cloudflare **Workers Builds** environment variables when you need the visibility tool in deployed builds.

Never commit real secrets.

## Scripts

| Script                                     | Description                                |
| ------------------------------------------ | ------------------------------------------ |
| `npm run dev`                              | Next.js dev server                         |
| `npm run build`                            | Production Next.js build                   |
| `npm run preview`                          | OpenNext build + local Workers preview     |
| `npm run deploy`                           | OpenNext build + deploy to Cloudflare      |
| `npm run deploy:hi-consumer`               | Deploy `hi-followup-email-consumer` Worker |
| `npm run lint` / `format` / `format:check` | ESLint + Prettier                          |
| `npm run typecheck`                        | `tsc --noEmit`                             |
| `npm run test`                             | Vitest                                     |

Pre-commit and pre-push hooks (see Local development) run a subset of these automatically; CI still runs the full pipeline including `build`.

## Design

UI is implemented from `design/web.dc.html` (single design export). Marketing copy lives in `src/content/site.ts`.

## Website visibility checker

`POST /api/visibility-check` accepts a public `http`/`https` URL plus a Turnstile token, runs deterministic fetch-only checks in `src/lib/visibility/`, and returns a JSON report (findings plus a Claude-written summary). If explanation fails, findings are still returned with a fallback summary.

A functional preview page lives at `/tools/visibility-check` (not linked from the homepage, `noindex`, omitted from the sitemap).

## CI

GitHub Actions runs on pushes to `main` and on pull requests: format check, lint, typecheck, test, build (no production secrets required).

## Deploy

Cloudflare deploys from `main` after the repo is connected in the dashboard. Use `npm run deploy` for manual deploys with Wrangler authenticated.

Before deploy:

1. Set **build-time** env in Workers Builds if you use the visibility tool: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
2. Set **Worker secrets** for server-side keys (`ANTHROPIC_API_KEY`, `TURNSTILE_SECRET_KEY`, etc.).
3. Set `BOOKING_URL` (or use `wrangler.jsonc` vars).
4. Attach custom domains (`didi.build`, etc.) in the Cloudflare dashboard.
