import {
  generateVisibilityReport,
  type GenerateVisibilityReportDeps,
} from "../visibility/generate-visibility-report";
import type { VisibilityReport } from "../visibility/types";

export const LEAD_VISIBILITY_TIMEOUT_MS = 25_000;

export async function runLeadVisibilityCheck(
  website: string,
  deps: GenerateVisibilityReportDeps,
  timeoutMs = LEAD_VISIBILITY_TIMEOUT_MS,
): Promise<VisibilityReport | null> {
  const trimmed = website.trim();
  if (!trimmed) {
    return null;
  }

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<null>((resolve) => {
    timeoutId = setTimeout(() => resolve(null), timeoutMs);
  });

  const checkPromise = generateVisibilityReport(trimmed, deps).then((result) => {
    if (result.ok) {
      return result.report;
    }
    return null;
  });

  try {
    const report = await Promise.race([checkPromise, timeoutPromise]);
    return report;
  } catch (error) {
    console.error(
      "lead_visibility_check_failed",
      error instanceof Error ? error.message : "unknown",
    );
    return null;
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}
