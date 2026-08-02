/**
 * Formatting helpers. Every figure on the platform passes through here so the
 * cedi symbol, grouping and date style stay consistent between the marketing
 * page and the workbench.
 */

const cedi = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  maximumFractionDigits: 0,
});

/** ₵2,450,000 */
export function formatCedi(value: number | null | undefined): string {
  if (value == null) return "—";
  return cedi.format(value).replace("GH₵", "₵");
}

/** ₵2.45M — for chart axes and tight cells. */
export function formatCediCompact(value: number | null | undefined): string {
  if (value == null) return "—";
  if (value >= 1_000_000) return `₵${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `₵${(value / 1_000).toFixed(0)}K`;
  return `₵${value}`;
}

/** 320 sqm */
export function formatSqm(value: number | null | undefined): string {
  if (value == null) return "Unknown";
  return `${value.toLocaleString("en-GH")} sqm`;
}

/** 05 Jan, 2026 — matches the reference tool's date style. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** +8.2% / −3.1% — signed, with a true minus sign. */
export function formatPct(value: number, digits = 1): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toFixed(digits)}%`;
}

/** > 10km / 2.4km — the reference shows a threshold rather than a long tail. */
export function formatDistance(km: number): string {
  if (km >= 10) return "> 10km";
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

/** Cedi per square metre, the number valuers actually compare on. */
export function pricePerSqm(
  price: number,
  floorAreaSqm: number | null,
): number | null {
  if (!floorAreaSqm || floorAreaSqm <= 0) return null;
  return Math.round(price / floorAreaSqm);
}
