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
      className="section-inner grid gap-10 py-section md:grid-cols-[minmax(320px,1fr)_minmax(440px,1.3fr)] md:items-start md:gap-20"
    >
      <div className="flex min-w-0 flex-col gap-5 md:col-start-1 md:row-start-1">
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
      <div className="min-w-0 md:col-start-2 md:row-span-2 md:row-start-1">
        <ContactForm />
      </div>
      <div
        aria-hidden
        className="pointer-events-none mt-3 min-h-[120px] max-h-[220px] md:col-start-1 md:row-start-2 md:min-h-[200px] md:max-h-[420px]"
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
