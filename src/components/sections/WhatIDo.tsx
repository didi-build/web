import { AmbientOrbs } from "@/components/decorative/AmbientOrbs";
import { siteContent } from "@/content/site";
import Link from "next/link";

export function WhatIDo() {
  const { whatIDo, bookingPath } = siteContent;
  const headingId = `${siteContent.sectionIds.what}-heading`;

  return (
    <section
      id={siteContent.sectionIds.what}
      aria-labelledby={headingId}
      className="section-ambient"
    >
      <AmbientOrbs
        orbs={[
          {
            className: "top-[20%] right-[-10%] h-[50cqi] w-[45cqi]",
            style: { "--orb-color": "var(--glow-3)" } as React.CSSProperties,
            drift: "b",
          },
        ]}
      />
      <div data-scroll-anchor className="section-inner py-section">
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

        <p className="m-0 mt-[clamp(36px,5vw,56px)] text-sm font-medium text-ink-muted">
          {whatIDo.examplesLabel}
        </p>

        <ul className="m-0 mt-3.5 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 md:auto-rows-fr">
          {whatIDo.founderCards.map((card) => (
            <li
              key={card.title}
              className="glass-card flex h-full min-h-0 flex-col gap-3 rounded-lg p-[clamp(22px,5vw,28px)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_oklch,var(--accent)_50%,var(--line))] hover:shadow-[inset_0_1px_0_var(--hi),0_28px_60px_-30px_var(--cta-glow)] sm:min-h-[250px]"
            >
              <h3 className="m-0 text-h3 font-semibold tracking-tight text-balance">
                {card.title}
              </h3>
              <p className="m-0 text-base leading-relaxed text-pretty text-ink-muted">
                {card.body}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-7 text-ink-muted">
          {whatIDo.closingPrefix}{" "}
          <Link
            href={bookingPath}
            className="font-semibold text-accent-text underline decoration-[1.5px] underline-offset-[3px]"
          >
            {whatIDo.closingLink}
          </Link>
        </p>
      </div>
    </section>
  );
}
