import { FaqExpandControls } from "@/components/sections/FaqExpandControls";
import { siteContent } from "@/content/site";
import { SectionWrapper } from "@/components/ui/SectionWrapper";

export function FaqSection() {
  const { faq, sectionIds } = siteContent;
  const headingId = `${sectionIds.faq}-heading`;
  const listId = `${sectionIds.faq}-list`;

  return (
    <SectionWrapper id={sectionIds.faq} labelledBy={headingId} tone="tinted" className="py-section">
      <p className="mb-3 text-[15px] font-semibold text-accent-text">{faq.eyebrow}</p>
      <h2 id={headingId} className="max-w-[24ch] text-balance text-h2 font-semibold tracking-tight">
        {faq.headline}
      </h2>
      <FaqExpandControls listId={listId} />
      <div id={listId} className="grid max-w-[72ch] gap-0">
        {faq.items.map((item) => (
          <details key={item.question} className="faq-details border-t border-line">
            <summary className="faq-summary flex cursor-pointer list-none items-start justify-between gap-4 py-6 text-h3 font-semibold tracking-tight focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent">
              <span>{item.question}</span>
              <span aria-hidden className="faq-chevron mt-0.5 shrink-0 text-accent-text">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </summary>
            <p className="m-0 pb-6 text-base leading-relaxed text-ink-muted">{item.answer}</p>
          </details>
        ))}
      </div>
    </SectionWrapper>
  );
}
