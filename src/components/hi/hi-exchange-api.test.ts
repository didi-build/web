import { afterEach, describe, expect, it, vi } from "vitest";
import { HI_EXCHANGE_REQUEST_TIMEOUT_MS, postHiExchange } from "./hi-exchange-api";

describe("postHiExchange", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("returns timeout when the request does not complete in time", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => {
              reject(new DOMException("The operation was aborted.", "AbortError"));
            });
          }),
      ),
    );

    const promise = postHiExchange({
      name: "Sam",
      email: "sam@example.com",
      countryCode: "CA",
      turnstileToken: "token",
    });
    await vi.advanceTimersByTimeAsync(HI_EXCHANGE_REQUEST_TIMEOUT_MS + 5);
    const result = await promise;
    expect(result).toEqual({ ok: false, kind: "timeout" });
  });

  it("returns server failure for non-OK responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ error: "nope" }), { status: 500 })),
    );
    const result = await postHiExchange({
      name: "Sam",
      email: "sam@example.com",
      countryCode: "CA",
      turnstileToken: "token",
    });
    expect(result).toEqual({ ok: false, kind: "server", message: "nope" });
  });
});
