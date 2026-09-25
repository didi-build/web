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
      className="section-inner flex flex-wrap gap-10 py-section md:gap-20"
    >
      <div className="flex min-w-0 flex-1 basis-[320px] flex-col gap-5">
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
        <div aria-hidden className="pointer-events-none mt-3 min-h-[200px] max-h-[420px] flex-1">
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
      </div>
      <div className="min-w-0 flex-[1.3] basis-[440px]">
        <ContactForm />
      </div>
    </section>
  );
}
