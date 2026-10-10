export type HiVisitorFollowupEmailMessage = {
  kind: "visitor_followup";
  issueId: string;
  name: string;
  email: string;
};

export type HiOwnerLeadEmailMessage = {
  kind: "owner_lead";
  issueId: string;
  name: string;
  email: string;
  phone?: string;
  linearIdentifier: string;
  linearUrl: string;
  receivedAtIso: string;
};

export type HiOwnerDetailsEmailMessage = {
  kind: "owner_details";
  issueId: string;
  name: string;
  linearIdentifier: string;
  linearUrl: string;
  jobTitle?: string;
  company?: string;
  note?: string;
};

export type HiFollowupQueueMessageBody =
  HiVisitorFollowupEmailMessage | HiOwnerLeadEmailMessage | HiOwnerDetailsEmailMessage;

/** @deprecated Use HiFollowupQueueMessageBody */
export type HiFollowupEmailMessage = HiVisitorFollowupEmailMessage;

export interface HiFollowUpQueue {
  enqueue(message: HiFollowupQueueMessageBody): Promise<void>;
  enqueueRequired(messages: HiFollowupQueueMessageBody[]): Promise<void>;
}

type QueueProducer = {
  send(body: HiFollowupQueueMessageBody): Promise<unknown>;
  sendBatch?(messages: Array<{ body: HiFollowupQueueMessageBody }>): Promise<unknown>;
};

export class CloudflareHiFollowUpQueue implements HiFollowUpQueue {
  constructor(private readonly queue: QueueProducer) {}

  async enqueue(message: HiFollowupQueueMessageBody): Promise<void> {
    await this.queue.send(message);
  }

  async enqueueRequired(messages: HiFollowupQueueMessageBody[]): Promise<void> {
    if (messages.length === 0) {
      return;
    }
    if (this.queue.sendBatch) {
      await this.queue.sendBatch(messages.map((body) => ({ body })));
      return;
    }
    for (const message of messages) {
      await this.queue.send(message);
    }
  }
}

export function normalizeHiFollowupQueueMessageBody(
  body: unknown,
): HiFollowupQueueMessageBody | null {
  if (!body || typeof body !== "object") {
    return null;
  }
  const record = body as Record<string, unknown>;
  if (record.kind === "visitor_followup") {
    return body as HiVisitorFollowupEmailMessage;
  }
  if (record.kind === "owner_lead") {
    return body as HiOwnerLeadEmailMessage;
  }
  if (record.kind === "owner_details") {
    return body as HiOwnerDetailsEmailMessage;
  }
  if (
    typeof record.issueId === "string" &&
    typeof record.name === "string" &&
    typeof record.email === "string"
  ) {
    return {
      kind: "visitor_followup",
      issueId: record.issueId,
      name: record.name,
      email: record.email,
    };
  }
  return null;
}
