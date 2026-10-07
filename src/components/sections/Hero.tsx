import { AmbientOrbs } from "@/components/decorative/AmbientOrbs";
import { VineStem } from "@/components/decorative/VineStem";
import { siteContent } from "@/content/site";
import { ButtonLink } from "@/components/ui/Button";
const HERO_MOTES = [
  { left: "22%", top: "78%", size: 3, duration: 14, delay: 0 },
  { left: "48%", top: "62%", size: 4, duration: 18, delay: 4 },
  { left: "70%", top: "84%", size: 3, duration: 16, delay: 9 },
  { left: "34%", top: "46%", size: 2, duration: 20, delay: 2 },
  { left: "82%", top: "54%", size: 3, duration: 15, delay: 7 },
  { left: "58%", top: "92%", size: 2, duration: 17, delay: 12 },
];

export function Hero() {
  const { hero, bookingPath } = siteContent;

  return (
    <section className="relative isolate overflow-x-clip">
      <AmbientOrbs
        orbs={[
          {
            className: "top-[-12%] right-[-8%] h-[70cqi] w-[70cqi] max-h-[900px] max-w-[900px]",
            style: { "--orb-color": "var(--glow-1)" } as React.CSSProperties,
            drift: "a",
          },
          {
            className: "top-[30%] left-[-18%] h-[45cqi] w-[55cqi]",
            style: { "--orb-color": "var(--glow-2)" } as React.CSSProperties,
            drift: "b",
          },
          {
            className: "right-[20%] bottom-[-20%] h-[30cqi] w-[40cqi]",
            style: { "--orb-color": "var(--glow-3)" } as React.CSSProperties,
            drift: "a",
          },
        ]}
      />
      <div className="section-inner relative pb-[clamp(72px,10vw,136px)] pt-[clamp(48px,9vw,120px)]">
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 h-full w-[clamp(120px,32vw,420px)] max-sm:right-[-14px] max-sm:w-[92px] max-sm:h-[78%]"
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
          <div className="absolute inset-0">
            {HERO_MOTES.map((mote, index) => (
              <span
                key={index}
                className="hero-mote"
                style={{
                  left: mote.left,
                  top: mote.top,
                  width: mote.size,
                  height: mote.size,
                  animationDuration: `${mote.duration}s`,
                  animationDelay: `${-mote.delay}s`,
                }}
              />
            ))}
          </div>
        </div>
        <div className="relative pr-[clamp(110px,28vw,400px)] max-sm:pr-11">
          <p className="m-0 mb-6 text-[clamp(1.0625rem,1rem+0.4vw,1.25rem)] font-semibold">
            {hero.intro} <span className="font-medium text-ink-muted">{hero.introMuted}</span>
          </p>
          <h1 className="m-0 text-balance text-display font-semibold tracking-tight">
            {hero.headline} <span className="text-display-accent">{hero.headlineAccent}</span>
          </h1>
          <p className="mt-7 max-w-[34ch] text-pretty text-[clamp(1.25rem,1rem+1vw,1.75rem)] font-semibold leading-[1.3] tracking-[-0.015em] text-accent-text">
            {hero.supporting}
          </p>
        </div>
        <div className="relative mt-[clamp(32px,5vw,40px)] flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <ButtonLink
            href={bookingPath}
            className="min-h-14 w-full justify-center whitespace-nowrap text-[17px] sm:w-auto cta-primary-glow"
          >
            {hero.primaryCta} <span aria-hidden>→</span>
          </ButtonLink>
          <ButtonLink
            href={`#${siteContent.sectionIds.how}`}
            variant="outline"
            className="min-h-[52px] w-full justify-center whitespace-nowrap bg-[var(--glass)] text-base sm:min-h-12 sm:w-auto"
          >
            {hero.secondaryCta}
          </ButtonLink>
        </div>
        <ul className="relative m-0 mt-8 flex list-none flex-wrap gap-2 p-0">
          {hero.badges.map((badge) => (
            <li key={badge.text} className={badge.emphasis ? "badge-highlight" : "badge-glass"}>
              <span aria-hidden className={badge.emphasis ? "leaf-dot-accent" : "leaf-dot"} />
              {badge.text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
