import { describe, expect, it } from "vitest";
import { businessLinks, founderLinks } from "@/content/profile-links";
import { siteContent } from "@/content/site";
import { buildLlmsTxt } from "./llms-txt";

describe("buildLlmsTxt", () => {
  it("includes contact URL, email, and profile links from config", () => {
    const text = buildLlmsTxt();
    expect(text).toContain(`#${siteContent.sectionIds.contact}`);
    expect(text).toContain(siteContent.contact.email);
    for (const link of [...businessLinks, ...founderLinks]) {
      expect(text).toContain(link.href);
    }
  });

  it("includes businessDescription and llms prose from site content", () => {
    const text = buildLlmsTxt();
    expect(text).toContain(siteContent.meta.businessDescription);
    expect(text).toContain(siteContent.llms.whoItIsFor);
    expect(text).toContain(siteContent.llms.serviceArea);
  });

  it("lists each service example from What I do", () => {
    const text = buildLlmsTxt();
    for (const example of siteContent.whatIDo.founderCards) {
      expect(text).toContain(example.title);
    }
    expect(text).toContain(siteContent.whatIDo.businessCard.title);
  });
});
