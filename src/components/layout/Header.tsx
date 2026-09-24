"use client";

import { siteContent } from "@/content/site";
import { useTheme } from "@/components/theme/ThemeProvider";
import { ButtonLink } from "@/components/ui/Button";
import Link from "next/link";

export function Header() {
  const { toggleTheme, themeAria } = useTheme();
  const { brand, header, sectionIds } = siteContent;

  return (
    <header className="section-inner flex items-center justify-between gap-3 py-5">
      <Link
        href="/"
        className="flex items-center gap-2.5 rounded-sm text-ink no-underline focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent"
      >
        <span aria-hidden className="h-3.5 w-3.5 rounded-[14px_2px_14px_2px] bg-accent" />
        <span className="text-[19px] font-bold tracking-tight">{brand}</span>
      </Link>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={themeAria}
          title={themeAria}
          className="grid h-11 w-11 place-items-center rounded-pill border border-line bg-transparent p-0 text-ink hover:bg-surface-2 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent"
        >
          <span
            aria-hidden
            className="h-4 w-4 rounded-pill border-2 border-current bg-[linear-gradient(90deg,currentColor_50%,transparent_50%)]"
          />
        </button>
        <ButtonLink
          href={`#${sectionIds.contact}`}
          variant="outline"
          className="text-[15px] px-[18px]"
        >
          {header.cta}
        </ButtonLink>
      </div>
    </header>
  );
}
