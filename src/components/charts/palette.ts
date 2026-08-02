/**
 * Chart palette.
 *
 * Validated with the dataviz skill's checker (light mode, 4 slots): lightness
 * band, chroma floor, adjacent-pair CVD separation (worst ΔE 14.9 deutan),
 * normal-vision floor (worst ΔE 18.2) and contrast vs surface all pass.
 *
 * Slot 1 is the brand leaf green and slot 2 the design system's teal-aqua;
 * slots 3 and 4 depart from the botanical hues deliberately, because three
 * greens cannot be told apart by a deuteranope no matter how they are chosen.
 *
 * Assigned in fixed order and never cycled — a fifth locality folds into
 * "Other" rather than repeating a hue.
 */
export const CATEGORICAL = [
  "#006e24", // leaf green
  "#2a9d8f", // teal-aqua
  "#a05a00", // ochre
  "#6b5bd2", // violet
] as const;

export const MAX_SERIES = CATEGORICAL.length;

/** Single hue for magnitude — light to dark, one hue, never a rainbow. */
export const SEQUENTIAL = [
  "#c8e6cd",
  "#96d5a3",
  "#5cb271",
  "#2e8b4a",
  "#006e24",
] as const;

/**
 * Diverging pair for polarity. The design system is explicit: greens for
 * growth, Soft Clay for decline, with a neutral — never a hue — at zero.
 */
export const DIVERGING = {
  positive: "#006e24",
  negative: "#ba1a1a",
  neutral: "#c0c9be",
} as const;

/** Recessive chrome so the data reads first. */
export const CHART_INK = {
  grid: "#e1e3dd",
  axis: "#c0c9be",
  label: "#404941",
  muted: "#717970",
  surface: "#ffffff",
} as const;

export function sequentialStep(t: number): string {
  const i = Math.min(
    SEQUENTIAL.length - 1,
    Math.max(0, Math.round(t * (SEQUENTIAL.length - 1))),
  );
  return SEQUENTIAL[i];
}
