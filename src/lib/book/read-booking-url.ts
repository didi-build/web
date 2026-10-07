import { siteContent } from "@/content/site";
import { readEnv } from "@/lib/env";
import { z } from "zod";

const httpsUrlSchema = z
  .string()
  .url()
  .refine((value) => value.startsWith("https://"), {
    message: "BOOKING_URL must use https",
  });

export function readBookingUrl(): string | undefined {
  const raw = readEnv("BOOKING_URL");
  if (!raw) {
    return undefined;
  }
  const parsed = httpsUrlSchema.safeParse(raw);
  return parsed.success ? parsed.data : undefined;
}

/** On-site booking CTA block (used when BOOKING_URL is not configured). */
export function bookingCtaFallbackUrl(): string {
  const base = siteContent.meta.siteUrl.replace(/\/$/, "");
  return `${base}/#${siteContent.sectionIds.contact}`;
}

export function resolveBookRedirectDestination(): string {
  const bookingUrl = readBookingUrl();
  if (bookingUrl) {
    return bookingUrl;
  }
  console.error("book_redirect_config_error", "BOOKING_URL missing or invalid");
  return bookingCtaFallbackUrl();
}
