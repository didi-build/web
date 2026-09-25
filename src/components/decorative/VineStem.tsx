"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

type Point = [number, number];

type VineStemProps = {
  viewBox: [number, number, number, number];
  stem: [Point, Point, Point, Point];
  leafCount?: number;
  leafSize?: number;
  preserveAspectRatio?: string;
  animationDelay?: number;
  seed?: number;
  startT?: number;
};

function bezierPoint(t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
}

function bezierDerivative(t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point {
  const u = 1 - t;
  return [
    3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]),
    3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]),
  ];
}

function Leaf({
  x,
  y,
  angle,
  size,
  color,
  visible,
  transitionDelay,
}: {
  x: number;
  y: number;
  angle: number;
  size: number;
  color: string;
  visible: boolean;
  transitionDelay: number;
}) {
  const s = size;
  const d = `M0 0C${s * 0.25} ${-s * 0.33} ${s * 0.7} ${-s * 0.36} ${s} 0C${s * 0.7} ${s * 0.36} ${s * 0.25} ${s * 0.33} 0 0Z`;
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(1)})`}>
      <g
        style={{
          transform: visible ? "scale(1)" : "scale(0)",
          transition: `transform 0.8s cubic-bezier(0.3, 1.35, 0.5, 1) ${transitionDelay.toFixed(2)}s`,
        }}
      >
        <path d={d} fill={color} />
        <path
          d={`M${s * 0.1} 0L${s * 0.78} 0`}
          stroke="var(--bg)"
          strokeOpacity={0.4}
          strokeWidth={1.2}
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </g>
  );
}

export function VineStem({
  viewBox,
  stem,
  leafCount = 8,
  leafSize = 46,
  preserveAspectRatio = "xMaxYMin meet",
  animationDelay = 0,
  seed = 1,
  startT = 0.1,
}: VineStemProps) {
  const ref = useRef<SVGSVGElement>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    if (!("IntersectionObserver" in window)) {
      setAnimated(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const [p0, p1, p2, p3] = stem;
  let r = seed * 9301 + 49297;
  const rnd = () => {
    r = (r * 9301 + 49297) % 233280;
    return r / 233280;
  };

  const leaves: ReactNode[] = [];
  const n = leafCount;
  const size = leafSize;

  for (let i = 0; i < n; i++) {
    const t = startT + (i / Math.max(1, n - 1)) * (0.94 - startT);
    const [x, y] = bezierPoint(t, p0, p1, p2, p3);
    const [dx, dy] = bezierDerivative(t, p0, p1, p2, p3);
    const side = i % 2 ? 1 : -1;
    const ang = (Math.atan2(dy, dx) * 180) / Math.PI + side * (42 + rnd() * 22);
    const leafScale = size * (1 - 0.4 * t) * (0.82 + rnd() * 0.32);
    const color = `var(--leaf-${1 + ((i + seed) % 3)})`;
    leaves.push(
      <Leaf
        key={i}
        x={x}
        y={y}
        angle={ang}
        size={leafScale}
        color={color}
        visible={animated}
        transitionDelay={animationDelay + 0.25 + t * 1.5}
      />,
    );
  }

  const [tx, ty] = bezierPoint(1, p0, p1, p2, p3);
  const [ex, ey] = bezierDerivative(1, p0, p1, p2, p3);
  leaves.push(
    <Leaf
      key="tip"
      x={tx}
      y={ty}
      angle={(Math.atan2(ey, ex) * 180) / Math.PI}
      size={size * 0.42}
      color="var(--leaf-2)"
      visible={animated}
      transitionDelay={animationDelay + 1.75}
    />,
  );

  const pathD = `M${p0.join(" ")}C${p1.join(" ")} ${p2.join(" ")} ${p3.join(" ")}`;

  return (
    <svg
      ref={ref}
      viewBox={viewBox.join(" ")}
      preserveAspectRatio={preserveAspectRatio}
      width="100%"
      height="100%"
      className="block overflow-visible"
      aria-hidden
    >
      <path
        d={pathD}
        fill="none"
        stroke="var(--stem)"
        strokeWidth={2.5}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={animated ? 0 : 1}
        style={{
          transition: `stroke-dashoffset 1.9s cubic-bezier(0.4, 0, 0.2, 1) ${animationDelay}s`,
        }}
      />
      {leaves}
    </svg>
  );
}
