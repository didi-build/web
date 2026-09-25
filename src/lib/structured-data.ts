import { siteContent } from "@/content/site";

function absoluteUrl(path: string): string {
  const base = siteContent.meta.siteUrl.replace(/\/$/, "");
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildStructuredDataGraph(): Record<string, unknown> {
  const { brand, meta, footer, founder, whatIDo, faq } = siteContent;
  const siteUrl = meta.siteUrl.replace(/\/$/, "");
  const siteId = `${siteUrl}/#website`;
  const businessId = `${siteUrl}/#business`;
  const personId = `${siteUrl}/#founder`;
  const faqId = `${siteUrl}/#faq`;
  const ogImage = absoluteUrl("/opengraph-image");
  const logo = absoluteUrl("/icon.svg");

  const serviceItems = whatIDo.examples.map((example, index) => ({
    "@type": "Offer",
    "@id": `${siteUrl}/#service-${index + 1}`,
    itemOffered: {
      "@type": "Service",
      name: example.title,
      description: example.body,
    },
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": siteId,
        url: `${siteUrl}/`,
        name: brand,
        description: meta.businessDescription,
        publisher: { "@id": businessId },
      },
      {
        "@type": "ProfessionalService",
        "@id": businessId,
        name: brand,
        url: `${siteUrl}/`,
        logo,
        image: ogImage,
        email: siteContent.contact.email,
        description: meta.businessDescription,
        areaServed: [
          { "@type": "City", name: "Toronto" },
          { "@type": "AdministrativeArea", name: "Ontario" },
          { "@type": "Country", name: "Canada" },
        ],
        serviceType: whatIDo.examples.map((e) => e.title),
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: whatIDo.headline,
          itemListElement: serviceItems,
        },
        founder: { "@id": personId },
      },
      {
        "@type": "Person",
        "@id": personId,
        name: founder.name,
        jobTitle: founder.jobTitle,
        url: `${siteUrl}/`,
        sameAs: [footer.linkedin.href, footer.github.href, footer.portfolio.href],
        worksFor: { "@id": businessId },
      },
      {
        "@type": "FAQPage",
        "@id": faqId,
        mainEntity: faq.items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}

export function structuredDataJsonLd(): string {
  return JSON.stringify(buildStructuredDataGraph());
}
