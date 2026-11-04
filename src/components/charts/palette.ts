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
  "var(--color-chart-green)", // leaf green
  "var(--color-chart-teal)", // teal-aqua
  "var(--color-chart-ochre)", // ochre
  "var(--color-chart-violet)", // violet
] as const;

export const MAX_SERIES = CATEGORICAL.length;

/** Single hue for magnitude, increasing contrast against the active surface. */
export const SEQUENTIAL = [
  "var(--color-chart-sequential-1)",
  "var(--color-chart-sequential-2)",
  "var(--color-chart-sequential-3)",
  "var(--color-chart-sequential-4)",
  "var(--color-chart-sequential-5)",
] as const;

/**
 * Diverging pair for polarity. The design system is explicit: greens for
 * growth, Soft Clay for decline, with a neutral — never a hue — at zero.
 */
export const DIVERGING = {
  positive: "var(--color-secondary)",
  negative: "var(--color-error)",
  neutral: "var(--color-outline-variant)",
} as const;

/** Recessive chrome so the data reads first. */
export const CHART_INK = {
  grid: "var(--color-surface-container-highest)",
  axis: "var(--color-outline-variant)",
  label: "var(--color-on-surface-variant)",
  muted: "var(--color-outline)",
  surface: "var(--color-surface-container-lowest)",
} as const;

export function sequentialStep(t: number): string {
  const i = Math.min(
    SEQUENTIAL.length - 1,
    Math.max(0, Math.round(t * (SEQUENTIAL.length - 1))),
  );
  return SEQUENTIAL[i];
}
