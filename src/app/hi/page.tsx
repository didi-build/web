import Image from "next/image";
import { HiCopyMessageButton } from "@/components/hi/HiCopyMessageButton";
import { HiSaveContactLink } from "@/components/hi/HiSaveContactLink";
import { HiThemeSwitch } from "@/components/hi/HiThemeSwitch";
import { SocialProfileIcon } from "@/components/SocialProfileIcon";
import { getFounderLinkByIcon } from "@/content/profile-links";
import { siteContent } from "@/content/site";
import { buildMailtoUrl } from "@/lib/hi/mailto";
import type { Metadata, ResolvingMetadata } from "next";
import { resolveHiPageMetadata } from "@/lib/hi/page-metadata";

export async function generateMetadata(_: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  return resolveHiPageMetadata(parent);
}

const buttonBase =
  "inline-flex w-full min-h-14 items-center justify-center gap-3 rounded-pill px-7 text-[15px] font-semibold transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent";

const linkedIn = getFounderLinkByIcon("linkedin");
const github = getFounderLinkByIcon("github");

export default function HiPage() {
  const { hi, a11y, meta, bookingPath } = siteContent;
  const { contact } = hi;
  const mailto = buildMailtoUrl(contact.email, contact.mailSubject, contact.mailBody);

  return (
    <div className="relative isolate min-h-svh overflow-hidden bg-bg text-ink">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-[200px] left-1/2 z-[-1] h-[420px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--accent-soft),transparent)]"
      />

      <main className="mx-auto flex min-h-svh max-w-[420px] flex-col items-center gap-6 px-6 pb-5 pt-4 text-center [container-type:inline-size]">
        <section
          aria-labelledby="hi-title"
          className="flex flex-col items-center gap-2.5 pt-[clamp(12px,4svh,48px)]"
        >
          <div className="flex items-center gap-3 text-left">
            <Image
              src={hi.headshotSrc}
              alt={hi.headshotAlt}
              width={64}
              height={64}
              className="block h-16 w-16 shrink-0 rounded-full"
              priority
            />
            <div className="flex flex-col items-start gap-0.5">
              <p className="m-0 text-xl font-semibold leading-tight tracking-tight text-accent-text">
                {hi.greetingName}
              </p>
              <p className="m-0 text-sm font-medium leading-snug text-ink-muted">{contact.title}</p>
            </div>
          </div>
          <h1
            id="hi-title"
            className="mt-4 w-max max-w-[calc(100vw-48px)] text-balance text-[clamp(2.7rem,1.9rem+4cqi,3.2rem)] font-semibold leading-[1.06] tracking-tight"
          >
            {hi.heading}
          </h1>
        </section>

        <section aria-label={hi.exchangeAriaLabel} className="mt-3 flex w-full flex-col gap-3">
          <HiSaveContactLink
            href={hi.vcardPath}
            className={`${buttonBase} bg-accent text-accent-ink no-underline hover:bg-accent-hover`}
            label={hi.saveContact}
            androidSaveHint={hi.androidSaveHint}
          />
          <a
            href={mailto}
            className={`${buttonBase} border-[1.5px] border-ink bg-transparent text-ink no-underline hover:bg-ink hover:text-bg`}
          >
            {hi.connect}
          </a>

          <div className="mt-1 overflow-hidden rounded-[14px] border border-line bg-surface text-left">
            <div className="flex flex-col gap-0.5 border-b border-line px-4 py-3 text-caption leading-snug text-ink-muted">
              <span>
                To <span className="font-semibold text-ink">{contact.email}</span>
              </span>
              <span>
                Subject <span className="font-semibold text-ink">{contact.mailSubject}</span>
              </span>
            </div>
            <p className="m-0 whitespace-pre-line px-4 py-3 text-[15px] leading-normal text-ink text-pretty">
              {contact.mailBody}
            </p>
            <HiCopyMessageButton
              email={contact.email}
              subject={contact.mailSubject}
              body={contact.mailBody}
              copyLabel={hi.copyMessage}
              copiedLabel={hi.copied}
            />
          </div>

          <a
            href={bookingPath}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center self-center px-2 text-[15px] font-medium text-ink-muted underline decoration-1 underline-offset-[3px] hover:text-ink"
          >
            {hi.bookLink}
          </a>
        </section>

        <p className="mt-1 max-w-[30ch] text-balance text-lg leading-snug text-ink">{hi.tagline}</p>

        <nav aria-label={a11y.footerNavLabel} className="mt-auto">
          <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-0.5 p-0">
            <li>
              <a
                href={meta.siteUrl}
                className="inline-flex min-h-11 items-center gap-2 rounded-pill px-2 text-[15px] font-medium text-ink-muted no-underline hover:bg-surface-2 hover:text-ink"
              >
                <span aria-hidden className="h-3 w-3 rounded-[12px_2px_12px_2px] bg-accent" />
                didi.build
              </a>
            </li>
            <li>
              <a
                href={linkedIn.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-pill px-2 text-[15px] font-medium text-ink-muted no-underline hover:bg-surface-2 hover:text-ink"
              >
                <SocialProfileIcon icon="linkedin" />
                {linkedIn.label}
              </a>
            </li>
            <li>
              <a
                href={github.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-pill px-2 text-[15px] font-medium text-ink-muted no-underline hover:bg-surface-2 hover:text-ink"
              >
                <SocialProfileIcon icon="github" />
                {github.label}
              </a>
            </li>
            <li>
              <HiThemeSwitch />
            </li>
          </ul>
        </nav>
      </main>
    </div>
  );
}
