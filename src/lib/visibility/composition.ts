import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createTurnstileVerifier } from "../leads/turnstile";
import { ClaudeVisibilityExplainer } from "./claude-visibility-explainer";
import { createSafeVisibilityFetcher } from "./fetcher";
import type { GenerateVisibilityReportDeps } from "./generate-visibility-report";
import type { VisibilityPipelineDeps } from "./process-visibility-check";
import { DefaultVisibilityChecker } from "./visibility-checker";

function readEnv(name: string): string | undefined {
  const fromProcess = process.env[name];
  if (fromProcess) {
    return fromProcess;
  }
  try {
    const env = getCloudflareContext().env as Record<string, unknown>;
    const value = env[name];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  } catch {
    // Outside Cloudflare Workers runtime (e.g. unit tests, static analysis).
  }
  return undefined;
}

function requireEnv(name: string): string {
  const value = readEnv(name);
  if (!value) {
    const message = `Missing required environment variable: ${name}`;
    console.error("visibility_pipeline_config_error", message);
    throw new Error(message);
  }
  return value;
}

export function createVisibilityReportDepsFromEnv(): GenerateVisibilityReportDeps {
  const fetcher = createSafeVisibilityFetcher();
  return {
    checker: new DefaultVisibilityChecker(fetcher),
    explainer: new ClaudeVisibilityExplainer({
      apiKey: requireEnv("ANTHROPIC_API_KEY"),
      model: readEnv("ANTHROPIC_MODEL"),
    }),
  };
}

export function createVisibilityPipelineFromEnv(): VisibilityPipelineDeps {
  const reportDeps = createVisibilityReportDepsFromEnv();
  return {
    verifyTurnstile: createTurnstileVerifier(requireEnv("TURNSTILE_SECRET_KEY")),
    checker: reportDeps.checker,
    explainer: reportDeps.explainer,
  };
}
