import { VineStem } from "@/components/decorative/VineStem";
import { siteContent } from "@/content/site";
import Link from "next/link";

export function AboutSection() {
  const { about, footer, sectionIds } = siteContent;
  const headingId = `${sectionIds.about}-heading`;

  return (
    <section
      id={sectionIds.about}
      aria-labelledby={headingId}
      className="section-inner pt-[clamp(72px,10vw,128px)] pb-[clamp(56px,7vw,88px)]"
    >
      <div className="about-card relative flex flex-wrap gap-[clamp(24px,5vw,64px)] rounded-lg bg-accent-soft p-[clamp(28px,5vw,64px)]">
        <div className="flex min-w-0 flex-1 basis-[440px] flex-col gap-6">
          <p className="m-0 flex items-center gap-2.5 text-[15px] font-semibold text-accent-text">
            <span aria-hidden className="h-3 w-3 rounded-[12px_2px_12px_2px] bg-accent" />
            {about.eyebrow}
          </p>
          <h2
            id={headingId}
            className="m-0 max-w-[20ch] text-balance text-[clamp(1.9rem,1.2rem+2.6vw,3.25rem)] font-semibold leading-[1.1] tracking-[-0.025em]"
          >
            {about.headline}
          </h2>
          <div className="flex max-w-[52ch] flex-col gap-3.5 text-pretty text-[clamp(1.0625rem,1rem+0.3vw,1.1875rem)] leading-relaxed">
            <p className="m-0">{about.lead}</p>
            <p className="m-0 text-ink-muted">{about.followUp}</p>
            <p className="m-0 text-ink-muted">
              {about.ctaPrefix}{" "}
              <Link
                href={footer.portfolio.href}
                className="font-semibold text-accent-text underline decoration-[1.5px] underline-offset-[3px]"
              >
                {about.portfolioLinkLabel}
              </Link>{" "}
              {about.ctaOr}{" "}
              <Link
                href={footer.linkedin.href}
                className="font-semibold text-accent-text underline decoration-[1.5px] underline-offset-[3px]"
              >
                {footer.linkedin.label}
              </Link>
              {about.ctaClosing}
            </p>
          </div>
        </div>
        <div aria-hidden className="about-vine-wrap">
          <div className="about-vine-inner">
            <VineStem
              viewBox={[0, 0, 340, 420]}
              stem={[
                [330, 424],
                [345, 250],
                [70, 300],
                [110, 20],
              ]}
              leafCount={10}
              leafSize={54}
              seed={6}
              preserveAspectRatio="xMaxYMax meet"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
