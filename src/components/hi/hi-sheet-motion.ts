export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function sheetCloseDurationMs(height: number, dy = 0, velocity = 1.4): number {
  return Math.round(Math.max(150, Math.min(280, (height - dy) / Math.max(velocity, 1.4))));
}
