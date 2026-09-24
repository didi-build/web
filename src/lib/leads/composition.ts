import { ClaudeLeadSummarizer } from "./claude-lead-summarizer";
import { LinearLeadSink } from "./linear-lead-sink";
import type { LeadPipelineDeps } from "./process-lead";
import { createTurnstileVerifier } from "./turnstile";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function createLeadPipelineFromEnv(): LeadPipelineDeps {
  return {
    verifyTurnstile: createTurnstileVerifier(requireEnv("TURNSTILE_SECRET_KEY")),
    summarizer: new ClaudeLeadSummarizer({
      apiKey: requireEnv("ANTHROPIC_API_KEY"),
      model: process.env.ANTHROPIC_MODEL,
    }),
    sink: new LinearLeadSink({
      apiKey: requireEnv("LINEAR_API_KEY"),
      teamId: requireEnv("LINEAR_TEAM_ID"),
      projectId: requireEnv("LINEAR_PROJECT_ID"),
      leadLabelId: requireEnv("LINEAR_LEAD_LABEL_ID"),
    }),
  };
}

let testDeps: LeadPipelineDeps | null = null;

/** Test-only hook to inject fakes without touching the route. */
export function __setLeadPipelineTestOverrides(deps: LeadPipelineDeps | null) {
  testDeps = deps;
}

export function getLeadPipelineDeps(): LeadPipelineDeps {
  if (testDeps) {
    return testDeps;
  }
  return createLeadPipelineFromEnv();
}
