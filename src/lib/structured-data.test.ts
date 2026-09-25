import { describe, expect, it } from "vitest";
import { siteContent } from "@/content/site";
import { buildStructuredDataGraph, structuredDataJsonLd } from "./structured-data";

describe("buildStructuredDataGraph", () => {
  it("includes WebSite, ProfessionalService, Person, and FAQPage in @graph", () => {
    const graph = buildStructuredDataGraph();
    const nodes = graph["@graph"] as Array<{ "@type": string }>;
    const types = nodes.map((n) => n["@type"]);
    expect(types).toContain("WebSite");
    expect(types).toContain("ProfessionalService");
    expect(types).toContain("Person");
    expect(types).toContain("FAQPage");
  });

  it("does not include street address or telephone on the business entity", () => {
    const graph = buildStructuredDataGraph();
    const nodes = graph["@graph"] as Record<string, unknown>[];
    const business = nodes.find((n) => n["@type"] === "ProfessionalService");
    expect(business).toBeDefined();
    expect(business).not.toHaveProperty("telephone");
    expect(business).not.toHaveProperty("address");
  });

  it("matches FAQ visible copy exactly", () => {
    const graph = buildStructuredDataGraph();
    const nodes = graph["@graph"] as Array<{
      "@type": string;
      mainEntity?: Array<{ name: string; acceptedAnswer: { text: string } }>;
    }>;
    const faqPage = nodes.find((n) => n["@type"] === "FAQPage");
    expect(faqPage?.mainEntity).toHaveLength(siteContent.faq.items.length);
    faqPage?.mainEntity?.forEach((entity, index) => {
      expect(entity.name).toBe(siteContent.faq.items[index]?.question);
      expect(entity.acceptedAnswer.text).toBe(siteContent.faq.items[index]?.answer);
    });
  });

  it("serializes to valid JSON for JSON-LD script", () => {
    expect(() => JSON.parse(structuredDataJsonLd())).not.toThrow();
  });
});
