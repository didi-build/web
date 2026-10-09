import { z } from "zod";
import { isKnownHiCountryCode } from "./country-codes";
import { HI_FIELD_LIMITS } from "./field-limits";

const noCrLf = (value: string) => !/[\r\n]/.test(value);
const noControlCharacters = (value: string) => !/[\u0000-\u001f\u007f]/.test(value);

const hiTextField = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max)
    .refine(noCrLf, `Invalid ${label.toLowerCase()}`)
    .refine(noControlCharacters, `Invalid ${label.toLowerCase()}`);

const optionalHiTextField = (label: string, max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .refine((value) => value.length === 0 || (noCrLf(value) && noControlCharacters(value)), {
      message: `Invalid ${label.toLowerCase()}`,
    })
    .optional();

export const hiExchangeRequestSchema = z.object({
  name: hiTextField("Name", HI_FIELD_LIMITS.name),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .max(HI_FIELD_LIMITS.email)
    .email("Invalid email")
    .refine(noCrLf, "Invalid email")
    .refine(noControlCharacters, "Invalid email"),
  phone: optionalHiTextField("Phone", HI_FIELD_LIMITS.phone),
  countryCode: z
    .string()
    .trim()
    .max(4)
    .refine((value) => value.length === 0 || isKnownHiCountryCode(value), "Invalid country code")
    .optional(),
  turnstileToken: z.string().min(1, "Turnstile token is required").max(4096),
  website: z.string().max(500).optional(),
});

export const hiDetailsRequestSchema = z.object({
  token: z.string().min(1, "Token is required").max(4096),
  jobTitle: optionalHiTextField("Job title", HI_FIELD_LIMITS.jobTitle),
  company: optionalHiTextField("Company", HI_FIELD_LIMITS.company),
  note: optionalHiTextField("Note", HI_FIELD_LIMITS.note),
});

export type HiExchangeRequest = z.infer<typeof hiExchangeRequestSchema>;
export type HiDetailsRequest = z.infer<typeof hiDetailsRequestSchema>;

export function parseHiExchangeRequest(body: unknown) {
  const result = hiExchangeRequestSchema.safeParse(body);
  if (!result.success) {
    return { ok: false as const, error: result.error };
  }
  const data = result.data;
  return {
    ok: true as const,
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      countryCode: data.countryCode || undefined,
      turnstileToken: data.turnstileToken,
      website: data.website || undefined,
    },
  };
}

export function parseHiDetailsRequest(body: unknown) {
  const result = hiDetailsRequestSchema.safeParse(body);
  if (!result.success) {
    return { ok: false as const, error: result.error };
  }
  const data = result.data;
  return {
    ok: true as const,
    data: {
      token: data.token,
      jobTitle: data.jobTitle || undefined,
      company: data.company || undefined,
      note: data.note || undefined,
    },
  };
}
