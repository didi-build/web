import { fallbackExplainerOutput } from "./claude-visibility-explainer";
import { computeScore, parseVisibilityRequest, visibilityReportSchema } from "./schemas";
import { getCachedReport, setCachedReport } from "./report-cache";
import type { VisibilityChecker, VisibilityExplainer } from "./types";
import type { TurnstileVerifier } from "../leads/turnstile";
import { VisibilityCheckError } from "./visibility-checker";
import { validatePublicHttpUrl } from "./url-validation";

export type VisibilityPipelineDeps = {
  verifyTurnstile: TurnstileVerifier;
  checker: VisibilityChecker;
  explainer: VisibilityExplainer;
};

export type VisibilityPipelineResult =
  | { status: 200; report: ReturnType<typeof visibilityReportSchema.parse> }
  | { status: 400; message: string }
  | { status: 403; message: string }
  | { status: 404; message: string }
  | { status: 429; message: string }
  | { status: 500; message: string };

export async function processVisibilityCheck(
  body: unknown,
  deps: VisibilityPipelineDeps,
): Promise<VisibilityPipelineResult> {
  const parsed = parseVisibilityRequest(body);
  if (!parsed.ok) {
    return {
      status: 400,
      message: "Please enter a valid website URL and complete the spam check.",
    };
  }

  const { turnstileToken, url } = parsed.data;
  let turnstileOk = false;
  try {
    turnstileOk = await deps.verifyTurnstile(turnstileToken);
  } catch (error) {
    console.error(
      "visibility_turnstile_failed",
      error instanceof Error ? error.message : "unknown",
    );
    return { status: 403, message: "Spam verification failed. Please try again." };
  }
  if (!turnstileOk) {
    return { status: 403, message: "Spam verification failed. Please try again." };
  }

  const validated = validatePublicHttpUrl(url);
  if (!validated.ok) {
    if (validated.reason === "blocked") {
      return {
        status: 400,
        message: "That URL is not allowed. Please use a public website address.",
      };
    }
    return { status: 400, message: "That does not look like a valid website URL." };
  }

  const cached = getCachedReport(validated.normalized);
  if (cached) {
    return { status: 200, report: cached };
  }

  let findings;
  try {
    findings = await deps.checker.check(validated.normalized);
  } catch (error) {
    if (error instanceof VisibilityCheckError) {
      if (error.code === "invalid_url" || error.code === "blocked_url") {
        return { status: 400, message: error.message };
      }
      return { status: 404, message: error.message };
    }
    console.error("visibility_check_failed", error instanceof Error ? error.message : "unknown");
    return {
      status: 500,
      message: "Something went wrong while checking that site. Please try again.",
    };
  }

  let summaryText: string;
  let topFixes: string[];
  try {
    const explained = await deps.explainer.explain({
      url: validated.normalized,
      findings,
    });
    summaryText = explained.summary;
    topFixes = explained.topFixes;
  } catch (error) {
    console.error(
      "visibility_explainer_failed",
      error instanceof Error ? error.message : "unknown",
    );
    const fallback = fallbackExplainerOutput(findings);
    summaryText = fallback.summary;
    topFixes = fallback.topFixes;
  }

  const report = visibilityReportSchema.parse({
    url: validated.normalized,
    checkedAt: new Date().toISOString(),
    score: computeScore(findings),
    findings,
    summary: summaryText,
    topFixes,
  });

  setCachedReport(validated.normalized, report);

  return { status: 200, report };
}
