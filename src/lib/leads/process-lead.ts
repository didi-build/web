import { parseLeadRequest } from "./schemas";
import { runLeadVisibilityCheck } from "./run-lead-visibility-check";
import type { LeadRecord, LeadSink, LeadSummarizer, LeadSummary } from "./types";
import type { TurnstileVerifier } from "./turnstile";
import type { GenerateVisibilityReportDeps } from "../visibility/generate-visibility-report";
import type { VisibilityReport } from "../visibility/types";

export type LeadPipelineDeps = {
  verifyTurnstile: TurnstileVerifier;
  summarizer: LeadSummarizer;
  sink: LeadSink;
  visibility?: GenerateVisibilityReportDeps;
};

export type LeadPipelineResult =
  | { status: 201 }
  | { status: 400; message: string }
  | { status: 403; message: string }
  | { status: 500; message: string };

function toLeadRecord(input: {
  name: string;
  email: string;
  businessName?: string;
  website?: string;
  message: string;
}): LeadRecord {
  return {
    name: input.name,
    email: input.email,
    businessName: input.businessName,
    website: input.website,
    message: input.message,
  };
}

async function runSummarizer(
  summarizer: LeadSummarizer,
  lead: LeadRecord,
): Promise<LeadSummary | null> {
  try {
    return await summarizer.summarize(lead);
  } catch (error) {
    console.error("lead_summarizer_failed", error instanceof Error ? error.message : "unknown");
    return null;
  }
}

export async function processLeadSubmission(
  body: unknown,
  deps: LeadPipelineDeps,
): Promise<LeadPipelineResult> {
  const parsed = parseLeadRequest(body);
  if (!parsed.ok) {
    return { status: 400, message: "Invalid lead submission." };
  }

  const { turnstileToken, ...rest } = parsed.data;
  let turnstileOk = false;
  try {
    turnstileOk = await deps.verifyTurnstile(turnstileToken);
  } catch (error) {
    console.error("lead_turnstile_failed", error instanceof Error ? error.message : "unknown");
    return { status: 403, message: "Spam verification failed." };
  }
  if (!turnstileOk) {
    return { status: 403, message: "Spam verification failed." };
  }

  const lead = toLeadRecord(rest);
  const website = lead.website?.trim();
  const visibilityDeps = deps.visibility;

  const visibilityPromise =
    website && visibilityDeps
      ? runLeadVisibilityCheck(website, visibilityDeps)
      : Promise.resolve<VisibilityReport | null>(null);

  const [visibilityReport, summary] = await Promise.all([
    visibilityPromise,
    runSummarizer(deps.summarizer, lead),
  ]);

  try {
    await deps.sink.submit(lead, summary, visibilityReport);
  } catch (error) {
    console.error("lead_sink_failed", error instanceof Error ? error.message : "unknown");
    return { status: 500, message: "Could not save your message. Please try again." };
  }

  return { status: 201 };
}
