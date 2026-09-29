import {
  buildLeadEmailHtml,
  buildLeadEmailPlainText,
  formatLeadEmailSubject,
} from "./format-lead-email";
import {
  buildRawEmailMessage,
  getGmailAccessToken,
  type GmailServiceAccountConfig,
} from "./gmail-auth";
import type { LeadRecord, LeadSink, LeadSummary } from "./types";
import type { VisibilityReport } from "../visibility/types";

const GMAIL_SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

export type EmailLeadSinkConfig = GmailServiceAccountConfig & {
  toEmail: string;
};

export class EmailLeadSink implements LeadSink {
  constructor(private readonly config: EmailLeadSinkConfig) {}

  async submit(
    lead: LeadRecord,
    summary: LeadSummary | null,
    visibilityReport: VisibilityReport | null,
  ): Promise<void> {
    const accessToken = await getGmailAccessToken({
      serviceAccountJson: this.config.serviceAccountJson,
      senderEmail: this.config.senderEmail,
    });

    const subject = formatLeadEmailSubject(lead, visibilityReport);
    const textPlain = buildLeadEmailPlainText(lead, summary, visibilityReport);
    const textHtml = buildLeadEmailHtml(lead, summary, visibilityReport);
    const raw = buildRawEmailMessage({
      from: this.config.senderEmail,
      to: this.config.toEmail,
      subject,
      textPlain,
      textHtml,
    });

    const response = await fetch(GMAIL_SEND_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ raw }),
    });

    if (!response.ok) {
      throw new Error(`gmail_send_http_${response.status}`);
    }
  }
}
