import { getCloudflareContext } from "@opennextjs/cloudflare";
import { readEnv, requireEnv } from "@/lib/env";
import { createTurnstileVerifier } from "@/lib/turnstile";
import { CloudflareHiFollowUpQueue } from "./follow-up-queue";
import { LinearHiSink } from "./linear-hi-sink";
import type { HiExchangeDeps } from "./process-exchange";
import type { HiDetailsDeps } from "./process-details";
import type { HiRateLimiter } from "./types";

function readRateLimiterFromCloudflare(): HiRateLimiter | undefined {
  try {
    const env = getCloudflareContext().env as {
      HI_EXCHANGE_RATE_LIMITER?: HiRateLimiter;
    };
    return env.HI_EXCHANGE_RATE_LIMITER;
  } catch {
    return undefined;
  }
}

function readFollowUpQueueFromCloudflare() {
  try {
    const env = getCloudflareContext().env as {
      HI_FOLLOWUP_EMAIL_QUEUE?: { send(body: unknown): Promise<unknown> };
    };
    if (!env.HI_FOLLOWUP_EMAIL_QUEUE) {
      return undefined;
    }
    return new CloudflareHiFollowUpQueue(env.HI_FOLLOWUP_EMAIL_QUEUE);
  } catch {
    return undefined;
  }
}

function createLinearSinkFromEnv(logEvent: string): LinearHiSink {
  return new LinearHiSink({
    apiKey: requireEnv("LINEAR_API_KEY", logEvent),
    teamId: requireEnv("LINEAR_TEAM_ID", logEvent),
    projectId: requireEnv("LINEAR_PROJECT_ID", logEvent),
    leadLabelId: requireEnv("LINEAR_LEAD_LABEL_ID", logEvent),
  });
}

export function createHiExchangeDepsFromEnv(): HiExchangeDeps {
  const followUpQueue = readFollowUpQueueFromCloudflare();
  if (!followUpQueue) {
    throw new Error("HI_FOLLOWUP_EMAIL_QUEUE binding is not configured");
  }

  return {
    verifyTurnstile: createTurnstileVerifier(
      requireEnv("TURNSTILE_SECRET_KEY", "hi_exchange_config_error"),
    ),
    linear: createLinearSinkFromEnv("hi_exchange_config_error"),
    followUpQueue,
    tokenSecret: requireEnv("HI_TOKEN_SECRET", "hi_exchange_config_error"),
    rateLimiter: readRateLimiterFromCloudflare(),
  };
}

export function createHiDetailsDepsFromEnv(): HiDetailsDeps {
  return {
    linear: createLinearSinkFromEnv("hi_details_config_error"),
    tokenSecret: requireEnv("HI_TOKEN_SECRET", "hi_details_config_error"),
    rateLimiter: readRateLimiterFromCloudflare(),
  };
}

export function readHiTurnstileSiteKey(): string {
  return readEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY") ?? "";
}
