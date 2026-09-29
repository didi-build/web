export type UrlCategory = "siteground_challenged" | "wix" | "squarespace" | "client_spa";

export type TestTarget = {
  category: UrlCategory;
  label: string;
  url: string;
  /** How we confirmed the category (for the run log). */
  platformNote: string;
};

/**
 * Default spike targets. Replace URLs before a production run if needed.
 */
export const TEST_TARGETS: TestTarget[] = [
  {
    category: "siteground_challenged",
    label: "SiteGround challenged",
    url: "https://thrivehivestudio.ca",
    platformNote: "Known sgcaptcha meta refresh from visibility fixtures / prior checks",
  },
  {
    category: "wix",
    label: "Wix",
    url: "https://www.drlisathompson.com",
    platformNote: "meta generator Wix.com; parastorage / wixstatic in HTML",
  },
  {
    category: "squarespace",
    label: "Squarespace",
    url: "https://www.kinfield.com",
    platformNote: "Squarespace HTML comment + static.squarespace.com assets",
  },
  {
    category: "client_spa",
    label: "Client-rendered SPA",
    url: "https://react.dev",
    platformNote: "Nearly empty #__next shell in raw HTML; content after JS",
  },
];
