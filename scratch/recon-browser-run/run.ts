/**
 * DIDI-469 spike: compare local raw fetch vs Cloudflare Browser Run /content (default wait).
 *
 * Usage (from repo root):
 *   CF_ACCOUNT_ID=... CF_API_TOKEN=... npx tsx scratch/recon-browser-run/run.ts
 *
 * API: POST .../accounts/{id}/browser-run/content (see developers.cloudflare.com/browser-run/quick-actions/content-endpoint/)
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { measureHtml } from "./html-metrics";
import { describeBotChallenge } from "./challenge-label";
import { fetchPageSpeed, type PageSpeedResult } from "./pagespeed";
import { TEST_TARGETS, type TestTarget } from "./urls";

const GAP_MS = 12_000;
const RAW_FETCH_TIMEOUT_MS = 30_000;
const BROWSER_RUN_ENDPOINT_SUFFIX = "/browser-run/content";

type ViewKind = "local_raw" | "browser_run";

type ViewResult = {
  kind: ViewKind;
  label: string;
  httpStatus: number | null;
  error: string | null;
  metrics: HtmlMetrics | null;
  challenge: { detected: boolean; signature: string | null };
  browserMsUsed: number | null;
  wallClockMs: number | null;
};

type HtmlMetrics = import("./html-metrics").HtmlMetrics;

type UrlRunResult = {
  target: TestTarget;
  raw: ViewResult;
  rendered: ViewResult;
  pageSpeed: PageSpeedResult;
  verdict: "rendered got real content" | "rendered got challenged" | "error";
};

type WorkersPlanReport = {
  plan: "Free" | "Paid" | "unknown";
  detail: string;
};

type RunOutput = {
  ranAt: string;
  browserRunEndpoint: string;
  workersPlan: WorkersPlanReport;
  rateLimit429Count: number;
  targets: UrlRunResult[];
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function headersToRecord(headers: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  headers.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

async function fetchRaw(url: string): Promise<ViewResult> {
  const started = Date.now();
  const label = "local raw (not a datacenter IP)";
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(RAW_FETCH_TIMEOUT_MS),
    });
    const body = await response.text();
    const headers = headersToRecord(response.headers);
    const metrics = measureHtml(body);
    const challenge = describeBotChallenge(body, headers);
    return {
      kind: "local_raw",
      label,
      httpStatus: response.status,
      error: null,
      metrics,
      challenge,
      browserMsUsed: null,
      wallClockMs: Date.now() - started,
    };
  } catch (err) {
    return {
      kind: "local_raw",
      label,
      httpStatus: null,
      error: err instanceof Error ? err.message : String(err),
      metrics: null,
      challenge: { detected: false, signature: null },
      browserMsUsed: null,
      wallClockMs: Date.now() - started,
    };
  }
}

type BrowserRunApiResponse = {
  success: boolean;
  result?: string;
  errors?: Array<{ code: number; message: string }>;
  meta?: {
    status?: number;
    title?: string;
    headers?: Record<string, string>;
    finalUrl?: string;
  };
};

async function fetchBrowserRun(
  accountId: string,
  apiToken: string,
  url: string,
): Promise<{ view: ViewResult; was429: boolean }> {
  const started = Date.now();
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}${BROWSER_RUN_ENDPOINT_SUFFIX}`;
  let was429 = false;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(120_000),
    });

    if (response.status === 429) {
      was429 = true;
    }

    const browserMsHeader = response.headers.get("X-Browser-Ms-Used");
    const browserMsUsed =
      browserMsHeader !== null && browserMsHeader !== "" ? Number(browserMsHeader) : null;

    const payload = (await response.json()) as BrowserRunApiResponse;
    const wallClockMs = Date.now() - started;

    if (!response.ok || !payload.success) {
      const message =
        payload.errors?.map((e) => `${e.code}: ${e.message}`).join("; ") ||
        `HTTP ${response.status}`;
      return {
        was429,
        view: {
          kind: "browser_run",
          label: "Browser Run /content (default waitUntil)",
          httpStatus: response.status,
          error: message,
          metrics: null,
          challenge: { detected: false, signature: null },
          browserMsUsed: Number.isFinite(browserMsUsed) ? browserMsUsed : null,
          wallClockMs,
        },
      };
    }

    const html = payload.result ?? "";
    const originStatus = payload.meta?.status ?? response.status;
    const metaHeaders = payload.meta?.headers ?? {};
    const metrics = measureHtml(html);
    const challenge = describeBotChallenge(html, metaHeaders);

    return {
      was429,
      view: {
        kind: "browser_run",
        label: "Browser Run /content (default waitUntil)",
        httpStatus: originStatus,
        error: null,
        metrics,
        challenge,
        browserMsUsed: Number.isFinite(browserMsUsed) ? browserMsUsed : null,
        wallClockMs,
      },
    };
  } catch (err) {
    return {
      was429,
      view: {
        kind: "browser_run",
        label: "Browser Run /content (default waitUntil)",
        httpStatus: null,
        error: err instanceof Error ? err.message : String(err),
        metrics: null,
        challenge: { detected: false, signature: null },
        browserMsUsed: null,
        wallClockMs: Date.now() - started,
      },
    };
  }
}

async function detectWorkersPlan(accountId: string, apiToken: string): Promise<WorkersPlanReport> {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/subscriptions`,
      {
        headers: { Authorization: `Bearer ${apiToken}` },
        signal: AbortSignal.timeout(30_000),
      },
    );
    const data = (await response.json()) as {
      success: boolean;
      result?: Array<{
        rate_plan?: { id?: string; public_name?: string; scope?: string };
        component_values?: Array<{ name?: string; value?: string }>;
      }>;
    };

    if (!response.ok || !data.success || !data.result) {
      return {
        plan: "unknown",
        detail: `Could not list subscriptions (HTTP ${response.status})`,
      };
    }

    const workersPaid = data.result.some((sub) => {
      const id = sub.rate_plan?.id?.toLowerCase() ?? "";
      const name = sub.rate_plan?.public_name?.toLowerCase() ?? "";
      return (
        id === "workers_paid" ||
        (id.includes("workers") && (id.includes("paid") || name.includes("paid")))
      );
    });

    if (workersPaid) {
      return { plan: "Paid", detail: "Account subscription includes Workers Paid" };
    }

    const anyWorkers = data.result.some((sub) => {
      const id = sub.rate_plan?.id?.toLowerCase() ?? "";
      return id.includes("workers");
    });

    if (anyWorkers) {
      return {
        plan: "Free",
        detail: "Workers-related subscription found without paid plan id",
      };
    }

    return {
      plan: "Free",
      detail:
        "No Workers Paid subscription listed; assuming Workers Free (Browser Run free tier limits)",
    };
  } catch (err) {
    return {
      plan: "unknown",
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

function verdictFor(raw: ViewResult, rendered: ViewResult): UrlRunResult["verdict"] {
  if (rendered.error) {
    return "error";
  }
  if (rendered.challenge.detected) {
    return "rendered got challenged";
  }
  return "rendered got real content";
}

function formatMetrics(m: HtmlMetrics | null): string {
  if (!m) {
    return "—";
  }
  return [
    `bytes=${m.byteLength}`,
    `text=${m.visibleTextLength}`,
    `title=${m.title ? JSON.stringify(m.title) : "—"}`,
    `h1=${m.h1Count}`,
    `jsonld=${m.jsonLdPresent ? "y" : "n"}`,
  ].join(", ");
}

function formatChallenge(c: { detected: boolean; signature: string | null }): string {
  return c.detected ? `y (${c.signature})` : "n";
}

function printMarkdownTable(results: UrlRunResult[], plan: WorkersPlanReport, rate429: number) {
  console.log("\n## Browser Run recon (DIDI-469)\n");
  console.log(`- **Workers plan:** ${plan.plan} — ${plan.detail}`);
  console.log(`- **429 responses:** ${rate429}`);
  console.log(`- **Endpoint:** \`.../accounts/<id>${BROWSER_RUN_ENDPOINT_SUFFIX}\`\n`);

  for (const row of results) {
    console.log(`### ${row.target.label} — ${row.target.url}\n`);
    console.log(`_${row.target.platformNote}_\n`);
    console.log("| View | HTTP | Metrics | Challenge | Extra |");
    console.log("| --- | --- | --- | --- | --- |");

    for (const view of [row.raw, row.rendered]) {
      const extra =
        view.kind === "browser_run"
          ? `X-Browser-Ms-Used=${view.browserMsUsed ?? "—"}, wall=${view.wallClockMs ?? "—"}ms`
          : view.error
            ? `error: ${view.error}`
            : `wall=${view.wallClockMs ?? "—"}ms`;
      const status =
        view.error && view.httpStatus === null ? "err" : String(view.httpStatus ?? "—");
      const metrics = view.error && !view.metrics ? view.error : formatMetrics(view.metrics);
      console.log(
        `| ${view.label} | ${status} | ${metrics} | ${formatChallenge(view.challenge)} | ${extra} |`,
      );
    }
    console.log(`\n**Verdict:** ${row.verdict}\n`);

    const psi = row.pageSpeed;
    console.log("#### PageSpeed Insights (mobile, SEO + performance)\n");
    if (psi.apiError) {
      console.log(`API error (HTTP ${psi.httpStatus}): ${psi.apiError}\n`);
      continue;
    }
    console.log("| Field | Value |");
    console.log("| --- | --- |");
    console.log(`| Wall-clock | ${psi.wallClockMs}ms |`);
    console.log(`| captchaResult | ${psi.captchaResult ?? "—"} |`);
    console.log(
      `| runtimeError | ${psi.runtimeError ? `${psi.runtimeError.code}: ${psi.runtimeError.message}` : "—"} |`,
    );
    console.log(
      `| Final document HTTP (network-requests) | ${psi.finalDocumentHttpStatus ?? "—"} |`,
    );
    console.log(
      `| Screenshot challenge? | ${psi.screenshotLooksLikeChallenge ? "yes" : "no"}${psi.screenshotChallengeReasons.length ? ` (${psi.screenshotChallengeReasons.join("; ")})` : ""} |`,
    );
    console.log(`| Screenshot file | ${psi.finalScreenshotPath ?? "—"} |`);
    console.log(`| SEO score | ${psi.seoScore ?? "—"} |`);
    console.log(`| SEO audit IDs | ${psi.seoAuditIds.join(", ") || "—"} |`);
    console.log("");
  }
}

async function main(): Promise<void> {
  const accountId = process.env.CF_ACCOUNT_ID;
  const apiToken = process.env.CF_API_TOKEN;

  if (!accountId || !apiToken) {
    console.error("Missing CF_ACCOUNT_ID or CF_API_TOKEN in the environment.");
    process.exit(1);
  }

  const workersPlan = await detectWorkersPlan(accountId, apiToken);
  let rateLimit429Count = 0;
  const targets: UrlRunResult[] = [];
  const outDir = join(import.meta.dirname);
  const screenshotsDir = join(outDir, "screenshots");

  for (let i = 0; i < TEST_TARGETS.length; i++) {
    const target = TEST_TARGETS[i];
    console.log(`[${i + 1}/${TEST_TARGETS.length}] ${target.url}`);

    const raw = await fetchRaw(target.url);
    await sleep(GAP_MS);

    const { view: rendered, was429 } = await fetchBrowserRun(accountId, apiToken, target.url);
    if (was429) {
      rateLimit429Count += 1;
    }

    await sleep(GAP_MS);

    const pageSpeed = await fetchPageSpeed(target.url, screenshotsDir, target.category);

    targets.push({
      target,
      raw,
      rendered,
      pageSpeed,
      verdict: verdictFor(raw, rendered),
    });

    if (i < TEST_TARGETS.length - 1) {
      await sleep(GAP_MS);
    }
  }

  const output: RunOutput = {
    ranAt: new Date().toISOString(),
    browserRunEndpoint: `https://api.cloudflare.com/client/v4/accounts/{accountId}${BROWSER_RUN_ENDPOINT_SUFFIX}`,
    workersPlan,
    rateLimit429Count,
    targets,
  };

  writeFileSync(join(outDir, "results.json"), `${JSON.stringify(output, null, 2)}\n`, "utf8");

  printMarkdownTable(targets, workersPlan, rateLimit429Count);
  console.log(`\nWrote ${join(outDir, "results.json")}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
