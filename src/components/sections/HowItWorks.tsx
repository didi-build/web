import { VineStem } from "@/components/decorative/VineStem";
import { siteContent } from "@/content/site";

export function HowItWorks() {
  const { howItWorks, sectionIds } = siteContent;
  const headingId = `${sectionIds.how}-heading`;

  return (
    <section id={sectionIds.how} aria-labelledby={headingId} className="relative bg-surface-2">
      <div
        aria-hidden
        className="pointer-events-none absolute right-[6%] bottom-[calc(100%-4px)] aspect-[240/150] w-[clamp(90px,18vw,230px)]"
      >
        <VineStem
          viewBox={[0, 0, 240, 150]}
          stem={[
            [232, 152],
            [205, 90],
            [120, 40],
            [16, 34],
          ]}
          leafCount={6}
          leafSize={36}
          seed={5}
          preserveAspectRatio="xMaxYMax meet"
        />
      </div>
      <div className="section-inner py-section">
        <p className="mb-3 text-[15px] font-semibold text-accent-text">{howItWorks.eyebrow}</p>
        <h2
          id={headingId}
          className="max-w-[20ch] text-balance text-h2 font-semibold tracking-tight"
        >
          {howItWorks.headline}
        </h2>
        <ol className="mt-[clamp(36px,5vw,56px)] grid list-none gap-[clamp(28px,4vw,48px)] p-0 sm:grid-cols-2 lg:grid-cols-3">
          {howItWorks.steps.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-3 border-t-2 border-ink pt-6">
              <span
                aria-hidden
                className="text-[clamp(2.5rem,2rem+2vw,3.5rem)] font-semibold leading-none tracking-tight text-accent-text"
              >
                {index + 1}
              </span>
              <h3 className="mt-2 text-h3 font-semibold">{step.title}</h3>
              <p className="m-0 text-base text-pretty text-ink-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
