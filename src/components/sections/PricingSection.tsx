import { AmbientOrbs } from "@/components/decorative/AmbientOrbs";
import { siteContent } from "@/content/site";

export function PricingSection() {
  const { pricing, sectionIds } = siteContent;
  const headingId = `${sectionIds.pricing}-heading`;

  return (
    <section
      id={sectionIds.pricing}
      data-scroll-nudge="20"
      aria-labelledby={headingId}
      className="section-ambient py-section"
    >
      <AmbientOrbs
        orbs={[
          {
            className: "top-[0%] left-[20%] h-[100%] w-[min(80cqi,1100px)]",
            style: { "--orb-color": "var(--glow-1)" } as React.CSSProperties,
            drift: "a",
          },
          {
            className: "right-[-20%] bottom-[-10%] h-[70%] w-[min(55cqi,800px)]",
            style: { "--orb-color": "var(--glow-2)" } as React.CSSProperties,
            drift: "b",
          },
        ]}
      />
      <div className="section-inner">
        <div
          className="relative isolate flex flex-wrap gap-[clamp(32px,5vw,72px)] overflow-hidden rounded-[clamp(24px,4vw,32px)] border border-[var(--glass-line)] p-[clamp(22px,5vw,64px)]"
          style={{
            background:
              "radial-gradient(70% 90% at 0% 0%, var(--glow-1), transparent 60%), radial-gradient(60% 80% at 100% 100%, var(--glow-2), transparent 60%), var(--surface)",
            boxShadow: "inset 0 1px 0 var(--hi)",
          }}
        >
          <AmbientOrbs
            clip
            orbs={[
              {
                className: "top-[10%] left-[30%] h-[80%] w-1/2",
                style: { "--orb-color": "var(--glow-3)" } as React.CSSProperties,
                drift: "b",
              },
            ]}
          />
          <div className="relative flex min-w-0 flex-1 basis-[320px] flex-col gap-5">
            <p className="m-0 text-[15px] font-semibold text-accent-text">{pricing.eyebrow}</p>
            <h2
              id={headingId}
              className="m-0 max-w-[16ch] text-balance text-h2 font-semibold tracking-tight"
            >
              {pricing.headline}
            </h2>
            <p className="m-0 max-w-[40ch] text-pretty text-ink-muted">{pricing.intro}</p>
            <p className="m-auto flex max-w-[40ch] items-baseline gap-2.5 pt-5 text-base leading-normal font-semibold text-pretty text-ink">
              <span
                aria-hidden
                className="h-2.5 w-2.5 shrink-0 -translate-y-px rounded-[10px_2px_10px_2px] bg-accent shadow-[0_0_12px_var(--cta-glow)]"
              />
              {pricing.foundingCallout}
            </p>
          </div>
          <div className="relative min-w-0 flex-[1.3] basis-[440px]">
            <ul className="m-0 list-none border-t-2 border-ink p-0">
              {pricing.tiers.map((tier) => (
                <li
                  key={tier.name}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1.5 border-b border-line py-6 sm:items-baseline sm:gap-x-6"
                >
                  <div className="min-w-0">
                    <h3 className="m-0 text-[1.1875rem] font-semibold leading-snug tracking-tight">
                      {tier.name}
                    </h3>
                    <p className="m-0 mt-1 text-base text-pretty text-ink-muted">{tier.note}</p>
                  </div>
                  <p className="m-0 flex flex-col items-end gap-0 text-right sm:flex-row sm:items-baseline sm:gap-2">
                    {tier.pricePrefix ? (
                      <span className="text-[15px] font-medium text-ink-muted">
                        {tier.pricePrefix}
                      </span>
                    ) : null}
                    <span
                      className={`font-semibold leading-none tracking-tight text-ink tabular-nums ${
                        tier.priceSize === "large"
                          ? "text-[clamp(1.75rem,1.4rem+1.2vw,2.25rem)]"
                          : "text-[clamp(1.125rem,1rem+0.4vw,1.3rem)]"
                      }`}
                    >
                      {tier.price}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
            <p className="m-0 mt-5 text-sm text-ink-muted">{pricing.taxFootnote}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
