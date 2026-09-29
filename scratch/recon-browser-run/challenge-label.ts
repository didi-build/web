import {
  isBotChallengeBody,
  isTinyMetaRefreshChallenge,
} from "../../src/lib/visibility/challenge-detection";

function headerValue(
  headers: Record<string, string> | undefined,
  name: string,
): string | undefined {
  if (!headers) {
    return undefined;
  }
  const lower = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === lower) {
      return value;
    }
  }
  return undefined;
}

function hasCloudflareChallengeMarker(body: string): boolean {
  const lower = body.toLowerCase();
  return (
    lower.includes("cf-chl") || lower.includes("cf_chl_opt") || lower.includes("challenge-platform")
  );
}

function isCloudflareInterstitialChallenge(
  body: string,
  headers?: Record<string, string>,
): boolean {
  const cfMitigated = headerValue(headers, "cf-mitigated");
  if (cfMitigated?.toLowerCase() === "challenge") {
    return true;
  }
  if (!hasCloudflareChallengeMarker(body)) {
    return false;
  }
  const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(body);
  const titleText = titleMatch?.[1] ?? "";
  return titleText.toLowerCase().includes("just a moment");
}

/**
 * Mirrors `isBotChallengeBody` in challenge-detection.ts but returns which rule matched.
 */
export function describeBotChallenge(
  body: string,
  headers?: Record<string, string>,
): { detected: boolean; signature: string | null } {
  const sgCaptcha = headerValue(headers, "sg-captcha");
  if (sgCaptcha?.toLowerCase().includes("challenge")) {
    return { detected: true, signature: "sg-captcha header" };
  }

  if (headerValue(headers, "cf-mitigated")?.toLowerCase() === "challenge") {
    return { detected: true, signature: "cf-mitigated: challenge" };
  }

  if (isCloudflareInterstitialChallenge(body, headers)) {
    return { detected: true, signature: "cloudflare interstitial (title + cf markers)" };
  }

  if (body.includes("/.well-known/sgcaptcha")) {
    return { detected: true, signature: "sgcaptcha path in body" };
  }

  if (isTinyMetaRefreshChallenge(body)) {
    return { detected: true, signature: "tiny meta refresh challenge" };
  }

  const detected = isBotChallengeBody(body, headers);
  return { detected, signature: detected ? "unknown (isBotChallengeBody true)" : null };
}
