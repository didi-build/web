import { siteContent } from "@/content/site";
import { ButtonLink } from "@/components/ui/Button";
import Link from "next/link";

export function Hero() {
  const { hero, sectionIds } = siteContent;

  return (
    <section className="section-inner pb-16 pt-10 md:pb-24 md:pt-16">
      <p className="mb-6 text-[15px] font-semibold tracking-wide text-accent-text">
        {hero.eyebrow}
      </p>
      <h1 className="max-w-[19ch] text-balance text-display font-semibold tracking-tight">
        {hero.headline}
      </h1>
      <p className="mt-7 max-w-[42ch] text-pretty text-lead text-ink-muted">{hero.supporting}</p>
      <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
        <ButtonLink href={`#${sectionIds.contact}`} className="min-h-14 text-[17px]">
          {hero.primaryCta} <span aria-hidden>→</span>
        </ButtonLink>
        <Link
          href={`#${sectionIds.how}`}
          className="font-semibold text-ink no-underline hover:text-accent-text focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent"
        >
          {hero.secondaryCta}
        </Link>
      </div>
      <div
        aria-hidden
        className="mt-12 min-h-[220px] rounded-xl bg-[radial-gradient(circle_at_30%_30%,var(--accent-soft),transparent_55%),linear-gradient(135deg,var(--surface-2),var(--surface))] md:mt-16 md:min-h-[360px]"
      />
    </section>
  );
}
