type Props = {
  /** When true, show minus only (vertical bar hidden). */
  minus?: boolean;
  className?: string;
};

export function FaqPlusIcon({ minus = false, className = "" }: Props) {
  return (
    <span aria-hidden className={`relative h-3 w-3 ${className}`.trim()}>
      <span className="absolute left-0 top-[5px] h-0.5 w-3 rounded-sm bg-current" />
      <span
        className="absolute left-[5px] top-0 h-3 w-0.5 rounded-sm bg-current transition-transform duration-[250ms] ease-in-out"
        style={{ transform: minus ? "scaleY(0)" : "scaleY(1)" }}
      />
    </span>
  );
}
