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
} from "./format-follow-up-email";
import type { HiCardLead, HiVisitorEmailSink } from "./types";

const GMAIL_SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

export class GmailVisitorEmailSink implements HiVisitorEmailSink {
  constructor(private readonly config: GmailServiceAccountConfig) {}

  async sendContactCard(lead: HiCardLead, firstName: string): Promise<void> {
    const accessToken = await getGmailAccessToken(this.config);
    const contact = siteContent.hi.contact;
    const vcard = buildVCard(contact, siteContent.meta.siteUrl);
    const subject = formatHiFollowUpEmailSubject(firstName);
    const textPlain = buildHiFollowUpEmailPlain(firstName);
    const textHtml = buildHiFollowUpEmailHtml(firstName);

    const raw = buildRawEmailWithVCardAttachment({
      from: this.config.senderEmail,
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
}
