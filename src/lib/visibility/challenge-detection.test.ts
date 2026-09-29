import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  isBotChallengeBody,
  isValidSitemapXml,
  parseRobotsSitemapUrls,
} from "./challenge-detection";

const fixturesDir = join(__dirname, "__fixtures__");

describe("challenge detection", () => {
  it("detects SiteGround captcha challenge HTML and header", () => {
    const body = readFileSync(join(fixturesDir, "siteground-challenge.html"), "utf8");
    expect(isBotChallengeBody(body, { "sg-captcha": "challenge" })).toBe(true);
    expect(isBotChallengeBody(body)).toBe(true);
  });

  it("accepts sitemapindex XML", () => {
    const index =
      '<?xml version="1.0"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>https://example.com/page-sitemap.xml</loc></sitemap></sitemapindex>';
    expect(isValidSitemapXml(index)).toBe(true);
  });

  it("parses Sitemap lines from robots.txt", () => {
    const urls = parseRobotsSitemapUrls(
      "User-agent: *\nDisallow:\nSitemap: https://example.com/sitemap_index.xml\n",
    );
    expect(urls).toEqual(["https://example.com/sitemap_index.xml"]);
  });

  it("does not treat casual copy containing 'just a moment' as a bot challenge", () => {
    const body = readFileSync(join(fixturesDir, "page-with-just-a-moment-copy.html"), "utf8");
    expect(isBotChallengeBody(body)).toBe(false);
  });

  it("detects Cloudflare interstitial challenges with title and cf markers", () => {
    const body = readFileSync(join(fixturesDir, "cloudflare-challenge.html"), "utf8");
    expect(isBotChallengeBody(body)).toBe(true);
    expect(isBotChallengeBody(body, { "cf-mitigated": "challenge" })).toBe(true);
  });
});
