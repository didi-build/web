import { describe, expect, it } from "vitest";
import { siteContent } from "@/content/site";
import { buildLlmsTxt } from "./llms-txt";

describe("buildLlmsTxt", () => {
  it("includes contact URL, email, and social links from site content", () => {
    const text = buildLlmsTxt();
    expect(text).toContain(`#${siteContent.sectionIds.contact}`);
    expect(text).toContain(siteContent.contact.email);
    expect(text).toContain(siteContent.footer.linkedin.href);
    expect(text).toContain(siteContent.footer.github.href);
    expect(text).toContain(siteContent.footer.portfolio.href);
  });

  it("lists each service example from What I do", () => {
    const text = buildLlmsTxt();
    for (const example of siteContent.whatIDo.examples) {
      expect(text).toContain(example.title);
    }
  });
});
