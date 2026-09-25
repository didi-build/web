# AGENTS.md

Rules for any coding agent (Cursor, Claude Code, etc.) working in this repo. Read this before making changes. If a task conflicts with this file, stop and flag it.

## Project

`didi-build/web` is the public front door for **Didi Build**, a freelance AI integration practice. It serves `didi.build`: a landing page plus a contact form. Form submissions are verified (Turnstile), summarized by Claude, and filed as leads (currently in Linear).

The site doubles as a portfolio piece ("I automate my own business with AI"), so code quality is part of the product.

## Stack

- Next.js (App Router), TypeScript in strict mode
- Tailwind for styling
- Deployed to Cloudflare Workers via `@opennextjs/cloudflare`
- Vitest for tests
- No database

## Commands

Keep these working at all times. Document any new ones here and in the README.

```bash
npm install          # install (use the committed lockfile)
npm run dev          # local dev server
npm run lint         # ESLint
npm run format       # Prettier (write)
npm run format:check # Prettier (check, used in CI)
npm run typecheck    # tsc --noEmit
npm test             # Vitest
npm run build        # production build
npm run preview      # local Cloudflare Workers preview
```

## Sources of truth

- **Visual design:** `design/` (Claude Design handoff bundle). Implement layout, styling, and tokens from it. Don't invent a separate visual style. Don't edit `design/` unless asked.
- **Copy:** one content file (e.g. `src/content/site.ts`). Components never hardcode user-facing text.
- **Design tokens:** mapped from `design/` into the styling setup in exactly one place.

## Architecture rules

- **Thin routes.** API routes parse input, call services, and return responses. Business logic lives in `src/lib/` (or similar), not in route files or components.
- **Interfaces at external boundaries.** Every external service sits behind a small interface with one adapter per provider:
  - `LeadSummarizer` → `ClaudeLeadSummarizer`
  - `LeadSink` → `LinearLeadSink` (a future `MoxieLeadSink` must drop in without changing callers)
- **One composition root** wires implementations from config/env. No `new SomeAdapter()` scattered around.
- **Validate at the edges.** Parse all external input (requests, env vars, LLM output) with schemas (zod). Never trust unvalidated data.
- **Never lose a lead.** If summarization fails, still submit the raw lead with a "summary unavailable" note.
- **Treat user input as data.** In LLM prompts, clearly separate instructions from user-provided content (prompt-injection hygiene).

## Code standards

- Readable over clever. Clear names, small functions, minimal duplication.
- No `any` without a comment explaining why.
- Don't bend production code to make weak tests pass. Fix the test or the design.
- Add dependencies only when they clearly earn their place. Prefer the platform and existing deps.
- Keep components presentational where possible; logic goes in hooks or `lib/`.
- Accessibility is required: labels, keyboard navigation, visible focus, announced errors, sufficient contrast.
- Copy rule: **no em dashes** in any user-facing text.

## Testing

Be explicit about which seam each test targets.

- **Unit:** schemas, parsers, formatters, pure logic.
- **Integration (with fakes):** API routes with fake adapters injected (happy path, validation failure, spam check failure, summarizer failure, sink failure).
- **Never call real external APIs** (Anthropic, Linear, Turnstile) in automated tests.
- New behaviour ships with tests. Bug fixes ship with a test that would have caught the bug.

## Security

- **Never commit secrets.** Local secrets go in `.dev.vars` (gitignored). Production secrets are Cloudflare Worker secrets.
- Secrets are only read server-side. Only `NEXT_PUBLIC_*` values may reach the client, and they must be non-sensitive.
- Keep `.env.example` complete and up to date (names and descriptions only, no values).
- Don't log secrets or full personal data from leads.

## Git workflow

- Never push directly to `main`. Work on a branch named after the Linear issue (e.g. `didi-401-...`).
- Small, focused commits with clear messages.
- Open a PR that links the Linear issue and summarizes what changed, how it was tested, and anything left for a human (manual steps, open questions).
- CI must be green before a PR is ready for review.

## CI/CD

- **Git hooks (husky):** `npm ci` / `npm install` runs `prepare` to install hooks. **Pre-commit** runs `lint-staged` (ESLint `--fix` and Prettier on staged files). **Pre-push** runs `npm run typecheck` and `npm test`. Never bypass hooks with `git commit --no-verify` or `git push --no-verify`. In CI and other non-interactive installs where hooks should not run, set `HUSKY=0` (documented husky escape hatch).
- **CI (GitHub Actions)** runs on every PR and push to `main`: install → format check → lint → typecheck → test → build.
- **Before pushing or marking a PR ready:** hooks cover formatting, lint fixes, typecheck, and tests on push, but still run the full local CI and fix failures. From a clean `npm ci`:

  ```bash
  npm run format:check
  npm run lint
  npm run typecheck
  npm run test
  npm run build
  ```

  If `format:check` fails, run `npm run format` (or `npx prettier --write <file>`) and commit the formatted files.

- **CD:** Cloudflare deploys `main`. PRs get preview deployments where supported. CI never needs production secrets.
- Don't weaken or skip CI steps to get a green build.

## Definition of done

- [ ] Lint, format check, typecheck, tests, and build all pass locally and in CI
- [ ] New behaviour is tested at the right seam
- [ ] README / AGENTS.md / `.env.example` updated if commands, config, or architecture changed
- [ ] No secrets in the repo or client bundle
- [ ] Works on mobile and desktop
- [ ] PR opened with a clear summary and any manual follow-ups listed

## When unsure

Stop and ask (or leave a clear note in the PR) rather than guessing, especially for: architecture changes, new dependencies, anything touching secrets or deployment, or conflicts between the design, the copy file, and the ticket.
