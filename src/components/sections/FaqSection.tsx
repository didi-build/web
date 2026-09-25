import { siteContent } from "@/content/site";
import { SectionWrapper } from "@/components/ui/SectionWrapper";

export function FaqSection() {
  const { faq, sectionIds } = siteContent;
  const headingId = `${sectionIds.faq}-heading`;

  return (
    <SectionWrapper id={sectionIds.faq} labelledBy={headingId} tone="tinted" className="py-section">
      <p className="mb-3 text-[15px] font-semibold text-accent-text">{faq.eyebrow}</p>
      <h2 id={headingId} className="max-w-[24ch] text-balance text-h2 font-semibold tracking-tight">
        {faq.headline}
      </h2>
      <dl className="mt-[clamp(28px,4vw,44px)] grid max-w-[72ch] gap-[clamp(24px,3vw,36px)]">
        {faq.items.map((item) => (
          <div key={item.question} className="border-t border-line pt-6">
            <dt className="text-h3 font-semibold tracking-tight">{item.question}</dt>
            <dd className="m-0 mt-3 text-base leading-relaxed text-ink-muted">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </SectionWrapper>
  );
}
