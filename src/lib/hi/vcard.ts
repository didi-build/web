import { HI_HEADSHOT_MIME, HI_HEADSHOT_PNG_BASE64 } from "@/content/hi-headshot-base64";
import { getFounderLinkByIcon } from "@/content/profile-links";
import { siteContent } from "@/content/site";

export type HiContactConfig = (typeof siteContent)["hi"]["contact"];

const CRLF = "\r\n";
const VCARD_LINE_MAX = 75;

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

/** Fold a single vCard content line per RFC 2426 (75 octets, continuation with CRLF + space). */
export function foldVCardLine(line: string): string {
  if (line.length <= VCARD_LINE_MAX) {
    return line;
  }
  const chunks: string[] = [line.slice(0, VCARD_LINE_MAX)];
  let index = VCARD_LINE_MAX;
  while (index < line.length) {
    chunks.push(` ${line.slice(index, index + VCARD_LINE_MAX - 1)}`);
    index += VCARD_LINE_MAX - 1;
  }
  return chunks.join(CRLF);
}

function joinVCardLines(lines: string[]): string {
  return lines.map(foldVCardLine).join(CRLF) + CRLF;
}

export function buildVCard(contact: HiContactConfig, siteUrl: string): string {
  const linkedIn = getFounderLinkByIcon("linkedin").href;
  const github = getFounderLinkByIcon("github").href;
  const photoType = HI_HEADSHOT_MIME === "image/png" ? "PNG" : "JPEG";

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
    `PHOTO;ENCODING=b;TYPE=${photoType}:${HI_HEADSHOT_PNG_BASE64}`,
    `URL:${siteUrl}`,
    `URL;TYPE=LinkedIn:${linkedIn}`,
    `URL;TYPE=GitHub:${github}`,
    `NOTE:${escapeVCardValue(contact.vcardNote)}`,
    "END:VCARD",
  ];

  return joinVCardLines(lines);
}
