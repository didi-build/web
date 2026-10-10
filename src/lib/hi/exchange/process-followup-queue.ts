import { HI_FOLLOWUP_EMAIL_FAILED_COMMENT } from "./linear-comments";
import { LinearHiSink, type LinearHiSinkConfig } from "./linear-hi-sink";
import {
  normalizeHiFollowupQueueMessageBody,
  type HiFollowupQueueMessageBody,
} from "./follow-up-queue";
import { sendHiFollowUpEmail } from "./send-hi-follow-up-email";
import { sendHiOwnerDetailsEmail, sendHiOwnerLeadEmail } from "./send-hi-owner-notification-email";

const MAX_DELIVERY_ATTEMPTS = 5;

export type HiFollowupQueueMessage = {
  readonly id: string;
  readonly attempts: number;
  readonly body: unknown;
  ack(): void;
  retry(options?: { delaySeconds?: number }): void;
};

export type HiFollowupQueueBatch = {
  readonly messages: readonly HiFollowupQueueMessage[];
};

export type HiFollowupConsumerEnv = {
  GMAIL_SERVICE_ACCOUNT_JSON: string;
  GMAIL_SENDER: string;
  LINEAR_API_KEY: string;
  LINEAR_TEAM_ID: string;
  LINEAR_PROJECT_ID: string;
  LINEAR_LEAD_LABEL_ID: string;
  LEAD_NOTIFY_TO: string;
};

export type HiFollowupConsumerDeps = {
  leadNotifyTo: string;
  sendVisitorFollowUp: (lead: { name: string; email: string }) => Promise<void>;
  sendOwnerLead: (
    message: Extract<HiFollowupQueueMessageBody, { kind: "owner_lead" }>,
  ) => Promise<void>;
  sendOwnerDetails: (
    message: Extract<HiFollowupQueueMessageBody, { kind: "owner_details" }>,
  ) => Promise<void>;
  addIssueComment: (issueId: string, body: string) => Promise<void>;
};

export function hiFollowupRetryDelaySeconds(attempt: number): number {
  return Math.min(900, 30 * 2 ** Math.max(0, attempt - 1));
}

export function createHiFollowupConsumerDepsFromEnv(
  env: HiFollowupConsumerEnv,
): HiFollowupConsumerDeps {
  const gmailConfig = {
    serviceAccountJson: env.GMAIL_SERVICE_ACCOUNT_JSON,
    senderEmail: env.GMAIL_SENDER,
  };
  const linearConfig: LinearHiSinkConfig = {
    apiKey: env.LINEAR_API_KEY,
    teamId: env.LINEAR_TEAM_ID,
    projectId: env.LINEAR_PROJECT_ID,
    leadLabelId: env.LINEAR_LEAD_LABEL_ID,
  };
  const linear = new LinearHiSink(linearConfig);
  const leadNotifyTo = env.LEAD_NOTIFY_TO;
  return {
    leadNotifyTo,
    sendVisitorFollowUp: (lead) => sendHiFollowUpEmail(lead, gmailConfig),
    sendOwnerLead: (message) =>
      sendHiOwnerLeadEmail(
        {
          name: message.name,
          email: message.email,
          phone: message.phone,
          linearIdentifier: message.linearIdentifier,
          linearUrl: message.linearUrl,
          receivedAtIso: message.receivedAtIso,
        },
        gmailConfig,
        leadNotifyTo,
      ),
    sendOwnerDetails: (message) =>
      sendHiOwnerDetailsEmail(
        {
          name: message.name,
          jobTitle: message.jobTitle,
          company: message.company,
          note: message.note,
          linearIdentifier: message.linearIdentifier,
          linearUrl: message.linearUrl,
        },
        gmailConfig,
        leadNotifyTo,
      ),
    addIssueComment: (issueId, body) => linear.addIssueComment(issueId, body),
  };
}

async function deliverFollowupMessage(
  body: HiFollowupQueueMessageBody,
  deps: HiFollowupConsumerDeps,
): Promise<void> {
  switch (body.kind) {
    case "visitor_followup":
      await deps.sendVisitorFollowUp({ name: body.name, email: body.email });
      return;
    case "owner_lead":
      await deps.sendOwnerLead(body);
      return;
    case "owner_details":
      await deps.sendOwnerDetails(body);
      return;
    default: {
      const _exhaustive: never = body;
      throw new Error(`hi_followup_unknown_kind_${String(_exhaustive)}`);
    }
  }
}

function issueIdForMessage(body: HiFollowupQueueMessageBody): string {
  return body.issueId;
}

function logTagForKind(kind: HiFollowupQueueMessageBody["kind"]): string {
  switch (kind) {
    case "visitor_followup":
      return "hi_followup_email_failed";
    case "owner_lead":
      return "hi_owner_lead_email_failed";
    case "owner_details":
      return "hi_owner_details_email_failed";
    default:
      return "hi_followup_email_failed";
  }
}

export async function processHiFollowupQueueBatch(
  batch: HiFollowupQueueBatch,
  deps: HiFollowupConsumerDeps,
): Promise<void> {
  for (const message of batch.messages) {
    const body = normalizeHiFollowupQueueMessageBody(message.body);
    if (!body) {
      console.error("hi_followup_invalid_message", message.id);
      message.ack();
      continue;
    }

    try {
      await deliverFollowupMessage(body, deps);
      message.ack();
    } catch (error) {
      console.error(
        logTagForKind(body.kind),
        message.id,
        error instanceof Error ? error.message : "unknown",
      );
      if (body.kind === "visitor_followup" && message.attempts >= MAX_DELIVERY_ATTEMPTS) {
        try {
          await deps.addIssueComment(issueIdForMessage(body), HI_FOLLOWUP_EMAIL_FAILED_COMMENT);
        } catch (commentError) {
          console.error(
            "hi_followup_linear_comment_failed",
            commentError instanceof Error ? commentError.message : "unknown",
          );
        }
        message.ack();
        continue;
      }
      if (message.attempts >= MAX_DELIVERY_ATTEMPTS) {
        message.ack();
        continue;
      }
      message.retry({ delaySeconds: hiFollowupRetryDelaySeconds(message.attempts) });
    }
  }
}
