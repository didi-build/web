import { siteContent } from "@/content/site";

export function Footer() {
  const { brand, footer, a11y } = siteContent;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line">
      <div className="section-inner flex flex-wrap items-center justify-between gap-5 py-8 pb-10">
        <div className="flex items-center gap-2.5">
          <span aria-hidden className="h-3 w-3 rounded-[12px_2px_12px_2px] bg-accent" />
          <span className="font-bold">{brand}</span>
          <span className="text-[15px] text-ink-muted">© {year}</span>
        </div>
        <nav aria-label={a11y.footerNavLabel}>
          <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-1 p-0">
            {[footer.portfolio, footer.github, footer.linkedin].map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="inline-flex min-h-11 items-center font-medium text-ink no-underline hover:text-accent-text focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
