import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "outline";

const base =
  "inline-flex min-h-11 items-center justify-center gap-3 rounded-pill px-7 font-semibold transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink no-underline hover:bg-accent-hover hover:text-accent-ink",
  outline:
    "border-[1.5px] border-ink bg-transparent text-ink no-underline hover:bg-ink hover:text-bg",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </Link>
  );
}
