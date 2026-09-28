import { z } from "zod";

export const findingStatusSchema = z.enum(["pass", "warn", "fail"]);

export type FindingStatus = z.infer<typeof findingStatusSchema>;

export const visibilityFindingSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  status: findingStatusSchema,
  detail: z.string().min(1),
  whyItMatters: z.string().min(1),
});

export type VisibilityFinding = z.infer<typeof visibilityFindingSchema>;

export const visibilityReportSchema = z.object({
  url: z.string().url(),
  checkedAt: z.string().datetime(),
  score: z.number().min(0).max(100).optional(),
  findings: z.array(visibilityFindingSchema),
  summary: z.string().min(1),
  topFixes: z.array(z.string().min(1)).min(1).max(5),
});

export type VisibilityReport = z.infer<typeof visibilityReportSchema>;

export const explainerOutputSchema = z.object({
  summary: z.string().min(1).max(4000),
  topFixes: z.array(z.string().min(1).max(500)).min(1).max(5),
});

export const visibilityRequestSchema = z.object({
  url: z.string().trim().min(1, "URL is required").max(2000),
  turnstileToken: z.string().min(1, "Turnstile token is required").max(4096),
});

export type VisibilityRequest = z.infer<typeof visibilityRequestSchema>;

export function parseVisibilityRequest(body: unknown) {
  const result = visibilityRequestSchema.safeParse(body);
  if (!result.success) {
    return { ok: false as const, error: result.error };
  }
  return { ok: true as const, data: result.data };
}

export function parseExplainerOutputJson(raw: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false as const, error: "invalid_json" as const };
  }
  const result = explainerOutputSchema.safeParse(parsed);
  if (!result.success) {
    return { ok: false as const, error: "invalid_shape" as const };
  }
  return { ok: true as const, data: result.data };
}

export function computeScore(findings: VisibilityFinding[]): number {
  if (findings.length === 0) {
    return 0;
  }
  let points = 0;
  for (const finding of findings) {
    if (finding.status === "pass") {
      points += 1;
    } else if (finding.status === "warn") {
      points += 0.5;
    }
  }
  return Math.round((points / findings.length) * 100);
}
