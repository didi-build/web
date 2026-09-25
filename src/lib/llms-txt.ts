import { siteContent } from "@/content/site";

export function buildLlmsTxt(): string {
  const { brand, meta, contact, footer, whatIDo, founder, about } = siteContent;
  const siteUrl = meta.siteUrl.replace(/\/$/, "");
  const contactUrl = `${siteUrl}/#${siteContent.sectionIds.contact}`;
  const serviceLines = whatIDo.examples.map((e) => `- ${e.title}: ${e.body}`).join("\n");

  return `# ${brand}

${meta.description} ${about.lead}

## Who it is for

Small businesses in Canada that want practical AI integration: automation, document handling, private assistants, and inbox tools, without hiring a full technical team.

## Services

${serviceLines}

## Service area

Based in Toronto, Ontario. Remote work across Canada; in-person locally when it helps.

## About

${founder.name}, ${founder.jobTitle}. ${about.followUp}

## Contact

- Book a chat: ${contactUrl}
- Email: ${contact.email}

## Links

- LinkedIn: ${footer.linkedin.href}
- GitHub: ${footer.github.href}
- Portfolio: ${footer.portfolio.href}
`;
}
