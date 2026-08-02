"use client";

import { useMemo, useState } from "react";
import { CATEGORICAL, CHART_INK, DIVERGING, sequentialStep } from "./palette";
import { useElementWidth } from "./useElementWidth";
import { formatCediCompact, formatPct } from "@/lib/format";

/* ===========================================================================
   Ranked bars — magnitude across named categories.

   One measure, identity on the axis, so this is a single sequential hue keyed
   to the value, not a categorical palette. Bars carry 4px rounded data-ends
   anchored to the baseline and a 2px surface gap between neighbours.
   ======================================================================== */

export function RankedBars({
  data,
  format = (v: number) => v.toLocaleString("en-GH"),
  label,
  /** Category names vary a lot in length — localities are short, material
   *  names are not — so the label gutter is set by the caller. */
  labelWidth = 150,
}: {
  data: { name: string; value: number }[];
  format?: (v: number) => string;
  label: string;
  labelWidth?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div>
      <ul className="space-y-1.5" aria-label={label}>
        {data.map((d, i) => {
          const pct = (d.value / max) * 100;
          const active = hover === i;
          return (
            <li
              key={d.name}
              className="grid items-center gap-3"
              style={{
                gridTemplateColumns: `${labelWidth}px 1fr 88px`,
              }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <span
                className="truncate font-data text-data-sm text-on-surface-variant"
                title={d.name}
              >
                {d.name}
              </span>
              <span className="relative block h-5 rounded-sm bg-surface-container">
                <span
                  className="absolute inset-y-0 left-0 rounded-r-[4px] transition-[filter]"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: sequentialStep(d.value / max),
                    filter: active ? "brightness(0.92)" : undefined,
                  }}
                />
              </span>
              <span className="text-right font-data text-data-sm font-medium text-on-surface">
                {format(d.value)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ===========================================================================
   Diverging bars — polarity around zero.

   Growth in the brand green, decline in Soft Clay, neutral gray at the axis.
   Never a hue at the midpoint.
   ======================================================================== */

export function DivergingBars({
  data,
  label,
}: {
  data: { name: string; value: number }[];
  label: string;
}) {
  const extent = Math.max(...data.map((d) => Math.abs(d.value)), 1);

  return (
    <ul className="space-y-1.5" aria-label={label}>
      {data.map((d) => {
        const half = (Math.abs(d.value) / extent) * 50;
        const positive = d.value >= 0;
        return (
          <li
            key={d.name}
            className="grid grid-cols-[150px_1fr_64px] items-center gap-3"
          >
            <span className="truncate font-data text-data-sm text-on-surface-variant">
              {d.name}
            </span>
            <span className="relative block h-5 rounded-sm bg-surface-container">
              {/* zero line */}
              <span
                className="absolute inset-y-0 left-1/2 w-px"
                style={{ backgroundColor: DIVERGING.neutral }}
              />
              <span
                className="absolute inset-y-0"
                style={{
                  width: `${half}%`,
                  left: positive ? "50%" : `${50 - half}%`,
                  backgroundColor: positive
                    ? DIVERGING.positive
                    : DIVERGING.negative,
                  borderRadius: positive ? "0 4px 4px 0" : "4px 0 0 4px",
                }}
              />
            </span>
            <span
              className="text-right font-data text-data-sm font-medium"
              style={{
                color: positive ? DIVERGING.positive : DIVERGING.negative,
              }}
            >
              {formatPct(d.value)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/* ===========================================================================
   Trend lines — change over time, up to four series.

   2px strokes, crosshair + tooltip on hover, direct labels at the line ends so
   identity never depends on colour alone.
   ======================================================================== */

export interface Series {
  name: string;
  points: { period: string; value: number }[];
}

const PAD = { top: 16, right: 132, bottom: 28, left: 56 };
const HEIGHT = 260;

export function TrendLines({
  series,
  label,
  format = formatCediCompact,
}: {
  series: Series[];
  label: string;
  format?: (v: number) => string;
}) {
  const [box, width] = useElementWidth<HTMLDivElement>();
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const periods = series[0]?.points.map((p) => p.period) ?? [];
  const n = periods.length;

  const { min, max } = useMemo(() => {
    const all = series.flatMap((s) => s.points.map((p) => p.value));
    if (all.length === 0) return { min: 0, max: 1 };
    const lo = Math.min(...all);
    const hi = Math.max(...all);
    const pad = (hi - lo) * 0.12 || hi * 0.1;
    return { min: Math.max(0, lo - pad), max: hi + pad };
  }, [series]);

  const plotW = Math.max(120, width - PAD.left - PAD.right);
  const plotH = HEIGHT - PAD.top - PAD.bottom;

  const x = (i: number) => PAD.left + (n <= 1 ? 0 : (i / (n - 1)) * plotW);
  const y = (v: number) =>
    PAD.top + plotH - ((v - min) / (max - min || 1)) * plotH;

  const ticks = useMemo(() => {
    const out: number[] = [];
    for (let i = 0; i <= 4; i++) out.push(min + ((max - min) * i) / 4);
    return out;
  }, [min, max]);

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const ratio = (px - PAD.left) / plotW;
    const idx = Math.round(ratio * (n - 1));
    setHoverIdx(idx >= 0 && idx < n ? idx : null);
  }

  return (
    <div ref={box}>
      <svg
        width={width}
        height={HEIGHT}
        role="img"
        aria-label={label}
        onMouseMove={onMove}
        onMouseLeave={() => setHoverIdx(null)}
        className="overflow-visible"
      >
        {/* Recessive grid */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={PAD.left + plotW}
              y1={y(t)}
              y2={y(t)}
              stroke={CHART_INK.grid}
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={y(t) + 4}
              textAnchor="end"
              fontSize={11}
              fill={CHART_INK.muted}
              fontFamily="var(--font-sora)"
            >
              {format(t)}
            </text>
          </g>
        ))}

        {/* X labels — first, middle, last only; a label per month is noise */}
        {[0, Math.floor((n - 1) / 2), n - 1].map((i) =>
          periods[i] ? (
            <text
              key={i}
              x={x(i)}
              y={HEIGHT - 8}
              textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}
              fontSize={11}
              fill={CHART_INK.muted}
              fontFamily="var(--font-sora)"
            >
              {periods[i]}
            </text>
          ) : null,
        )}

        {/* Crosshair */}
        {hoverIdx != null && (
          <line
            x1={x(hoverIdx)}
            x2={x(hoverIdx)}
            y1={PAD.top}
            y2={PAD.top + plotH}
            stroke={CHART_INK.axis}
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        )}

        {series.slice(0, CATEGORICAL.length).map((s, si) => {
          const color = CATEGORICAL[si];
          const d = s.points
            .map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.value)}`)
            .join(" ");
          const last = s.points[s.points.length - 1];
          return (
            <g key={s.name}>
              <path d={d} fill="none" stroke={color} strokeWidth={2} />
              {/* Direct label at the line end — identity without the legend */}
              <text
                x={PAD.left + plotW + 10}
                y={y(last.value) + 4}
                fontSize={11}
                fill={CHART_INK.label}
                fontFamily="var(--font-sora)"
              >
                <tspan fill={color}>■</tspan> {s.name}
              </text>
              {hoverIdx != null && s.points[hoverIdx] && (
                <circle
                  cx={x(hoverIdx)}
                  cy={y(s.points[hoverIdx].value)}
                  r={4.5}
                  fill={color}
                  stroke={CHART_INK.surface}
                  strokeWidth={2}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip as markup rather than SVG text, so it can wrap and scroll */}
      {hoverIdx != null && (
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border border-outline-variant/60 bg-surface-container-lowest px-3 py-2 font-data text-data-sm">
          <span className="font-semibold text-on-surface">
            {periods[hoverIdx]}
          </span>
          {series.slice(0, CATEGORICAL.length).map((s, si) => (
            <span key={s.name} className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="inline-block size-2.5 rounded-full"
                style={{ backgroundColor: CATEGORICAL[si] }}
              />
              <span className="text-on-surface-variant">{s.name}</span>
              <span className="font-medium text-on-surface">
                {format(s.points[hoverIdx]?.value ?? 0)}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===========================================================================
   Stat tile — a single headline number is not a chart.
   ======================================================================== */

export function StatTile({
  label,
  value,
  delta,
  hint,
}: {
  label: string;
  value: string;
  delta?: number;
  hint?: string;
}) {
  return (
    <div className="rounded-md border border-outline-variant/60 bg-surface-container-lowest p-4">
      <div className="text-label-caps text-on-surface-variant">{label}</div>
      <div className="mt-1 font-data text-data-lg text-primary">{value}</div>
      {delta != null && (
        <div
          className="mt-0.5 font-data text-data-sm"
          style={{
            color: delta >= 0 ? DIVERGING.positive : DIVERGING.negative,
          }}
        >
          {formatPct(delta)} year on year
        </div>
      )}
      {hint && (
        <div className="mt-0.5 font-data text-data-sm text-on-surface-variant">
          {hint}
        </div>
      )}
    </div>
  );
}
