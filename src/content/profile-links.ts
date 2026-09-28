export type ProfileLinkIcon = "portfolio" | "github" | "linkedin" | "google";

export type ProfileLink = {
  label: string;
  href: string;
  icon: ProfileLinkIcon;
};

/** Didi Build business profiles (footer, Organization JSON-LD). */
export const businessLinks = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/didi-build",
    icon: "linkedin",
  },
  {
    label: "GitHub",
    href: "https://github.com/didi-build/",
    icon: "github",
  },
  {
    label: "Google",
    href: "https://share.google/3BoTSKdmxNKgKCExS",
    icon: "google",
  },
] as const satisfies readonly ProfileLink[];

/** Founder personal profiles (About section, Person JSON-LD). */
export const founderLinks = [
  {
    label: "Portfolio",
    href: "https://portfolio.didi.build",
    icon: "portfolio",
  },
  {
    label: "GitHub",
    href: "https://github.com/DiademShoukralla/",
    icon: "github",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/diadem-shoukralla/",
    icon: "linkedin",
  },
] as const satisfies readonly ProfileLink[];

export function profileLinkHrefs(links: readonly ProfileLink[]): string[] {
  return links.map((link) => link.href);
}
