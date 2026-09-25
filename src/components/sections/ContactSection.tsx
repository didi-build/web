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
        <h2 id={headingId} className="m-0 text-h2 font-semibold tracking-tight">
          {contact.headline}
        </h2>
        <p className="m-0 max-w-[40ch] text-ink-muted">{contact.intro}</p>
        <p className="m-0 text-ink-muted">
          {contact.emailLabel}{" "}
          <a
            href={`mailto:${contact.email}`}
            className="font-semibold text-accent-text underline decoration-[1.5px] underline-offset-[3px]"
          >
            {contact.email}
          </a>
        </p>
        <div
          aria-hidden
          className="mt-3 min-h-[220px] flex-1 rounded-lg bg-[radial-gradient(circle_at_70%_20%,var(--accent-soft),transparent_50%),linear-gradient(160deg,var(--surface),var(--surface-2))]"
        />
      </div>
      <div className="min-w-0 flex-[1.3] basis-[440px]">
        <ContactForm />
      </div>
    </section>
  );
}
