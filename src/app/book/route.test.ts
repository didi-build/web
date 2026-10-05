import { afterEach, describe, expect, it } from "vitest";
import { contactSectionFallbackUrl } from "@/lib/book/read-booking-url";

describe("GET /book (route handler)", () => {
  const originalBookingUrl = process.env.BOOKING_URL;

  afterEach(() => {
    if (originalBookingUrl === undefined) {
      delete process.env.BOOKING_URL;
    } else {
      process.env.BOOKING_URL = originalBookingUrl;
    }
  });

  it("returns 307 to BOOKING_URL when configured", async () => {
    process.env.BOOKING_URL = "https://example.com/my-booking";
    const { GET } = await import("@/app/book/route");
    const response = GET();

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://example.com/my-booking");
  });

  it("returns 307 to the contact section when BOOKING_URL is unset", async () => {
    delete process.env.BOOKING_URL;
    const { GET } = await import("@/app/book/route");
    const response = GET();

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(contactSectionFallbackUrl());
  });
});
