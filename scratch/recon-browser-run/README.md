# Browser Run recon (DIDI-469)

Throwaway spike script. Not part of CI or production.

## Prerequisites

- Cloudflare API token with **Browser Rendering - Edit** (Quick Actions).
- `CF_ACCOUNT_ID` and `CF_API_TOKEN` in the environment.

## Run

From the repo root:

```bash
CF_ACCOUNT_ID=... CF_API_TOKEN=... npx tsx scratch/recon-browser-run/run.ts
```

Requests are sequential with a **12s** pause between each step (raw fetch, Browser Run, and PageSpeed) to stay under the Free plan Quick Actions rate limit (~1 req / 10s).

Each URL also calls the public PageSpeed Insights API (no API key):

`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=...&strategy=mobile&category=seo&category=performance`

PageSpeed captures `captchaResult`, Lighthouse `runtimeError`, final document HTTP status from the `network-requests` audit, SEO score and SEO audit IDs, and saves the `final-screenshot` audit to `screenshots/` (gitignored).

## Output

- Markdown table on stdout
- `results.json` in this directory (gitignored)
- `screenshots/<category>-final.jpg` (gitignored)

## URLs

Edit `urls.ts` before running if you want different examples. Defaults:

| Category              | URL                            |
| --------------------- | ------------------------------ |
| SiteGround challenged | https://thrivehivestudio.ca    |
| Wix                   | https://www.drlisathompson.com |
| Squarespace           | https://www.kinfield.com       |
| Client SPA            | https://react.dev              |

Browser Run endpoint: `POST /client/v4/accounts/{account_id}/browser-run/content` with body `{ "url": "..." }` only (default `gotoOptions.waitUntil` = `domcontentloaded` per Cloudflare docs).
