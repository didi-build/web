export type ProfileLinkIcon = "portfolio" | "github" | "linkedin" | "google";

export type ProfileLink = {
  label: string;
  href: string;
  icon: ProfileLinkIcon;
  /** Accessible name for icon-only links (e.g. footer). Falls back to `label`. */
  ariaLabel?: string;
};

/** Didi Build business profiles (footer, Organization JSON-LD). */
export const businessLinks = [
  {
    label: "LinkedIn",
    ariaLabel: "Didi Build on LinkedIn",
    href: "https://www.linkedin.com/company/didi-build",
    icon: "linkedin",
  },
  {
    label: "GitHub",
    ariaLabel: "Didi Build on GitHub",
    href: "https://github.com/didi-build/",
    icon: "github",
  },
  {
    label: "Google",
    ariaLabel: "Find Didi Build on Google",
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

export function profileLinkAriaLabel(link: ProfileLink): string {
  return link.ariaLabel ?? link.label;
}

export function getFounderLinkByIcon(icon: ProfileLinkIcon): ProfileLink {
  const link = founderLinks.find((entry) => entry.icon === icon);
  if (!link) {
    throw new Error(`Missing founder profile link for icon: ${icon}`);
  }
  return link;
}
