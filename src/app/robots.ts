import type { MetadataRoute } from "next";
import { siteContent } from "@/content/site";

const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
] as const;

export default function robots(): MetadataRoute.Robots {
  const sitemap = `${siteContent.meta.siteUrl}/sitemap.xml`;

  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/" as const })),
    ],
    sitemap,
  };
}
