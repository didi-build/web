import { HI_FOLLOWUP_EMAIL_FAILED_COMMENT } from "./linear-comments";
import { LinearHiSink, type LinearHiSinkConfig } from "./linear-hi-sink";
import type { HiFollowupEmailMessage } from "./follow-up-queue";
import { sendHiFollowUpEmail } from "./send-hi-follow-up-email";

const MAX_DELIVERY_ATTEMPTS = 5;

export type HiFollowupQueueMessage = {
  readonly id: string;
  readonly attempts: number;
  readonly body: HiFollowupEmailMessage;
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
};

export type HiFollowupConsumerDeps = {
  sendEmail: (lead: { name: string; email: string }) => Promise<void>;
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
  return {
    sendEmail: (lead) => sendHiFollowUpEmail(lead, gmailConfig),
    addIssueComment: (issueId, body) => linear.addIssueComment(issueId, body),
  };
}

export async function processHiFollowupQueueBatch(
  batch: HiFollowupQueueBatch,
  deps: HiFollowupConsumerDeps,
): Promise<void> {
  for (const message of batch.messages) {
    const { issueId, name, email } = message.body;
    try {
      await deps.sendEmail({ name, email });
      message.ack();
    } catch (error) {
      console.error(
        "hi_followup_email_failed",
        message.id,
        error instanceof Error ? error.message : "unknown",
      );
      if (message.attempts >= MAX_DELIVERY_ATTEMPTS) {
        try {
          await deps.addIssueComment(issueId, HI_FOLLOWUP_EMAIL_FAILED_COMMENT);
        } catch (commentError) {
          console.error(
            "hi_followup_linear_comment_failed",
            commentError instanceof Error ? commentError.message : "unknown",
          );
        }
        message.ack();
        continue;
      }
      message.retry({ delaySeconds: hiFollowupRetryDelaySeconds(message.attempts) });
    }
  }
}
