export type CheckRegistryEntry = {
  id: string;
  label: string;
  whyItMatters: string;
  howToFix: string;
};

export const CHECK_REGISTRY: Record<string, CheckRegistryEntry> = {
  https: {
    id: "https",
    label: "Secure HTTPS connection",
    whyItMatters:
      "Browsers and search engines trust sites that load over HTTPS. Visitors may see warnings on HTTP-only sites.",
    howToFix: "Ask your web host to enable HTTPS and redirect all HTTP traffic to HTTPS.",
  },
  title: {
    id: "title",
    label: "Page title",
    whyItMatters:
      "The title is what people see in Google results and browser tabs. A clear title helps people recognize your business.",
    howToFix:
      "Add a short, descriptive <title> tag in your site's header that names your business.",
  },
  metaDescription: {
    id: "metaDescription",
    label: "Meta description",
    whyItMatters:
      "The meta description often appears under your title in search results. It gives searchers a reason to click.",
    howToFix:
      "Add a meta description tag (about one or two sentences) that explains what you do and who you help.",
  },
  h1: {
    id: "h1",
    label: "Main heading (H1)",
    whyItMatters:
      "One clear main heading helps visitors and search engines understand what the page is about at a glance.",
    howToFix: "Use exactly one H1 on your homepage that states your business name or main offer.",
  },
  viewport: {
    id: "viewport",
    label: "Mobile-friendly viewport",
    whyItMatters:
      "Most people browse on phones. Without a viewport tag, your site may look tiny or hard to use on mobile.",
    howToFix:
      'Add <meta name="viewport" content="width=device-width, initial-scale=1"> in your page head.',
  },
  openGraph: {
    id: "openGraph",
    label: "Social sharing preview (Open Graph)",
    whyItMatters:
      "When someone shares your link on social media or messaging apps, Open Graph tags control the preview image and text.",
    howToFix:
      "Add og:title, og:description, and og:image meta tags so shared links look professional.",
  },
  structuredData: {
    id: "structuredData",
    label: "Structured business data (JSON-LD)",
    whyItMatters:
      "Structured data helps Google and other services understand your business type, name, and location.",
    howToFix:
      "Add JSON-LD markup for LocalBusiness or Organization with your name, URL, and contact details.",
  },
  contactInfo: {
    id: "contactInfo",
    label: "Visible contact information",
    whyItMatters:
      "Visitors and search engines look for a phone, email, or address. Missing contact info can reduce trust and leads.",
    howToFix:
      "Show a phone number, email, or physical address (or clear service area) on your homepage or footer.",
  },
  robotsTxt: {
    id: "robotsTxt",
    label: "robots.txt file",
    whyItMatters:
      "robots.txt tells search and AI crawlers what they may read. A missing file is usually fine, but blocking rules can hide your site.",
    howToFix:
      "Publish a robots.txt at your site root, and avoid blocking crawlers you want to find you unless you have a reason.",
  },
  aiCrawlers: {
    id: "aiCrawlers",
    label: "AI assistant crawlers",
    whyItMatters:
      "If robots.txt blocks AI crawlers, assistants like ChatGPT may not read your site, so they cannot recommend you.",
    howToFix:
      "Remove Disallow rules for GPTBot, ClaudeBot, PerplexityBot, and Google-Extended if you want AI tools to cite you.",
  },
  sitemap: {
    id: "sitemap",
    label: "XML sitemap",
    whyItMatters:
      "A sitemap helps search engines discover all your important pages, especially newer or deeper pages.",
    howToFix: "Add a sitemap.xml at your site root and submit it in Google Search Console.",
  },
  llmsTxt: {
    id: "llmsTxt",
    label: "llms.txt file",
    whyItMatters:
      "llms.txt is an emerging standard that tells AI systems how to summarize and link to your business accurately.",
    howToFix:
      "Add an llms.txt file at your site root with a short description of your business and key pages.",
  },
};

export const CHECK_IDS = Object.keys(CHECK_REGISTRY);

export function registryEntryFor(id: string): CheckRegistryEntry {
  const entry = CHECK_REGISTRY[id];
  if (!entry) {
    throw new Error(`Unknown check id: ${id}`);
  }
  return entry;
}
