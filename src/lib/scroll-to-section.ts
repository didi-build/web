const HEADER_OFFSET_FALLBACK_PX = 72;

export function scrollToSection(sectionId: string, focusId?: string): void {
  const section = document.getElementById(sectionId);
  if (!section) {
    return;
  }

  const anchor = section.querySelector<HTMLElement>("[data-scroll-anchor]") ?? section;
  const header = document.querySelector<HTMLElement>("header[data-site-header]");
  const headerHeight = header?.offsetHeight ?? HEADER_OFFSET_FALLBACK_PX;
  const padTop = Number.parseFloat(getComputedStyle(anchor).paddingTop) || 0;
  const nudge = Number.parseFloat(section.getAttribute("data-scroll-nudge") ?? "0") || 0;
  const offset = headerHeight + (padTop ? 28 - padTop : 0) - nudge;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const top = anchor.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });

  if (focusId) {
    window.setTimeout(() => {
      document.getElementById(focusId)?.focus({ preventScroll: true });
    }, 500);
  }
}
