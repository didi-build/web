import { generateVisibilityReport } from "./generate-visibility-report";
import { parseVisibilityRequest, visibilityReportSchema } from "./schemas";
import type { VisibilityChecker, VisibilityExplainer } from "./types";
import type { TurnstileVerifier } from "../turnstile";

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

  const generated = await generateVisibilityReport(url, {
    checker: deps.checker,
    explainer: deps.explainer,
  });

  if (!generated.ok) {
    return { status: generated.status, message: generated.message };
  }

  return { status: 200, report: generated.report };
}
