import { describe, expect, it } from "vitest";
import { businessLinks, founderLinks, type ProfileLink } from "./profile-links";

function assertLinkListIntegrity(
  links: readonly ProfileLink[],
  options?: { requireAriaLabel?: boolean },
) {
  const hrefs: string[] = [];

  for (const link of links) {
    expect(link.label.trim().length).toBeGreaterThan(0);
    expect(link.href).toMatch(/^https:\/\/.+/);

    if (options?.requireAriaLabel) {
      expect(link.ariaLabel?.trim().length).toBeGreaterThan(0);
    }

    hrefs.push(link.href);
  }

  expect(new Set(hrefs).size).toBe(hrefs.length);
}

describe("profile-links", () => {
  it("keeps founder links well-formed and unique", () => {
    assertLinkListIntegrity(founderLinks);
    expect(founderLinks.map((l) => l.icon).sort()).toEqual(["github", "linkedin", "portfolio"]);
  });

  it("keeps business links well-formed, unique, and with accessible names for icon-only footer links", () => {
    assertLinkListIntegrity(businessLinks, { requireAriaLabel: true });
  });
});
