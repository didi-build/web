import { describe, expect, it } from "vitest";
import { isAndroidUserAgent } from "@/lib/hi/is-android-user-agent";

describe("isAndroidUserAgent", () => {
  it("detects Android user agents", () => {
    expect(
      isAndroidUserAgent(
        "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36",
      ),
    ).toBe(true);
  });

  it("does not match iOS or desktop", () => {
    expect(
      isAndroidUserAgent(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1",
      ),
    ).toBe(false);
    expect(
      isAndroidUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      ),
    ).toBe(false);
  });
});
