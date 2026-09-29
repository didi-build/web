import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { assessScreenshotChallenge } from "./screenshot-challenge";

const PSI_BASE = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

export type PageSpeedRuntimeError = {
  code: string;
  message: string;
};

export type PageSpeedResult = {
  wallClockMs: number;
  httpStatus: number;
  apiError: string | null;
  captchaResult: string | null;
  runtimeError: PageSpeedRuntimeError | null;
  finalDocumentHttpStatus: number | null;
  seoScore: number | null;
  seoAuditIds: string[];
  finalScreenshotPath: string | null;
  screenshotLooksLikeChallenge: boolean;
  screenshotChallengeReasons: string[];
};

type LighthouseAudit = {
  id?: string;
  details?: {
    type?: string;
    data?: string;
    items?: Array<{
      url?: string;
      statusCode?: number;
      resourceType?: string;
    }>;
  };
};

type PageSpeedApiResponse = {
  captchaResult?: string;
  error?: { code?: number; message?: string; status?: string };
  lighthouseResult?: {
    finalUrl?: string;
    runtimeError?: { code?: string; message?: string };
    categories?: Record<
      string,
      {
        score?: number | null;
        auditRefs?: Array<{ id?: string }>;
      }
    >;
    audits?: Record<string, LighthouseAudit>;
  };
};

function seoAuditIdsFromLighthouse(lighthouse: PageSpeedApiResponse["lighthouseResult"]): string[] {
  const refs = lighthouse?.categories?.seo?.auditRefs ?? [];
  return refs.map((ref) => ref.id).filter((id): id is string => Boolean(id));
}

function extractFinalDocumentHttpStatus(
  lighthouse: PageSpeedApiResponse["lighthouseResult"],
): number | null {
  const finalUrl = lighthouse?.finalUrl;
  const items = lighthouse?.audits?.["network-requests"]?.details?.items;
  if (!items?.length) {
    return null;
  }

  const documents = items.filter((item) => {
    const type = item.resourceType?.toLowerCase() ?? "";
    return type === "document";
  });

  const normalize = (value: string) => value.replace(/\/$/, "");
  if (finalUrl) {
    const normalizedFinal = normalize(finalUrl);
    const matching = documents.filter(
      (item) => item.url && normalize(item.url) === normalizedFinal,
    );
    if (matching.length > 0) {
      return matching[matching.length - 1]?.statusCode ?? null;
    }
  }

  if (documents.length > 0) {
    return documents[documents.length - 1]?.statusCode ?? null;
  }

  return items[items.length - 1]?.statusCode ?? null;
}

function saveFinalScreenshot(
  lighthouse: PageSpeedApiResponse["lighthouseResult"],
  screenshotsDir: string,
  slug: string,
): string | null {
  const dataUrl = lighthouse?.audits?.["final-screenshot"]?.details?.data;
  if (!dataUrl || !dataUrl.startsWith("data:image/")) {
    return null;
  }

  const match = /^data:image\/(\w+);base64,([\s\S]+)$/.exec(dataUrl);
  if (!match) {
    return null;
  }

  const ext = match[1] === "jpeg" ? "jpg" : match[1];
  const buffer = Buffer.from(match[2], "base64");
  mkdirSync(screenshotsDir, { recursive: true });
  const filePath = join(screenshotsDir, `${slug}-final.${ext}`);
  writeFileSync(filePath, buffer);
  return filePath;
}

export async function fetchPageSpeed(
  url: string,
  screenshotsDir: string,
  slug: string,
): Promise<PageSpeedResult> {
  const started = Date.now();
  const endpoint = new URL(PSI_BASE);
  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("strategy", "mobile");
  endpoint.searchParams.append("category", "seo");
  endpoint.searchParams.append("category", "performance");

  const empty: PageSpeedResult = {
    wallClockMs: 0,
    httpStatus: 0,
    apiError: null,
    captchaResult: null,
    runtimeError: null,
    finalDocumentHttpStatus: null,
    seoScore: null,
    seoAuditIds: [],
    finalScreenshotPath: null,
    screenshotLooksLikeChallenge: false,
    screenshotChallengeReasons: [],
  };

  try {
    const response = await fetch(endpoint.toString(), {
      signal: AbortSignal.timeout(180_000),
    });
    const wallClockMs = Date.now() - started;
    const payload = (await response.json()) as PageSpeedApiResponse;

    if (!response.ok || payload.error) {
      return {
        ...empty,
        wallClockMs,
        httpStatus: response.status,
        apiError: payload.error?.message ?? `HTTP ${response.status}`,
      };
    }

    const lighthouse = payload.lighthouseResult;
    const runtimeError = lighthouse?.runtimeError;
    const seoScoreRaw = lighthouse?.categories?.seo?.score;
    const seoScore =
      seoScoreRaw === null || seoScoreRaw === undefined ? null : Math.round(seoScoreRaw * 100);

    const screenshotPath = saveFinalScreenshot(lighthouse, screenshotsDir, slug);
    const documentStatus = extractFinalDocumentHttpStatus(lighthouse);

    const screenshotAssessment = await assessScreenshotChallenge({
      captchaResult: payload.captchaResult ?? null,
      finalDocumentHttpStatus: documentStatus,
      screenshotPath,
    });

    return {
      wallClockMs,
      httpStatus: response.status,
      apiError: null,
      captchaResult: payload.captchaResult ?? null,
      runtimeError: runtimeError?.code
        ? { code: runtimeError.code, message: runtimeError.message ?? "" }
        : null,
      finalDocumentHttpStatus: documentStatus,
      seoScore,
      seoAuditIds: seoAuditIdsFromLighthouse(lighthouse),
      finalScreenshotPath: screenshotPath,
      screenshotLooksLikeChallenge: screenshotAssessment.looksLikeChallenge,
      screenshotChallengeReasons: screenshotAssessment.reasons,
    };
  } catch (err) {
    return {
      ...empty,
      wallClockMs: Date.now() - started,
      httpStatus: 0,
      apiError: err instanceof Error ? err.message : String(err),
    };
  }
}
