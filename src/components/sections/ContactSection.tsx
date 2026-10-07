import { AmbientOrbs } from "@/components/decorative/AmbientOrbs";
import { VineStem } from "@/components/decorative/VineStem";
import { ButtonLink } from "@/components/ui/Button";
import { siteContent } from "@/content/site";

export function ContactSection() {
  const { contact, sectionIds, bookingPath } = siteContent;
  const headingId = `${sectionIds.contact}-heading`;

  return (
    <section
      id={sectionIds.contact}
      aria-labelledby={headingId}
      className="section-inner relative isolate overflow-x-clip py-section"
    >
      <AmbientOrbs
        orbs={[
          {
            className: "top-[10%] right-[-5%] h-[80%] w-[55cqi]",
            style: { "--orb-color": "var(--glow-1)" } as React.CSSProperties,
            drift: "a",
          },
        ]}
      />
      <div className="relative flex max-w-[640px] flex-col gap-5">
        <p className="m-0 text-[15px] font-semibold text-accent-text">{contact.eyebrow}</p>
        <h2 id={headingId} className="m-0 text-balance text-h2 font-semibold tracking-tight">
          {contact.headline}
        </h2>
        <p className="m-0 max-w-[40ch] text-pretty text-ink-muted">{contact.intro}</p>
        <div className="mt-1">
          <ButtonLink
            href={bookingPath}
            className="min-h-14 w-full justify-center whitespace-nowrap text-[17px] sm:w-auto cta-primary-glow"
          >
            {contact.bookCta} <span aria-hidden>→</span>
          </ButtonLink>
        </div>
        <p className="m-0 text-ink-muted">
          {contact.emailLabel}{" "}
          <a
            href={`mailto:${contact.email}`}
            className="font-semibold text-accent-text underline decoration-[1.5px] underline-offset-[3px]"
          >
            {contact.email}
          </a>
        </p>
      </div>
      <div
        aria-hidden
        className="pointer-events-none mt-10 min-h-[120px] max-h-[220px] max-[829px]:block min-[830px]:absolute min-[830px]:right-[clamp(20px,5vw,48px)] min-[830px]:bottom-0 min-[830px]:mt-0 min-[830px]:h-[min(420px,55%)] min-[830px]:w-[min(400px,40%)] min-[830px]:max-h-none"
      >
        <VineStem
          viewBox={[0, 0, 400, 400]}
          stem={[
            [40, 404],
            [18, 250],
            [250, 250],
            [270, 30],
          ]}
          leafCount={10}
          leafSize={56}
          seed={3}
          preserveAspectRatio="xMinYMax meet"
        />
      </div>
    </section>
  );
}
