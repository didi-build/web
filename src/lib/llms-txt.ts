import { siteContent } from "@/content/site";

export function buildLlmsTxt(): string {
  const { brand, meta, contact, footer, whatIDo, founder, about, llms } = siteContent;
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

## Links

- LinkedIn: ${footer.linkedin.href}
- GitHub: ${footer.github.href}
- Portfolio: ${footer.portfolio.href}
`;
}
