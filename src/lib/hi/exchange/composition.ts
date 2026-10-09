import { getCloudflareContext } from "@opennextjs/cloudflare";
import { readEnv, requireEnv } from "@/lib/env";
import { createTurnstileVerifier } from "@/lib/turnstile";
import { GmailVisitorEmailSink } from "./gmail-visitor-sink";
import { LinearHiSink } from "./linear-hi-sink";
import type { HiExchangeDeps } from "./process-exchange";
import type { HiDetailsDeps } from "./process-details";
import type { HiRateLimiter } from "./types";

export type HiExchangeRateLimiterBinding = HiRateLimiter;

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

export function createHiExchangeDepsFromEnv(): HiExchangeDeps {
  const linear = new LinearHiSink({
    apiKey: requireEnv("LINEAR_API_KEY", "hi_exchange_config_error"),
    teamId: requireEnv("LINEAR_TEAM_ID", "hi_exchange_config_error"),
    projectId: requireEnv("LINEAR_PROJECT_ID", "hi_exchange_config_error"),
    leadLabelId: requireEnv("LINEAR_LEAD_LABEL_ID", "hi_exchange_config_error"),
  });

  const serviceAccountJson = requireEnv("GMAIL_SERVICE_ACCOUNT_JSON", "hi_exchange_config_error");
  const senderEmail = requireEnv("GMAIL_SENDER", "hi_exchange_config_error");

  return {
    verifyTurnstile: createTurnstileVerifier(
      requireEnv("TURNSTILE_SECRET_KEY", "hi_exchange_config_error"),
    ),
    linear,
    visitorEmail: new GmailVisitorEmailSink({ serviceAccountJson, senderEmail }),
    tokenSecret: requireEnv("HI_LEAD_TOKEN_SECRET", "hi_exchange_config_error"),
    rateLimiter: readRateLimiterFromCloudflare(),
  };
}

export function createHiDetailsDepsFromEnv(): HiDetailsDeps {
  return {
    linear: new LinearHiSink({
      apiKey: requireEnv("LINEAR_API_KEY", "hi_details_config_error"),
      teamId: requireEnv("LINEAR_TEAM_ID", "hi_details_config_error"),
      projectId: requireEnv("LINEAR_PROJECT_ID", "hi_details_config_error"),
      leadLabelId: requireEnv("LINEAR_LEAD_LABEL_ID", "hi_details_config_error"),
    }),
    tokenSecret: requireEnv("HI_LEAD_TOKEN_SECRET", "hi_details_config_error"),
  };
}

export function readHiTurnstileSiteKey(): string {
  return readEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY") ?? "";
}
