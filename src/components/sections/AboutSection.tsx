import { siteContent } from "@/content/site";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import Link from "next/link";

export function AboutSection() {
  const { about, footer, sectionIds } = siteContent;
  const headingId = `${sectionIds.about}-heading`;

  return (
    <SectionWrapper id={sectionIds.about} labelledBy={headingId} className="py-section">
      <p className="mb-3 text-[15px] font-semibold text-accent-text">{about.eyebrow}</p>
      <h2 id={headingId} className="max-w-[28ch] text-balance text-h2 font-semibold tracking-tight">
        {about.headline}
      </h2>
      <div className="mt-6 max-w-[62ch] space-y-4 text-pretty text-base leading-relaxed text-ink-muted">
        <p className="m-0">{about.lead}</p>
        <p className="m-0">
          {about.followUp} {about.ctaPrefix}{" "}
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
    </SectionWrapper>
  );
}
