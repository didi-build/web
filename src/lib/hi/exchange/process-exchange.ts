import type { TurnstileVerifier } from "@/lib/turnstile";
import { DEFAULT_HI_COUNTRY_CODE, formatHiPhone } from "./country-codes";
import type { HiFollowUpQueue } from "./follow-up-queue";
import { HI_FOLLOWUP_QUEUE_FAILED_COMMENT } from "./linear-comments";
import { parseHiExchangeRequest } from "./schemas";
import { createHiLeadToken } from "./token";
import type { HiCardLead, HiLinearSink, HiRateLimiter } from "./types";
import { getRequestClientIp } from "./request-ip";

export type HiExchangeDeps = {
  verifyTurnstile: TurnstileVerifier;
  linear: HiLinearSink;
  followUpQueue: HiFollowUpQueue;
  tokenSecret: string;
  rateLimiter?: HiRateLimiter;
};

export type HiExchangeResult =
  | { status: 200; token: string }
  | { status: 400; message: string }
  | { status: 403; message: string }
  | { status: 429; message: string }
  | { status: 500; message: string };

const RATE_LIMIT_MESSAGE = "Too many requests. Please wait a minute and try again.";

const GENERIC_FAILURE_MESSAGE =
  "Something went wrong. Please try again, or email diadem@didi.build.";

function toLeadRecord(input: {
  name: string;
  email: string;
  phone?: string;
  countryCode?: string;
}): HiCardLead {
  const countryCode = input.countryCode || DEFAULT_HI_COUNTRY_CODE;
  const phone = input.phone ? formatHiPhone(countryCode, input.phone) : undefined;
  return {
    name: input.name,
    email: input.email,
    phone,
  };
}

export async function processHiExchange(
  body: unknown,
  request: Request,
  deps: HiExchangeDeps,
): Promise<HiExchangeResult> {
  const parsed = parseHiExchangeRequest(body);
  if (!parsed.ok) {
    return { status: 400, message: "Invalid exchange submission." };
  }

  if (parsed.data.website?.trim()) {
    return { status: 200, token: "" };
  }

  if (deps.rateLimiter) {
    const ip = getRequestClientIp(request);
    const { success } = await deps.rateLimiter.limit({ key: `hi-exchange:${ip}` });
    if (!success) {
      return { status: 429, message: RATE_LIMIT_MESSAGE };
    }
  }

  const { turnstileToken, ...rest } = parsed.data;
  let turnstileOk = false;
  try {
    turnstileOk = await deps.verifyTurnstile(turnstileToken);
  } catch (error) {
    console.error(
      "hi_exchange_turnstile_failed",
      error instanceof Error ? error.message : "unknown",
    );
    return { status: 403, message: "Spam verification failed." };
  }
  if (!turnstileOk) {
    return { status: 403, message: "Spam verification failed." };
  }

  const lead = toLeadRecord(rest);

  let issueId: string;
  try {
    const created = await deps.linear.createCardLead(lead);
    issueId = created.issueId;
  } catch (error) {
    console.error("hi_exchange_linear_failed", error instanceof Error ? error.message : "unknown");
    return { status: 500, message: GENERIC_FAILURE_MESSAGE };
  }

  try {
    await deps.followUpQueue.enqueue({
      issueId,
      name: lead.name,
      email: lead.email,
    });
  } catch (error) {
    console.error("hi_exchange_queue_failed", error instanceof Error ? error.message : "unknown");
    try {
      await deps.linear.addIssueComment(issueId, HI_FOLLOWUP_QUEUE_FAILED_COMMENT);
    } catch (commentError) {
      console.error(
        "hi_exchange_queue_failed_comment",
        commentError instanceof Error ? commentError.message : "unknown",
      );
    }
    return { status: 500, message: GENERIC_FAILURE_MESSAGE };
  }

  try {
    const token = await createHiLeadToken(issueId, deps.tokenSecret);
    return { status: 200, token };
  } catch (error) {
    console.error("hi_exchange_token_failed", error instanceof Error ? error.message : "unknown");
    return { status: 500, message: GENERIC_FAILURE_MESSAGE };
  }
}
