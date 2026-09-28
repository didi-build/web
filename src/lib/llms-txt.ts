import { businessLinks, founderLinks } from "@/content/profile-links";
import { siteContent } from "@/content/site";

function formatLinkLines(links: readonly { label: string; href: string }[]): string {
  return links.map((link) => `- ${link.label}: ${link.href}`).join("\n");
}

export function buildLlmsTxt(): string {
  const { brand, meta, contact, whatIDo, founder, about, llms } = siteContent;
  const siteUrl = meta.siteUrl.replace(/\/$/, "");
  const contactUrl = `${siteUrl}/#${siteContent.sectionIds.contact}`;
  const serviceLines = whatIDo.examples.map((e) => `- ${e.title}: ${e.body}`).join("\n");

  return `# ${brand}

${meta.businessDescription} ${about.lead}

## Who it is for

${llms.whoItIsFor}

## Services

${serviceLines}

## Service area

${llms.serviceArea}

## About

${founder.name}, ${founder.jobTitle}. ${about.followUp}

## Contact

- Book a chat: ${contactUrl}
- Email: ${contact.email}

## Business links

${formatLinkLines(businessLinks)}

## Founder links

${formatLinkLines(founderLinks)}
`;
}
