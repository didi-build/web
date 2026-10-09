import { siteContent } from "@/content/site";
import { buildVCard } from "@/lib/hi/vcard";
import {
  buildRawEmailWithVCardAttachment,
  getGmailAccessToken,
  type GmailServiceAccountConfig,
} from "@/lib/hi/gmail-auth";
import {
  buildHiFollowUpEmailHtml,
  buildHiFollowUpEmailPlain,
  formatHiFollowUpEmailSubject,
  firstNameForHiEmail,
} from "./format-follow-up-email";

const GMAIL_SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

export async function sendHiFollowUpEmail(
  lead: { name: string; email: string },
  config: GmailServiceAccountConfig,
): Promise<void> {
  const firstName = firstNameForHiEmail(lead.name);
  const accessToken = await getGmailAccessToken(config);
  const contact = siteContent.hi.contact;
  const vcard = buildVCard(contact, siteContent.meta.siteUrl);
  const subject = formatHiFollowUpEmailSubject(firstName);
  const textPlain = buildHiFollowUpEmailPlain(firstName);
  const textHtml = buildHiFollowUpEmailHtml(firstName);

  const raw = buildRawEmailWithVCardAttachment({
    from: config.senderEmail,
    to: lead.email,
    subject,
    textPlain,
    textHtml,
    vcardFilename: "Didi-Shoukralla.vcf",
    vcardBody: vcard,
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
