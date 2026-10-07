import { describe, expect, it } from "vitest";
import { formatAnthropicHttpError, isRetryableAnthropicError } from "./anthropic-http";

describe("formatAnthropicHttpError", () => {
  it("includes status, error type, and message", () => {
    const err = formatAnthropicHttpError(
      400,
      JSON.stringify({
        type: "error",
        error: {
          type: "invalid_request_error",
          message: "`temperature` is deprecated for this model.",
        },
      }),
    );
    expect(err.message).toBe(
      "anthropic_http_400 invalid_request_error: `temperature` is deprecated for this model.",
    );
  });
});

describe("isRetryableAnthropicError", () => {
  it("does not retry 400", () => {
    expect(
      isRetryableAnthropicError(new Error("anthropic_http_400 invalid_request_error: bad")),
    ).toBe(false);
  });

  it("retries 500", () => {
    expect(isRetryableAnthropicError(new Error("anthropic_http_500"))).toBe(true);
  });

  it("retries network TypeError", () => {
    expect(isRetryableAnthropicError(new TypeError("fetch failed"))).toBe(true);
  });
});
