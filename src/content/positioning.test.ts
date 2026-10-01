import { describe, expect, it } from "vitest";
import { aiIntegrationAngle, mvpProductionReadyAngle } from "./positioning";
import { siteContent } from "./site";

const EM_DASH = "\u2014";

function collectStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
}

describe("business positioning (DIDI-477)", () => {
  it("does not use em dashes in canonical positioning blocks", () => {
    for (const text of collectStrings({ mvpProductionReadyAngle, aiIntegrationAngle })) {
      expect(text).not.toContain(EM_DASH);
    }
  });

  it("surfaces MVP production-ready example on the site", () => {
    const titles = siteContent.whatIDo.examples.map((e) => e.title);
    expect(titles).toContain(mvpProductionReadyAngle.exampleTitle);
  });
});
