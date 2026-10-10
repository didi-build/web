import {
  buildOwnerDetailsEmailHtml,
  buildOwnerDetailsEmailPlain,
  buildOwnerLeadEmailHtml,
  buildOwnerLeadEmailPlain,
  formatOwnerDetailsEmailSubject,
  formatOwnerLeadEmailSubject,
  readHiEmailFromName,
  type OwnerDetailsEmailContentInput,
  type OwnerLeadEmailContentInput,
} from "./format-owner-notification-email";
import {
  buildRawEmailMessage,
  getGmailAccessToken,
  type GmailServiceAccountConfig,
} from "@/lib/hi/gmail-auth";

const GMAIL_SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

function gmailConfigWithDisplayName(config: GmailServiceAccountConfig): GmailServiceAccountConfig {
  return {
    ...config,
    senderDisplayName: config.senderDisplayName ?? readHiEmailFromName(),
  };
}

async function sendRawMimeEmail(
  config: GmailServiceAccountConfig,
  options: {
    to: string;
    subject: string;
    textPlain: string;
    textHtml: string;
    replyTo?: string;
  },
): Promise<void> {
  const resolved = gmailConfigWithDisplayName(config);
  const accessToken = await getGmailAccessToken(resolved);
  const raw = buildRawEmailMessage({
    from: resolved.senderEmail,
    fromDisplayName: resolved.senderDisplayName,
    to: options.to,
    subject: options.subject,
    textPlain: options.textPlain,
    textHtml: options.textHtml,
    replyTo: options.replyTo,
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

export async function sendHiOwnerLeadEmail(
  input: OwnerLeadEmailContentInput,
  config: GmailServiceAccountConfig,
  notifyTo: string,
): Promise<void> {
  await sendRawMimeEmail(gmailConfigWithDisplayName(config), {
    to: notifyTo,
    replyTo: input.email,
    subject: formatOwnerLeadEmailSubject(input.name),
    textPlain: buildOwnerLeadEmailPlain(input),
    textHtml: buildOwnerLeadEmailHtml(input),
  });
}

export async function sendHiOwnerDetailsEmail(
  input: OwnerDetailsEmailContentInput,
  config: GmailServiceAccountConfig,
  notifyTo: string,
): Promise<void> {
  await sendRawMimeEmail(gmailConfigWithDisplayName(config), {
    to: notifyTo,
    subject: formatOwnerDetailsEmailSubject(input.name),
    textPlain: buildOwnerDetailsEmailPlain(input),
    textHtml: buildOwnerDetailsEmailHtml(input),
  });
}
