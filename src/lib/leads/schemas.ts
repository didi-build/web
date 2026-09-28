import { z } from "zod";

const noControlCharacters = (value: string) => !/[\u0000-\u001f\u007f]/.test(value);

const leadTextField = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(200)
    .refine(noControlCharacters, `Invalid ${label.toLowerCase()}`);

export const leadSummarySchema = z.object({
  summary: z.string().min(1).max(4000),
  needs: z.array(z.string().min(1).max(500)).max(20),
  suggestedPattern: z.string().min(1).max(500),
  urgency: z.enum(["low", "medium", "high"]),
  followUpQuestions: z.array(z.string().min(1).max(500)).max(10),
});

export const leadRequestSchema = z.object({
  name: leadTextField("Name"),
  email: z.string().trim().min(1, "Email is required").max(320).email("Invalid email"),
  businessName: z
    .string()
    .trim()
    .max(200)
    .refine((value) => value.length === 0 || noControlCharacters(value), "Invalid business name")
    .optional(),
  website: z.string().trim().max(500).optional(),
  message: z.string().trim().min(1, "Message is required").max(2000),
  turnstileToken: z.string().min(1, "Turnstile token is required").max(4096),
});

export type LeadRequest = z.infer<typeof leadRequestSchema>;

export function parseLeadRequest(body: unknown) {
  const result = leadRequestSchema.safeParse(body);
  if (!result.success) {
    return { ok: false as const, error: result.error };
  }
  const data = result.data;
  return {
    ok: true as const,
    data: {
      name: data.name,
      email: data.email,
      businessName: data.businessName || undefined,
      website: data.website || undefined,
      message: data.message,
      turnstileToken: data.turnstileToken,
    },
  };
}

export function parseLeadSummaryJson(raw: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false as const, error: "invalid_json" as const };
  }
  const result = leadSummarySchema.safeParse(parsed);
  if (!result.success) {
    return { ok: false as const, error: "invalid_shape" as const };
  }
  return { ok: true as const, data: result.data };
}
