import { parseHiDetailsRequest } from "./schemas";
import { verifyHiLeadToken } from "./token";
import type { HiLinearSink, HiRateLimiter } from "./types";
import { getRequestClientIp } from "./request-ip";

export type HiDetailsDeps = {
  linear: HiLinearSink;
  tokenSecret: string;
  rateLimiter?: HiRateLimiter;
};

export type HiDetailsResult =
  | { status: 200 }
  | { status: 400; message: string }
  | { status: 401; message: string }
  | { status: 429; message: string }
  | { status: 500; message: string };

const RATE_LIMIT_MESSAGE = "Too many requests. Please wait a minute and try again.";

export async function processHiDetails(
  body: unknown,
  request: Request,
  deps: HiDetailsDeps,
): Promise<HiDetailsResult> {
  const parsed = parseHiDetailsRequest(body);
  if (!parsed.ok) {
    return { status: 400, message: "Invalid details submission." };
  }

  if (deps.rateLimiter) {
    const ip = getRequestClientIp(request);
    const { success } = await deps.rateLimiter.limit({ key: `hi-details:${ip}` });
    if (!success) {
      return { status: 429, message: RATE_LIMIT_MESSAGE };
    }
  }

  const payload = await verifyHiLeadToken(parsed.data.token, deps.tokenSecret);
  if (!payload) {
    return {
      status: 401,
      message: "This link has expired. Close the sheet and exchange contact again.",
    };
  }

  try {
    await deps.linear.appendDetails(payload.issueId, {
      jobTitle: parsed.data.jobTitle,
      company: parsed.data.company,
      note: parsed.data.note,
    });
  } catch (error) {
    console.error("hi_details_linear_failed", error instanceof Error ? error.message : "unknown");
    return {
      status: 500,
      message: "Something went wrong. Please try again, or email diadem@didi.build.",
    };
  }

  return { status: 200 };
}
