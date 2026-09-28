import { describe, expect, it } from "vitest";
import { businessLinks, founderLinks } from "./profile-links";

describe("profile-links", () => {
  it("lists Didi Build business profiles for the footer and Organization JSON-LD", () => {
    expect(founderLinks.map((l) => l.href)).toEqual([
      "https://portfolio.didi.build",
      "https://github.com/DiademShoukralla/",
      "https://www.linkedin.com/in/diadem-shoukralla/",
    ]);
    expect(businessLinks.map((l) => l.href)).toEqual([
      "https://www.linkedin.com/company/didi-build",
      "https://github.com/didi-build/",
      "https://share.google/3BoTSKdmxNKgKCExS",
    ]);
  });
});
