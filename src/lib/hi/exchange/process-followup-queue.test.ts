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
  it("acks after max attempts and comments on Linear for visitor follow-up only", async () => {
    const ack = vi.fn();
    const retry = vi.fn();
    const addIssueComment = vi.fn();

    await processHiFollowupQueueBatch(
      {
        messages: [
          {
            id: "m1",
            attempts: 5,
            body: {
              kind: "visitor_followup",
              issueId: "issue-1",
              name: "Sam",
              email: "sam@example.com",
            },
            ack,
            retry,
          },
        ],
      },
      {
        leadNotifyTo: "diadem@didi.build",
        sendVisitorFollowUp: async () => {
          throw new Error("gmail_down");
        },
        sendOwnerLead: async () => {},
        sendOwnerDetails: async () => {},
        addIssueComment,
      },
    );

    expect(ack).toHaveBeenCalledOnce();
    expect(retry).not.toHaveBeenCalled();
    expect(addIssueComment).toHaveBeenCalledWith("issue-1", HI_FOLLOWUP_EMAIL_FAILED_COMMENT);
  });

  it("acks owner notification failures without Linear comment", async () => {
    const ack = vi.fn();
    const addIssueComment = vi.fn();
    await processHiFollowupQueueBatch(
      {
        messages: [
          {
            id: "m2",
            attempts: 5,
            body: {
              kind: "owner_lead",
              issueId: "issue-2",
              name: "Sam",
              email: "sam@example.com",
              linearIdentifier: "DIDI-9",
              linearUrl: "https://linear.app/didi/issue/DIDI-9",
              receivedAtIso: "2026-10-10T12:00:00.000Z",
            },
            ack,
            retry: vi.fn(),
          },
        ],
      },
      {
        leadNotifyTo: "diadem@didi.build",
        sendVisitorFollowUp: async () => {},
        sendOwnerLead: async () => {
          throw new Error("gmail_down");
        },
        sendOwnerDetails: async () => {},
        addIssueComment,
      },
    );
    expect(ack).toHaveBeenCalledOnce();
    expect(addIssueComment).not.toHaveBeenCalled();
  });

  it("handles legacy queue bodies without kind as visitor follow-up", async () => {
    const sendVisitorFollowUp = vi.fn(async () => {});
    await processHiFollowupQueueBatch(
      {
        messages: [
          {
            id: "legacy",
            attempts: 1,
            body: { issueId: "issue-1", name: "Sam", email: "sam@example.com" },
            ack: vi.fn(),
            retry: vi.fn(),
          },
        ],
      },
      {
        leadNotifyTo: "diadem@didi.build",
        sendVisitorFollowUp,
        sendOwnerLead: async () => {},
        sendOwnerDetails: async () => {},
        addIssueComment: async () => {},
      },
    );
    expect(sendVisitorFollowUp).toHaveBeenCalledWith({ name: "Sam", email: "sam@example.com" });
  });

  it("retries with backoff before max attempts", async () => {
    const retry = vi.fn();
    await processHiFollowupQueueBatch(
      {
        messages: [
          {
            id: "m1",
            attempts: 2,
            body: {
              kind: "visitor_followup",
              issueId: "issue-1",
              name: "Sam",
              email: "sam@example.com",
            },
            ack: vi.fn(),
            retry,
          },
        ],
      },
      {
        leadNotifyTo: "diadem@didi.build",
        sendVisitorFollowUp: async () => {
          throw new Error("gmail_down");
        },
        sendOwnerLead: async () => {},
        sendOwnerDetails: async () => {},
        addIssueComment: async () => {},
      },
    );
    expect(retry).toHaveBeenCalledWith({ delaySeconds: 60 });
  });

  it("does not resend visitor email when owner notification fails independently", async () => {
    const sendVisitorFollowUp = vi.fn(async () => {});
    const sendOwnerLead = vi.fn(async () => {
      throw new Error("owner_down");
    });
    const retry = vi.fn();

    await processHiFollowupQueueBatch(
      {
        messages: [
          {
            id: "visitor",
            attempts: 1,
            body: {
              kind: "visitor_followup",
              issueId: "issue-1",
              name: "Sam",
              email: "sam@example.com",
            },
            ack: vi.fn(),
            retry: vi.fn(),
          },
          {
            id: "owner",
            attempts: 1,
            body: {
              kind: "owner_lead",
              issueId: "issue-1",
              name: "Sam",
              email: "sam@example.com",
              linearIdentifier: "DIDI-1",
              linearUrl: "https://linear.app/didi/issue/DIDI-1",
              receivedAtIso: "2026-10-10T12:00:00.000Z",
            },
            ack: vi.fn(),
            retry,
          },
        ],
      },
      {
        leadNotifyTo: "diadem@didi.build",
        sendVisitorFollowUp,
        sendOwnerLead,
        sendOwnerDetails: async () => {},
        addIssueComment: async () => {},
      },
    );

    expect(sendVisitorFollowUp).toHaveBeenCalledOnce();
    expect(sendOwnerLead).toHaveBeenCalledOnce();
    expect(retry).toHaveBeenCalledOnce();
  });
});
