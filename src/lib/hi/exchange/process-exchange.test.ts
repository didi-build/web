import { describe, expect, it, vi } from "vitest";
import type { HiFollowupQueueMessageBody } from "./follow-up-queue";
import { processHiExchange } from "./process-exchange";
import type { HiExchangeDeps } from "./process-exchange";

function fakeRequest(): Request {
  return new Request("https://didi.build/api/hi/exchange", {
    method: "POST",
    headers: { "cf-connecting-ip": "203.0.113.10" },
  });
}

function fakeDeps(overrides?: Partial<HiExchangeDeps>): HiExchangeDeps {
  return {
    verifyTurnstile: overrides?.verifyTurnstile ?? (async () => true),
    linear:
      overrides?.linear ??
      ({
        createCardLead: async () => ({
          issueId: "issue-1",
          identifier: "DIDI-1",
          url: "https://linear.app/didi/issue/DIDI-1",
        }),
        getIssueLeadNotificationContext: async () => ({
          identifier: "DIDI-1",
          url: "https://linear.app/didi/issue/DIDI-1",
          leadName: "Sam",
        }),
        appendDetails: async () => {},
        addIssueComment: async () => {},
      } satisfies HiExchangeDeps["linear"]),
    followUpQueue:
      overrides?.followUpQueue ??
      ({
        enqueue: async () => {},
        enqueueRequired: async () => {},
      } satisfies HiExchangeDeps["followUpQueue"]),
    tokenSecret: overrides?.tokenSecret ?? "test-secret-key-at-least-16-chars",
    rateLimiter: overrides?.rateLimiter,
  };
}

describe("processHiExchange", () => {
  it("returns a token after linear save and queue enqueue", async () => {
    const result = await processHiExchange(
      {
        name: "Sam Rivera",
        email: "sam@example.com",
        countryCode: "CA",
        turnstileToken: "token",
      },
      fakeRequest(),
      fakeDeps(),
    );
    expect(result.status).toBe(200);
    if (result.status === 200) {
      expect(result.token.length).toBeGreaterThan(10);
    }
  });

  it("returns 403 when Turnstile fails", async () => {
    const result = await processHiExchange(
      {
        name: "Sam",
        email: "sam@example.com",
        turnstileToken: "bad",
      },
      fakeRequest(),
      fakeDeps({ verifyTurnstile: async () => false }),
    );
    expect(result).toEqual({ status: 403, message: "Spam verification failed." });
  });

  it("returns 429 when rate limited", async () => {
    const result = await processHiExchange(
      {
        name: "Sam",
        email: "sam@example.com",
        turnstileToken: "token",
      },
      fakeRequest(),
      fakeDeps({
        rateLimiter: {
          limit: async () => ({ success: false }),
        },
      }),
    );
    expect(result.status).toBe(429);
  });

  it("short-circuits honeypot submissions with an empty token", async () => {
    const linear = {
      createCardLead: vi.fn(),
      appendDetails: vi.fn(),
      addIssueComment: vi.fn(),
      getIssueLeadNotificationContext: vi.fn(),
    };
    const result = await processHiExchange(
      {
        name: "Bot",
        email: "bot@example.com",
        turnstileToken: "token",
        website: "https://spam.example",
      },
      fakeRequest(),
      fakeDeps({ linear }),
    );
    expect(result).toEqual({ status: 200, token: "" });
    expect(linear.createCardLead).not.toHaveBeenCalled();
  });

  it("enqueues visitor and owner lead messages", async () => {
    const enqueueRequired = vi.fn(async (messages: HiFollowupQueueMessageBody[]) => {
      void messages;
    });
    await processHiExchange(
      {
        name: "Sam",
        email: "sam@example.com",
        turnstileToken: "token",
      },
      fakeRequest(),
      fakeDeps({ followUpQueue: { enqueue: async () => {}, enqueueRequired } }),
    );
    expect(enqueueRequired).toHaveBeenCalledOnce();
    const messages = enqueueRequired.mock.calls[0]?.[0];
    expect(messages).toBeDefined();
    expect(messages).toHaveLength(2);
    expect(messages?.[0]?.kind).toBe("visitor_followup");
    expect(messages?.[1]?.kind).toBe("owner_lead");
  });

  it("comments on Linear and returns 500 when queue enqueue fails", async () => {
    const addIssueComment = vi.fn();
    const result = await processHiExchange(
      {
        name: "Sam",
        email: "sam@example.com",
        turnstileToken: "token",
      },
      fakeRequest(),
      fakeDeps({
        followUpQueue: {
          enqueue: async () => {},
          enqueueRequired: async () => {
            throw new Error("queue_down");
          },
        },
        linear: {
          createCardLead: async () => ({
            issueId: "issue-99",
            identifier: "DIDI-99",
            url: "https://linear.app/didi/issue/DIDI-99",
          }),
          appendDetails: async () => {},
          addIssueComment,
          getIssueLeadNotificationContext: async () => ({
            identifier: "DIDI-99",
            url: "https://linear.app/didi/issue/DIDI-99",
            leadName: "Sam",
          }),
        },
      }),
    );
    expect(result.status).toBe(500);
    expect(addIssueComment).toHaveBeenCalledOnce();
  });
});
