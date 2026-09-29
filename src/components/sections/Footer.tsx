import { SocialProfileIcon } from "@/components/SocialProfileIcon";
import { businessLinks, profileLinkAriaLabel } from "@/content/profile-links";
import { siteContent } from "@/content/site";

const socialIconClass =
  "grid h-11 w-11 place-items-center rounded-pill text-ink-muted no-underline hover:bg-surface-2 hover:text-ink focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent";

export function Footer() {
  const { brand, a11y } = siteContent;
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
            {businessLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  aria-label={profileLinkAriaLabel(link)}
                  title={link.label}
                  className={socialIconClass}
                >
                  <SocialProfileIcon icon={link.icon} />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
