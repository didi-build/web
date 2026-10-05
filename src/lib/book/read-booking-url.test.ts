import { afterEach, describe, expect, it, vi } from "vitest";
import { siteContent } from "@/content/site";
import {
  contactSectionFallbackUrl,
  readBookingUrl,
  resolveBookRedirectDestination,
} from "@/lib/book/read-booking-url";

describe("readBookingUrl (config reader)", () => {
  const originalBookingUrl = process.env.BOOKING_URL;

  afterEach(() => {
    if (originalBookingUrl === undefined) {
      delete process.env.BOOKING_URL;
    } else {
      process.env.BOOKING_URL = originalBookingUrl;
    }
  });

  it("returns a valid https BOOKING_URL", () => {
    process.env.BOOKING_URL = "https://example.com/booking";
    expect(readBookingUrl()).toBe("https://example.com/booking");
  });

  it("returns undefined when BOOKING_URL is missing", () => {
    delete process.env.BOOKING_URL;
    expect(readBookingUrl()).toBeUndefined();
  });

  it("returns undefined when BOOKING_URL is not a URL", () => {
    process.env.BOOKING_URL = "not-a-url";
    expect(readBookingUrl()).toBeUndefined();
  });

  it("returns undefined when BOOKING_URL uses http instead of https", () => {
    process.env.BOOKING_URL = "http://example.com/book";
    expect(readBookingUrl()).toBeUndefined();
  });
});

describe("resolveBookRedirectDestination (config + fallback)", () => {
  const originalBookingUrl = process.env.BOOKING_URL;

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalBookingUrl === undefined) {
      delete process.env.BOOKING_URL;
    } else {
      process.env.BOOKING_URL = originalBookingUrl;
    }
  });

  it("uses the contact section when BOOKING_URL is invalid", () => {
    process.env.BOOKING_URL = "http://example.com/book";
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(resolveBookRedirectDestination()).toBe(contactSectionFallbackUrl());
    expect(errorSpy).toHaveBeenCalledWith(
      "book_redirect_config_error",
      "BOOKING_URL missing or invalid",
    );
  });
});

describe("contactSectionFallbackUrl", () => {
  it("points at the site contact section anchor", () => {
    const base = siteContent.meta.siteUrl.replace(/\/$/, "");
    expect(contactSectionFallbackUrl()).toBe(`${base}/#${siteContent.sectionIds.contact}`);
  });
});
