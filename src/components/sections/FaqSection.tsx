import { VineStem } from "@/components/decorative/VineStem";
import { FaqExpandControls } from "@/components/sections/FaqExpandControls";
import { siteContent } from "@/content/site";

export function FaqSection() {
  const { faq, sectionIds } = siteContent;
  const headingId = `${sectionIds.faq}-heading`;
  const listId = `${sectionIds.faq}-list`;
  const questionCount = faq.items.length;

  return (
    <section
      id={sectionIds.faq}
      aria-labelledby={headingId}
      className="faq-section relative overflow-x-clip bg-surface-2"
    >
      <div className="section-inner flex flex-wrap gap-[clamp(40px,6vw,80px)] py-section">
        <div className="flex min-w-0 flex-1 basis-[320px] flex-col gap-5">
          <p className="m-0 text-[15px] font-semibold text-accent-text">{faq.eyebrow}</p>
          <h2
            id={headingId}
            className="m-0 max-w-[16ch] text-balance text-h2 font-semibold tracking-tight"
          >
            {faq.headline}
          </h2>
          <div aria-hidden className="faq-vine-wrap">
            <div className="faq-vine-inner">
              <VineStem
                viewBox={[0, 0, 360, 460]}
                stem={[
                  [0, 150],
                  [170, 80],
                  [110, 380],
                  [330, 470],
                ]}
                leafCount={9}
                leafSize={44}
                seed={4}
                startT={0.06}
                preserveAspectRatio="xMinYMax meet"
              />
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-[1.3] basis-[440px]">
          <FaqExpandControls listId={listId} questionCount={questionCount} />
          <div id={listId}>
            {faq.items.map((item) => (
              <details key={item.question} className="faq-details border-b border-line">
                <summary
                  className="faq-summary flex min-h-[72px] cursor-pointer list-none items-center justify-between gap-6 py-[18px] text-left text-lg font-semibold leading-snug tracking-[-0.005em] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent"
                >
                  <span className="text-pretty">{item.question}</span>
                  <span
                    aria-hidden
                    className="faq-toggle-icon relative flex h-9 w-9 shrink-0 items-center justify-center rounded-pill border border-line-strong bg-transparent text-ink transition-[background-color,border-color,color] duration-200"
                  >
                    <span className="absolute left-[11px] top-4 h-0.5 w-3 rounded-sm bg-current" />
                    <span className="faq-icon-plus-v absolute left-4 top-[11px] h-3 w-0.5 rounded-sm bg-current" />
                  </span>
                </summary>
                <p className="m-0 max-w-[62ch] pb-7 pr-[clamp(0px,6vw,60px)] text-pretty text-base leading-relaxed text-ink-muted">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
