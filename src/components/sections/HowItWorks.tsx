import { siteContent } from "@/content/site";
import { SectionWrapper } from "@/components/ui/SectionWrapper";

export function HowItWorks() {
  const { howItWorks, sectionIds } = siteContent;
  const headingId = `${sectionIds.how}-heading`;

  return (
    <SectionWrapper id={sectionIds.how} labelledBy={headingId} tone="tinted" className="py-section">
      <p className="mb-3 text-[15px] font-semibold text-accent-text">{howItWorks.eyebrow}</p>
      <h2 id={headingId} className="max-w-[20ch] text-balance text-h2 font-semibold tracking-tight">
        {howItWorks.headline}
      </h2>
      <ol className="mt-10 grid list-none gap-8 p-0 md:grid-cols-3">
        {howItWorks.steps.map((step, index) => (
          <li key={step.title} className="flex flex-col gap-3 border-t-2 border-ink pt-6">
            <span
              aria-hidden
              className="text-[clamp(2.5rem,2rem+2vw,3.5rem)] font-semibold leading-none tracking-tight text-accent-text"
            >
              {index + 1}
            </span>
            <h3 className="mt-2 text-h3 font-semibold">{step.title}</h3>
            <p className="m-0 text-base text-ink-muted">{step.body}</p>
          </li>
        ))}
      </ol>
    </SectionWrapper>
  );
}
