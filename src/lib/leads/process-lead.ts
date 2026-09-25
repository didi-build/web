import { parseLeadRequest } from "./schemas";
import type { LeadRecord, LeadSink, LeadSummarizer } from "./types";
import type { TurnstileVerifier } from "./turnstile";

export type LeadPipelineDeps = {
  verifyTurnstile: TurnstileVerifier;
  summarizer: LeadSummarizer;
  sink: LeadSink;
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

export async function processLeadSubmission(
  body: unknown,
  deps: LeadPipelineDeps,
): Promise<LeadPipelineResult> {
  const parsed = parseLeadRequest(body);
  if (!parsed.ok) {
    return { status: 400, message: "Invalid lead submission." };
  }

  const { turnstileToken, ...rest } = parsed.data;
  const turnstileOk = await deps.verifyTurnstile(turnstileToken);
  if (!turnstileOk) {
    return { status: 403, message: "Spam verification failed." };
  }

  const lead = toLeadRecord(rest);
  let summary = null;
  try {
    summary = await deps.summarizer.summarize(lead);
  } catch (error) {
    console.error("lead_summarizer_failed", error instanceof Error ? error.message : "unknown");
    summary = null;
  }

  try {
    await deps.sink.submit(lead, summary);
  } catch (error) {
    console.error("lead_sink_failed", error instanceof Error ? error.message : "unknown");
    return { status: 500, message: "Could not save your message. Please try again." };
  }

  return { status: 201 };
}
