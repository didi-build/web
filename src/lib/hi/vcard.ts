import { getFounderLinkByIcon } from "@/content/profile-links";
import { siteContent } from "@/content/site";

export type HiContactConfig = (typeof siteContent)["hi"]["contact"];

const CRLF = "\r\n";

/** Escape text values per vCard 3.0 (RFC 2426). */
export function escapeVCardValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n/g, "\\n")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\n");
}

export function buildVCard(contact: HiContactConfig, siteUrl: string): string {
  const linkedIn = getFounderLinkByIcon("linkedin").href;
  const github = getFounderLinkByIcon("github").href;

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVCardValue(contact.name.family)};${escapeVCardValue(contact.name.given)};;;`,
    `FN:${escapeVCardValue(contact.name.full)}`,
    `NICKNAME:${escapeVCardValue(contact.name.nickname)}`,
    `ORG:${escapeVCardValue(contact.org)}`,
    `TITLE:${escapeVCardValue(contact.title)}`,
    `EMAIL;TYPE=INTERNET,WORK:${contact.email}`,
    `TEL;TYPE=CELL:${contact.phone}`,
    `URL:${siteUrl}`,
    `URL;TYPE=LinkedIn:${linkedIn}`,
    `URL;TYPE=GitHub:${github}`,
    `NOTE:${escapeVCardValue(contact.vcardNote)}`,
    "END:VCARD",
  ];

  return lines.join(CRLF);
}
