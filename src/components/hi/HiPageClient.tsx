"use client";

import { HiAboutSection } from "@/components/hi/HiAboutSection";
import { HiExchangeSheet } from "@/components/hi/HiExchangeSheet";
import { HiThemeSwitch } from "@/components/hi/HiThemeSwitch";
import { SocialProfileIcon } from "@/components/SocialProfileIcon";
import { Button } from "@/components/ui/Button";
import { getFounderLinkByIcon } from "@/content/profile-links";
import { siteContent } from "@/content/site";
import Image from "next/image";
import { useRef, useState } from "react";

export function HiPageClient() {
  const { hi, a11y, meta, bookingPath } = siteContent;
  const { contact } = hi;
  const linkedIn = getFounderLinkByIcon("linkedin");
  const github = getFounderLinkByIcon("github");

  const exchangeButtonRef = useRef<HTMLButtonElement>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [leadToken, setLeadToken] = useState("");

  const openSheet = () => {
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    exchangeButtonRef.current?.focus();
  };

  const thanksLine =
    connected && !sheetOpen ? hi.thanksMessage.replace("{firstName}", firstName || "there") : null;

  return (
    <div className="relative isolate min-h-svh overflow-hidden bg-bg text-ink">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-[200px] left-1/2 z-[-1] h-[420px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--accent-soft),transparent)]"
      />

      <main className="mx-auto flex min-h-svh max-w-[420px] flex-col items-center gap-12 px-6 pb-5 pt-4 text-center [container-type:inline-size]">
        <div className="flex w-full flex-col items-center gap-7">
          <section
            aria-label={contact.name.full}
            className="flex flex-col items-center gap-3.5 pt-[clamp(16px,5svh,48px)]"
          >
            <Image
              src={hi.headshotSrc}
              alt={hi.headshotAlt}
              width={104}
              height={104}
              className="block h-[104px] w-[104px] rounded-full"
              priority
            />
            <div className="flex flex-col items-center gap-1">
              <p className="m-0 text-[1.75rem] font-semibold leading-tight tracking-tight text-accent-text">
                {hi.greetingName}
              </p>
              <p className="m-0 text-[15px] font-medium leading-snug text-ink-muted">
                {contact.title}
              </p>
            </div>
          </section>

          <section aria-label={hi.exchangeAriaLabel} className="flex w-full flex-col gap-1">
            <Button
              ref={exchangeButtonRef}
              type="button"
              onClick={openSheet}
              className="min-h-14 w-full text-[15px]"
            >
              {hi.exchangeButton}
            </Button>
            <a
              href={bookingPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center self-center px-2 text-[15px] font-medium text-ink-muted underline decoration-1 underline-offset-[3px] hover:text-ink"
            >
              {hi.bookLink}
            </a>
            {thanksLine && (
              <p
                role="status"
                className="m-0 animate-hi-fade text-[15px] font-medium text-accent-text"
              >
                {thanksLine}
              </p>
            )}
          </section>

          <HiAboutSection />
        </div>

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

      <HiExchangeSheet
        open={sheetOpen}
        initialStep={connected ? "details" : "exchange"}
        firstName={firstName}
        leadToken={leadToken}
        onClose={closeSheet}
        onExchangeSuccess={(nextFirstName, token) => {
          setConnected(true);
          setFirstName(nextFirstName);
          setLeadToken(token);
        }}
      />
    </div>
  );
}
