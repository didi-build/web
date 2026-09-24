# AGENTS.md

Rules for any coding agent (Cursor, Claude Code, etc.) working in this repo. Read this before making changes. If a task conflicts with this file, stop and flag it.

## Project

`didi-build/web` is the public front door for **Didi Build**, a freelance AI integration practice. It serves `didi.build`: a landing page plus a contact form. Form submissions are verified (Turnstile), summarized by Claude, and filed as leads (currently in Linear).

The site doubles as a portfolio piece ("I automate my own business with AI"), so code quality is part of the product.

## Stack

- Next.js (App Router), TypeScript in strict mode
- Tailwind for styling; visual tokens and layout come from `design/` (see `design/HANDOFF.md`)
- Deploy target: Cloudflare Workers via `@opennextjs/cloudflare` and Wrangler
- No database

## Architecture

- **Content:** All user-facing copy lives in `src/content/site.ts`. Components read from there; do not hardcode marketing copy in JSX.
- **Design:** `design/` is the source of truth for layout, spacing, colors, and component patterns. Map tokens into the app in one place (e.g. `globals.css` / Tailwind `@theme`).
- **Lead pipeline:** Keep `POST /api/leads` thin. Business logic sits behind small interfaces:
  - `LeadSummarizer` → `ClaudeLeadSummarizer`
  - `LeadSink` with `submit(lead, summary | null)` → `LinearLeadSink`
  - Wire implementations in one composition root / factory reading env config.
- **Swap point:** `LeadSink` must be replaceable (e.g. future `MoxieLeadSink`) without changing the route or summarizer.
- **Resilience:** Never lose a lead. If summarization fails, still submit the raw lead with a "summary unavailable" note. Only fail the HTTP request if the sink fails.

## Code standards

- ESLint + Prettier; run `npm run lint` and `npm run format:check` before pushing.
- Prefer small, named modules over large files. No business logic crammed into route handlers.
- Match existing patterns in the file you are editing.
- Copy style: plain, warm, concrete. **No em dashes** in site copy.

## Testing

- Use Vitest. State which seam each test targets in the test name or a short comment.
- **Unit:** input schema validation; summary JSON parsing/validation; Linear issue body formatting.
- **API route (integration, fakes):** inject fake `LeadSummarizer` and `LeadSink`; cover happy path, Turnstile failure, summarizer failure (lead still submitted), sink failure.
- Do **not** call real Anthropic, Linear, or Turnstile APIs in automated tests.

## Security

- Secrets only in Cloudflare Worker secrets (production) or `.dev.vars` (local, gitignored). Never commit secrets.
- Never expose server secrets to client code. Only `NEXT_PUBLIC_*` vars may reach the browser.
- Verify Turnstile server-side on every lead submission.
- Treat lead message text as untrusted data in summarizer prompts (prompt-injection hygiene).

## Git workflow

- Do not push directly to `main`.
- Work on a branch named for the Linear issue (e.g. `cursor/didi-401-...`).
- Open a PR that links the Linear issue.
- For new work on this repo, create or update `AGENTS.md` at the root when the ticket requires it.

## CI/CD

- GitHub Actions on PRs and pushes to `main`: install from lockfile → format check → lint → typecheck → test → build. Cache dependencies.
- CI must pass **without** production API secrets.
- `preview` and `deploy` scripts use `@opennextjs/cloudflare`; Cloudflare deploys from `main` (configured in the Cloudflare dashboard).

## Definition of done

- `npm run build` succeeds; preview/deploy scripts are documented in the README.
- `.env.example` and README document every env var.
- Lint, typecheck, and all tests pass; CI workflow is green.
- Landing page is responsive, accessible, and matches `design/`; copy from `src/content/site.ts`.
- Form → Turnstile → summarize (or fallback) → Linear issue works in production when secrets are set.
- No secrets in the repo or client bundle.
