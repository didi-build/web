import { fallbackExplainerOutput } from "./claude-visibility-explainer";
import { resolveVisibilityScore, visibilityReportSchema, type VisibilityReport } from "./schemas";
import { getCachedReport, setCachedReport } from "./report-cache";
import type { VisibilityChecker, VisibilityExplainer } from "./types";
import { VisibilityCheckError } from "./visibility-checker";
import { validatePublicHttpUrl } from "./url-validation";

export type GenerateVisibilityReportDeps = {
  checker: VisibilityChecker;
  explainer: VisibilityExplainer;
};

export type GenerateVisibilityReportResult =
  { ok: true; report: VisibilityReport } | { ok: false; status: 400 | 404 | 500; message: string };

export async function generateVisibilityReport(
  url: string,
  deps: GenerateVisibilityReportDeps,
): Promise<GenerateVisibilityReportResult> {
  const validated = validatePublicHttpUrl(url);
  if (!validated.ok) {
    if (validated.reason === "blocked") {
      return {
        ok: false,
        status: 400,
        message: "That URL is not allowed. Please use a public website address.",
      };
    }
    return { ok: false, status: 400, message: "That does not look like a valid website URL." };
  }

  const cached = getCachedReport(validated.normalized);
  if (cached) {
    return { ok: true, report: cached };
  }

  let findings;
  try {
    findings = await deps.checker.check(validated.normalized);
  } catch (error) {
    if (error instanceof VisibilityCheckError) {
      if (error.code === "invalid_url" || error.code === "blocked_url") {
        return { ok: false, status: 400, message: error.message };
      }
      return { ok: false, status: 404, message: error.message };
    }
    console.error("visibility_check_failed", error instanceof Error ? error.message : "unknown");
    return {
      ok: false,
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
    score: resolveVisibilityScore(findings),
    findings,
    summary: summaryText,
    topFixes,
  });

  setCachedReport(validated.normalized, report);

  return { ok: true, report };
}
