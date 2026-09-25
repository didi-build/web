import { siteContent } from "@/content/site";

const socialIconClass =
  "grid h-11 w-11 place-items-center rounded-pill text-ink-muted no-underline hover:bg-surface-2 hover:text-ink focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent";

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
          <ul className="m-0 flex list-none gap-1 p-0">
            <li>
              <a
                href={footer.portfolio.href}
                aria-label={footer.portfolio.label}
                title={footer.portfolio.label}
                className={socialIconClass}
              >
                <svg
                  aria-hidden
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </a>
            </li>
            <li>
              <a
                href={footer.github.href}
                aria-label={footer.github.label}
                title={footer.github.label}
                className={socialIconClass}
              >
                <svg aria-hidden width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
              </a>
            </li>
            <li>
              <a
                href={footer.linkedin.href}
                aria-label={footer.linkedin.label}
                title={footer.linkedin.label}
                className={socialIconClass}
              >
                <svg aria-hidden width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.88 1.64-1.8 3.37-1.8 3.6 0 4.27 2.37 4.27 5.46v6.23zM5.34 7.43a2.06 2.06 0 110-4.13 2.06 2.06 0 010 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
                </svg>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
