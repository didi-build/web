import { describe, expect, it } from "vitest";
import { createBookRedirectResponse } from "@/lib/book/book-redirect";

describe("createBookRedirectResponse (pure redirect helper)", () => {
  it("returns a 307 redirect to the given destination", () => {
    const destination = "https://example.com/schedule";
    const response = createBookRedirectResponse(destination);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(destination);
  });
});
