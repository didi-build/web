import { describe, expect, it } from "vitest";
import { PUBLIC_BOOKING_DESTINATION_URL, createBookRedirectResponse } from "@/lib/hi/book-redirect";

describe("createBookRedirectResponse (route integration)", () => {
  it("returns a temporary redirect to the public booking destination", () => {
    const response = createBookRedirectResponse();

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(PUBLIC_BOOKING_DESTINATION_URL);
  });
});
