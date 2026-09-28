import { describe, expect, it } from "vitest";
import { CHECK_IDS, CHECK_REGISTRY } from "./registry";

describe("visibility check registry", () => {
  it("has a non-empty whyItMatters for every check id", () => {
    for (const id of CHECK_IDS) {
      const entry = CHECK_REGISTRY[id];
      expect(entry.whyItMatters.trim().length).toBeGreaterThan(20);
      expect(entry.label.trim().length).toBeGreaterThan(0);
      expect(entry.howToFix.trim().length).toBeGreaterThan(10);
      expect(entry.whyItMatters).not.toMatch(/—/);
      expect(entry.howToFix).not.toMatch(/—/);
      expect(entry.label).not.toMatch(/—/);
    }
  });
});
