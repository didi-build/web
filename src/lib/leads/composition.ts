import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ClaudeLeadSummarizer } from "./claude-lead-summarizer";
import { CompositeLeadSink } from "./composite-lead-sink";
import { EmailLeadSink, type EmailLeadSinkConfig } from "./email-lead-sink";
import { LinearLeadSink } from "./linear-lead-sink";
import type { LeadPipelineDeps } from "./process-lead";
import type { LeadSink } from "./types";
import { createTurnstileVerifier } from "./turnstile";
import { createVisibilityReportDepsFromEnv } from "../visibility/composition";

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

let emailSinkDisabledLogged = false;

export function resetLeadEmailSinkDisabledLogForTests(): void {
  emailSinkDisabledLogged = false;
}

function readEmailLeadSinkConfig(): EmailLeadSinkConfig | null {
  const serviceAccountJson = readEnv("GMAIL_SERVICE_ACCOUNT_JSON");
  const senderEmail = readEnv("GMAIL_SENDER");
  const toEmail = readEnv("LEAD_EMAIL_TO");
  if (serviceAccountJson && senderEmail && toEmail) {
    return { serviceAccountJson, senderEmail, toEmail };
  }
  return null;
}

export function createLeadDeliverySinkFromEnv(linearSink: LeadSink): LeadSink {
  const emailConfig = readEmailLeadSinkConfig();
  if (!emailConfig) {
    if (!emailSinkDisabledLogged) {
      console.info("lead_email_sink_disabled");
      emailSinkDisabledLogged = true;
    }
    return linearSink;
  }

  return new CompositeLeadSink([
    { name: "linear", sink: linearSink },
    { name: "email", sink: new EmailLeadSink(emailConfig) },
  ]);
}

export function createLeadPipelineFromEnv(): LeadPipelineDeps {
  const linearSink = new LinearLeadSink({
    apiKey: requireEnv("LINEAR_API_KEY"),
    teamId: requireEnv("LINEAR_TEAM_ID"),
    projectId: requireEnv("LINEAR_PROJECT_ID"),
    leadLabelId: requireEnv("LINEAR_LEAD_LABEL_ID"),
  });

  return {
    verifyTurnstile: createTurnstileVerifier(requireEnv("TURNSTILE_SECRET_KEY")),
    summarizer: new ClaudeLeadSummarizer({
      apiKey: requireEnv("ANTHROPIC_API_KEY"),
      model: readEnv("ANTHROPIC_MODEL"),
    }),
    visibility: createVisibilityReportDepsFromEnv(),
    sink: createLeadDeliverySinkFromEnv(linearSink),
  };
}
