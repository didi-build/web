import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ClaudeLeadSummarizer } from "./claude-lead-summarizer";
import { LinearLeadSink } from "./linear-lead-sink";
import type { LeadPipelineDeps } from "./process-lead";
import { createTurnstileVerifier } from "./turnstile";

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
    console.error("lead_pipeline_config_error", message);
    throw new Error(message);
  }
  return value;
}

export function createLeadPipelineFromEnv(): LeadPipelineDeps {
  return {
    verifyTurnstile: createTurnstileVerifier(requireEnv("TURNSTILE_SECRET_KEY")),
    summarizer: new ClaudeLeadSummarizer({
      apiKey: requireEnv("ANTHROPIC_API_KEY"),
      model: readEnv("ANTHROPIC_MODEL"),
    }),
    sink: new LinearLeadSink({
      apiKey: requireEnv("LINEAR_API_KEY"),
      teamId: requireEnv("LINEAR_TEAM_ID"),
      projectId: requireEnv("LINEAR_PROJECT_ID"),
      leadLabelId: requireEnv("LINEAR_LEAD_LABEL_ID"),
    }),
  };
}
