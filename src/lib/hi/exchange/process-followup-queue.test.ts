import { describe, expect, it, vi } from "vitest";
import { HI_FOLLOWUP_EMAIL_FAILED_COMMENT } from "./linear-comments";
import { hiFollowupRetryDelaySeconds, processHiFollowupQueueBatch } from "./process-followup-queue";

describe("hiFollowupRetryDelaySeconds", () => {
  it("backs off exponentially", () => {
    expect(hiFollowupRetryDelaySeconds(1)).toBe(30);
    expect(hiFollowupRetryDelaySeconds(2)).toBe(60);
    expect(hiFollowupRetryDelaySeconds(3)).toBe(120);
  });
});

describe("processHiFollowupQueueBatch", () => {
  it("acks after max attempts and comments on Linear", async () => {
    const ack = vi.fn();
    const retry = vi.fn();
    const addIssueComment = vi.fn();

    await processHiFollowupQueueBatch(
      {
        messages: [
          {
            id: "m1",
            attempts: 5,
            body: { issueId: "issue-1", name: "Sam", email: "sam@example.com" },
            ack,
            retry,
          },
        ],
      },
      {
        sendEmail: async () => {
          throw new Error("gmail_down");
        },
        addIssueComment,
      },
    );

    expect(ack).toHaveBeenCalledOnce();
    expect(retry).not.toHaveBeenCalled();
    expect(addIssueComment).toHaveBeenCalledWith("issue-1", HI_FOLLOWUP_EMAIL_FAILED_COMMENT);
  });

  it("retries with backoff before max attempts", async () => {
    const retry = vi.fn();
    await processHiFollowupQueueBatch(
      {
        messages: [
          {
            id: "m1",
            attempts: 2,
            body: { issueId: "issue-1", name: "Sam", email: "sam@example.com" },
            ack: vi.fn(),
            retry,
          },
        ],
      },
      {
        sendEmail: async () => {
          throw new Error("gmail_down");
        },
        addIssueComment: async () => {},
      },
    );
    expect(retry).toHaveBeenCalledWith({ delaySeconds: 60 });
  });
});
