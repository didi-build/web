import { VineStem } from "@/components/decorative/VineStem";
import { siteContent } from "@/content/site";
import { ButtonLink } from "@/components/ui/Button";
import Link from "next/link";

export function Hero() {
  const { hero, sectionIds } = siteContent;

  return (
    <section className="section-inner relative pb-[clamp(64px,9vw,120px)] pt-[clamp(40px,8vw,104px)]">
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 h-full w-[clamp(120px,32vw,420px)] max-w-none"
      >
        <VineStem
          viewBox={[0, 0, 300, 600]}
          stem={[
            [250, 0],
            [330, 170],
            [60, 260],
            [150, 590],
          ]}
          leafCount={11}
          leafSize={58}
          seed={2}
          animationDelay={0.2}
        />
      </div>
      <div className="relative pr-[clamp(110px,28vw,400px)]">
        <p className="m-0 mb-6 text-[clamp(1.0625rem,1rem+0.4vw,1.25rem)] font-semibold">
          {hero.intro} <span className="font-medium text-ink-muted">{hero.introMuted}</span>
        </p>
        <h1 className="m-0 text-balance text-display font-semibold tracking-tight">
          {hero.headline}
          <span className="mt-[0.35em] block text-[0.56em] leading-[1.2] tracking-[-0.02em] text-accent-text">
            {hero.headlineAccent}
          </span>
        </h1>
        <p className="mt-7 max-w-[40ch] text-pretty text-[clamp(1.0625rem,1rem+0.35vw,1.25rem)] leading-[1.55] text-ink-muted">
          {hero.supporting}
        </p>
      </div>
      <div className="relative mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
        <ButtonLink href={`#${sectionIds.contact}`} className="min-h-14 text-[17px]">
          {hero.primaryCta} <span aria-hidden>→</span>
        </ButtonLink>
        <Link
          href={`#${sectionIds.how}`}
          className="text-base font-semibold text-ink no-underline hover:text-accent-text focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent"
        >
          {hero.secondaryCta}
        </Link>
      </div>
      <ul className="relative m-0 mt-8 flex list-none flex-wrap gap-2 p-0">
        {hero.badges.map((badge) => (
          <li
            key={badge}
            className="rounded-pill bg-accent-soft px-3.5 py-1.5 text-[15px] font-medium"
          >
            {badge}
          </li>
        ))}
      </ul>
    </section>
  );
}
