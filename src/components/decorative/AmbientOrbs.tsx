type OrbSpec = {
  className: string;
  style?: React.CSSProperties;
  drift?: "a" | "b";
};

type AmbientOrbsProps = {
  orbs: OrbSpec[];
  clip?: boolean;
};

export function AmbientOrbs({ orbs, clip = false }: AmbientOrbsProps) {
  return (
    <div className={`ambient-layer ${clip ? "overflow-x-clip" : ""}`} aria-hidden>
      {orbs.map((orb, index) => (
        <div
          key={index}
          className={`ambient-orb ${orb.drift === "b" ? "ambient-orb--drift-b" : "ambient-orb--drift-a"} ${orb.className}`}
          style={orb.style}
        />
      ))}
    </div>
  );
}
