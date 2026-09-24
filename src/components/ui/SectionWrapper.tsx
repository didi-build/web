import type { ReactNode } from "react";

type Props = {
  id?: string;
  labelledBy?: string;
  tone?: "default" | "tinted";
  className?: string;
  children: ReactNode;
};

export function SectionWrapper({
  id,
  labelledBy,
  tone = "default",
  className = "",
  children,
}: Props) {
  const toneClass = tone === "tinted" ? "bg-surface-2" : "";
  return (
    <section id={id} aria-labelledby={labelledBy} className={`${toneClass} ${className}`.trim()}>
      <div className="section-inner">{children}</div>
    </section>
  );
}
