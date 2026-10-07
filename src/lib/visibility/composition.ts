import { readEnv, requireEnv } from "@/lib/env";
import { createTurnstileVerifier } from "../turnstile";
import { ClaudeVisibilityExplainer } from "./claude-visibility-explainer";
import { createSafeVisibilityFetcher } from "./fetcher";
import type { GenerateVisibilityReportDeps } from "./generate-visibility-report";
import type { VisibilityPipelineDeps } from "./process-visibility-check";
import { DefaultVisibilityChecker } from "./visibility-checker";

export function createVisibilityReportDepsFromEnv(): GenerateVisibilityReportDeps {
  const fetcher = createSafeVisibilityFetcher();
  return {
    checker: new DefaultVisibilityChecker(fetcher),
    explainer: new ClaudeVisibilityExplainer({
      apiKey: requireEnv("ANTHROPIC_API_KEY", "visibility_pipeline_config_error"),
      model: readEnv("ANTHROPIC_MODEL"),
    }),
  };
}

export function createVisibilityPipelineFromEnv(): VisibilityPipelineDeps {
  const reportDeps = createVisibilityReportDepsFromEnv();
  return {
    verifyTurnstile: createTurnstileVerifier(
      requireEnv("TURNSTILE_SECRET_KEY", "visibility_pipeline_config_error"),
    ),
    checker: reportDeps.checker,
    explainer: reportDeps.explainer,
  };
}
