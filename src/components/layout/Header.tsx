"use client";

import { siteContent } from "@/content/site";
import { useTheme } from "@/components/theme/ThemeProvider";
import { ButtonLink } from "@/components/ui/Button";
import { scrollToSection } from "@/lib/scroll-to-section";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Header() {
  const { toggleTheme, themeAria } = useTheme();
  const { brand, header, sectionIds, a11y } = siteContent;
  const [menuOpen, setMenuOpen] = useState(false);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 859px)");
    const onChange = () => setNarrow(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const navItems = header.nav.map((item) => ({
    ...item,
    id: sectionIds[item.sectionKey],
  }));

  const goTo =
    (sectionId: string, focusId?: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      const wasOpen = menuOpen;
      setMenuOpen(false);
      window.setTimeout(() => scrollToSection(sectionId, focusId), wasOpen ? 30 : 0);
    };

  const contactFocusId = siteContent.formIds.contactName;

  return (
    <header
      data-site-header
      className="sticky top-0 z-20 border-b border-line/70 bg-bg/72 backdrop-blur-[16px] backdrop-saturate-[1.3] relative"
    >
      <div className="section-inner flex items-center justify-between gap-3 py-3">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2.5 rounded-sm text-ink no-underline focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent"
        >
          <span
            aria-hidden
            className="h-3.5 w-3.5 rounded-[14px_2px_14px_2px] bg-accent shadow-[0_0_14px_var(--cta-glow)]"
          />
          <span className="text-[19px] font-bold tracking-tight">{brand}</span>
        </Link>

        {!narrow ? (
          <nav aria-label={a11y.mainNavLabel} className="hidden min-[860px]:block">
            <ul className="m-0 flex list-none gap-0.5 p-0">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={goTo(item.id)}
                    className="flex min-h-11 items-center rounded-pill px-3.5 text-[15px] font-medium text-ink-muted no-underline transition-[background,color] duration-150 hover:bg-surface-2 hover:text-ink focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

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

          {!narrow ? (
            <ButtonLink
              href={`#${sectionIds.contact}`}
              onClick={goTo(sectionIds.contact, contactFocusId)}
              variant="outline"
              className="hidden min-h-11 text-[15px] px-[18px] min-[860px]:inline-flex"
            >
              {header.cta}
            </ButtonLink>
          ) : (
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="site-mobile-menu"
              aria-label={a11y.mobileMenuLabel}
              className={`grid h-11 w-11 place-items-center rounded-pill border border-line p-0 text-ink hover:bg-surface-2 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent ${menuOpen ? "bg-surface-2" : "bg-transparent"}`}
            >
              <span aria-hidden className="relative h-3 w-[18px]">
                <span
                  className="absolute left-0 h-0.5 w-[18px] rounded-sm bg-current transition-[transform,top] duration-250"
                  style={{
                    top: menuOpen ? "5px" : "2px",
                    transform: menuOpen ? "rotate(45deg)" : "none",
                  }}
                />
                <span
                  className="absolute left-0 h-0.5 w-[18px] rounded-sm bg-current transition-[transform,top] duration-250"
                  style={{
                    top: menuOpen ? "5px" : "8px",
                    transform: menuOpen ? "rotate(-45deg)" : "none",
                  }}
                />
              </span>
            </button>
          )}
        </div>
      </div>

      {narrow && menuOpen ? (
        <div
          id="site-mobile-menu"
          className="absolute top-full right-0 left-0 border-b border-line bg-bg px-[clamp(20px,5vw,48px)] pt-1 pb-6 shadow-[0_30px_60px_-30px_oklch(0_0_0_/_0.35)]"
        >
          <nav aria-label={a11y.mainNavLabel}>
            <ul className="m-0 list-none p-0">
              {navItems.map((item) => (
                <li key={item.id} className="border-b border-line">
                  <a
                    href={`#${item.id}`}
                    onClick={goTo(item.id)}
                    className="flex min-h-14 items-center text-lg font-semibold tracking-tight text-ink no-underline hover:text-accent-text focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a
            href={`#${sectionIds.contact}`}
            onClick={goTo(sectionIds.contact, contactFocusId)}
            className="mt-5 flex min-h-14 items-center justify-center rounded-pill bg-accent text-[17px] font-semibold text-accent-ink no-underline hover:bg-accent-hover focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent"
          >
            {header.mobileCta}
          </a>
        </div>
      ) : null}
    </header>
  );
}
