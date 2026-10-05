import { readEnv, requireEnv } from "@/lib/env";
import { ClaudeLeadSummarizer } from "./claude-lead-summarizer";
import { CompositeLeadSink } from "./composite-lead-sink";
import { EmailLeadSink, type EmailLeadSinkConfig } from "./email-lead-sink";
import { LinearLeadSink } from "./linear-lead-sink";
import type { LeadPipelineDeps } from "./process-lead";
import type { LeadSink } from "./types";
import { createTurnstileVerifier } from "./turnstile";
import { createVisibilityReportDepsFromEnv } from "../visibility/composition";

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
    apiKey: requireEnv("LINEAR_API_KEY", "lead_pipeline_config_error"),
    teamId: requireEnv("LINEAR_TEAM_ID", "lead_pipeline_config_error"),
    projectId: requireEnv("LINEAR_PROJECT_ID", "lead_pipeline_config_error"),
    leadLabelId: requireEnv("LINEAR_LEAD_LABEL_ID", "lead_pipeline_config_error"),
  });

  return {
    verifyTurnstile: createTurnstileVerifier(
      requireEnv("TURNSTILE_SECRET_KEY", "lead_pipeline_config_error"),
    ),
    summarizer: new ClaudeLeadSummarizer({
      apiKey: requireEnv("ANTHROPIC_API_KEY", "lead_pipeline_config_error"),
      model: readEnv("ANTHROPIC_MODEL"),
    }),
    visibility: createVisibilityReportDepsFromEnv(),
    sink: createLeadDeliverySinkFromEnv(linearSink),
  };
}
