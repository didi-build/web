import { AmbientOrbs } from "@/components/decorative/AmbientOrbs";
import { siteContent } from "@/content/site";
import Link from "next/link";

function GroupLabel({
  children,
  variant,
}: {
  children: string;
  variant: "founders" | "businesses";
}) {
  const pillClass = variant === "founders" ? "bg-accent-soft text-ink" : "bg-surface-2 text-ink";
  const dotClass = variant === "founders" ? "bg-accent" : "bg-[var(--leaf-2)]";

  return (
    <div className="flex items-center gap-3">
      <p
        className={`m-0 flex items-center gap-2 rounded-pill px-3 py-1 text-sm font-semibold ${pillClass}`}
      >
        <span aria-hidden className={`h-2 w-2 rounded-[8px_1px_8px_1px] ${dotClass}`} />
        {children}
      </p>
      <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-line-strong to-transparent" />
    </div>
  );
}

export function WhatIDo() {
  const { whatIDo, sectionIds } = siteContent;
  const headingId = `${sectionIds.what}-heading`;

  return (
    <section
      id={sectionIds.what}
      aria-labelledby={headingId}
      className="relative isolate overflow-x-clip"
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

        <div className="mt-3.5 flex flex-wrap items-stretch gap-x-4 gap-y-7">
          <div className="flex min-w-0 flex-[3_1_600px] flex-col gap-4">
            <GroupLabel variant="founders">{whatIDo.foundersLabel}</GroupLabel>
            <ul className="m-0 grid flex-1 list-none gap-4 p-0 sm:grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))]">
              {whatIDo.founderCards.map((card) => (
                <li
                  key={card.title}
                  className="glass-card flex min-h-0 flex-col gap-3 rounded-lg p-[clamp(22px,5vw,28px)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_oklch,var(--accent)_50%,var(--line))] hover:shadow-[inset_0_1px_0_var(--hi),0_28px_60px_-30px_var(--cta-glow)] sm:min-h-[250px]"
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
          </div>

          <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-4">
            <GroupLabel variant="businesses">{whatIDo.businessesLabel}</GroupLabel>
            <div
              className="flex min-h-0 flex-1 flex-col gap-3 rounded-lg p-[clamp(22px,5vw,28px)] sm:min-h-[250px]"
              style={{
                background:
                  "radial-gradient(120% 90% at 100% 0%, var(--glow-2), transparent 65%), var(--accent-soft)",
                boxShadow: "inset 0 1px 0 var(--hi)",
              }}
            >
              <h3 className="m-0 text-h3 font-semibold tracking-tight text-balance">
                {whatIDo.businessCard.title}
              </h3>
              <ul className="m-0 mt-1 flex list-none flex-col gap-2.5 p-0 text-base leading-snug">
                {whatIDo.businessCard.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-baseline gap-2.5">
                    <span
                      aria-hidden
                      className="h-2 w-2 shrink-0 -translate-y-px rounded-[8px_1px_8px_1px] bg-accent"
                    />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-7 text-ink-muted">
          {whatIDo.closingPrefix}{" "}
          <Link
            href={`#${sectionIds.contact}`}
            className="font-semibold text-accent-text underline decoration-[1.5px] underline-offset-[3px]"
          >
            {whatIDo.closingLink}
          </Link>
        </p>
      </div>
    </section>
  );
}
