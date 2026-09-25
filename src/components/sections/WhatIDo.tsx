import { siteContent } from "@/content/site";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import Link from "next/link";

export function WhatIDo() {
  const { whatIDo, sectionIds } = siteContent;
  const headingId = `${sectionIds.what}-heading`;

  return (
    <SectionWrapper id={sectionIds.what} labelledBy={headingId} className="py-section">
      <div className="flex flex-wrap items-end justify-between gap-4 gap-x-16">
        <div className="min-w-0 flex-1 basis-[420px]">
          <p className="mb-3 text-[15px] font-semibold text-accent-text">{whatIDo.eyebrow}</p>
          <h2
            id={headingId}
            className="max-w-[18ch] text-balance text-h2 font-semibold tracking-tight"
          >
            {whatIDo.headline}
          </h2>
        </div>
        <p className="max-w-[46ch] flex-1 basis-[340px] text-pretty text-ink-muted">
          {whatIDo.intro}
        </p>
      </div>
      <ul className="mt-10 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
        {whatIDo.examples.map((example, index) => (
          <li
            key={example.title}
            className="flex min-h-60 flex-col gap-3 rounded-lg border border-line bg-surface p-7"
          >
            <span className="self-start rounded-pill bg-surface-2 px-2.5 py-1 text-[13px] font-semibold text-ink-muted">
              {whatIDo.exampleLabel} {index + 1}
            </span>
            <h3 className="mt-2 text-h3 font-semibold tracking-tight">{example.title}</h3>
            <p className="m-0 text-base leading-relaxed text-ink-muted">{example.body}</p>
          </li>
        ))}
      </ul>
      <p className="mt-7 text-ink-muted">
        {whatIDo.closingPrefix}{" "}
        <Link
          href={`#${sectionIds.contact}`}
          className="font-semibold text-accent-text underline decoration-[1.5px] underline-offset-[3px]"
        >
          {whatIDo.closingLink}
        </Link>
      </p>
    </SectionWrapper>
  );
}
