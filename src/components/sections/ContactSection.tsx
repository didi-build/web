import { AmbientOrbs } from "@/components/decorative/AmbientOrbs";
import { VineStem } from "@/components/decorative/VineStem";
import { siteContent } from "@/content/site";
import { ContactForm } from "@/components/sections/ContactForm";

export function ContactSection() {
  const { contact, sectionIds } = siteContent;
  const headingId = `${sectionIds.contact}-heading`;

  return (
    <section
      id={sectionIds.contact}
      aria-labelledby={headingId}
      className="section-inner relative isolate overflow-x-clip grid gap-10 py-section max-[829px]:grid-cols-1 min-[830px]:grid-cols-[minmax(320px,1fr)_minmax(440px,1.3fr)] min-[830px]:items-start min-[830px]:gap-20"
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
      <div className="flex min-w-0 flex-col gap-5 min-[830px]:col-start-1 min-[830px]:row-start-1">
        <p className="m-0 text-[15px] font-semibold text-accent-text">{contact.eyebrow}</p>
        <h2 id={headingId} className="m-0 text-balance text-h2 font-semibold tracking-tight">
          {contact.headline}
        </h2>
        <p className="m-0 max-w-[40ch] text-pretty text-ink-muted">{contact.intro}</p>
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
      <div className="min-w-0 min-[830px]:col-start-2 min-[830px]:row-span-2 min-[830px]:row-start-1">
        <ContactForm />
      </div>
      <div
        aria-hidden
        className="pointer-events-none mt-3 min-h-[120px] max-h-[220px] max-[829px]:hidden min-[830px]:col-start-1 min-[830px]:row-start-2 min-[830px]:min-h-[200px] min-[830px]:max-h-[420px]"
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
      <div aria-hidden className="pointer-events-none mt-2 h-[180px] min-[830px]:hidden">
        <VineStem
          viewBox={[0, 0, 400, 180]}
          stem={[
            [0, 150],
            [120, 175],
            [220, 40],
            [390, 70],
          ]}
          leafCount={9}
          leafSize={40}
          seed={3}
          preserveAspectRatio="xMinYMid meet"
        />
      </div>
    </section>
  );
}
