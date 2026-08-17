"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Home,
  Info,
  Leaf,
  Minus,
  Ruler,
  Search,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { formatCediCompact, formatPct } from "@/lib/format";
import type { LocalityMarket } from "@/lib/types";
import { PRIMARY_REGION } from "@/lib/regions";
import { useElementWidth } from "@/components/charts/useElementWidth";

/* ---------------------------------------------------------------------------
   Market intelligence, for people who do not value property for a living.

   The previous version led with median price, cedi per square metre and
   year-on-year percentages in a dense table — the vocabulary of a valuation
   report. This version answers the three questions an ordinary buyer actually
   arrives with:

     1. What do homes cost around here?
     2. Are prices going up or down?
     3. Where can I afford, and where is cheaper?

   Every figure is paired with a plain sentence, and the technical detail is
   still available but no longer the headline.
   ------------------------------------------------------------------------ */

type SortKey = "price-asc" | "price-desc" | "growth";

/** Plain-language reading of a year-on-year movement. */
function trendOf(yoy: number) {
  if (yoy >= 8)
    return {
      label: "Rising quickly",
      plain: "Prices here have gone up sharply over the past year.",
      icon: ArrowUpRight,
      tone: "text-secondary",
      chip: "bg-secondary-container text-on-secondary-container",
    };
  if (yoy >= 2)
    return {
      label: "Rising",
      plain: "Prices here are climbing steadily.",
      icon: ArrowUpRight,
      tone: "text-secondary",
      chip: "bg-secondary-container/60 text-on-secondary-container",
    };
  if (yoy > -2)
    return {
      label: "Steady",
      plain: "Prices here have barely moved this year.",
      icon: Minus,
      tone: "text-on-surface-variant",
      chip: "bg-surface-container-high text-on-surface-variant",
    };
  return {
    label: "Falling",
    plain: "Prices here have come down over the past year.",
    icon: ArrowDownRight,
    tone: "text-error",
    chip: "bg-error-container text-on-error-container",
  };
}

/** Affordability banding, so "where can I afford" is answerable at a glance. */
function bandOf(median: number) {
  if (median >= 2_500_000) return { label: "Premium", tone: "bg-tertiary-container text-on-tertiary-container" };
  if (median >= 1_500_000) return { label: "Upper", tone: "bg-primary-container text-on-primary-container" };
  if (median >= 900_000) return { label: "Mid-range", tone: "bg-secondary-container text-on-secondary-container" };
  return { label: "Entry-level", tone: "bg-surface-container-high text-on-surface-variant" };
}

export function MarketWorkspace({ markets }: { markets: LocalityMarket[] }) {
  const [sort, setSort] = useState<SortKey>("price-asc");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const filtered = q
      ? markets.filter((m) => m.locality.toLowerCase().includes(q.toLowerCase()))
      : markets;
    const sorted = [...filtered];
    if (sort === "price-asc") sorted.sort((a, b) => a.medianPrice - b.medianPrice);
    else if (sort === "price-desc") sorted.sort((a, b) => b.medianPrice - a.medianPrice);
    else sorted.sort((a, b) => b.yoyPct - a.yoyPct);
    return sorted;
  }, [markets, sort, q]);

  /* Region-level summary: the single most useful number, plus the extremes. */
  const summary = useMemo(() => {
    if (markets.length === 0) return null;
    const prices = markets.map((m) => m.medianPrice).sort((a, b) => a - b);
    const mid = Math.floor(prices.length / 2);
    const typical =
      prices.length % 2 === 0
        ? Math.round((prices[mid - 1] + prices[mid]) / 2)
        : prices[mid];
    const cheapest = [...markets].sort((a, b) => a.medianPrice - b.medianPrice)[0];
    const fastest = [...markets].sort((a, b) => b.yoyPct - a.yoyPct)[0];
    const totalListings = markets.reduce((n, m) => n + m.listings, 0);
    return { typical, cheapest, fastest, totalListings };
  }, [markets]);

  return (
    <div className="p-5 md:p-8">
      <header className="mb-6">
        <h1 className="font-headline text-headline-lg text-primary">
          What homes cost in {PRIMARY_REGION}
        </h1>
        <p className="mt-1 max-w-2xl text-body-md text-on-surface-variant">
          A plain look at prices across each neighbourhood — what you would
          typically pay, and whether prices are going up or down.
        </p>
      </header>

      {summary && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <HeadlineTile
            icon={Home}
            figure={formatCediCompact(summary.typical)}
            label="Typical home price"
            plain="Half of neighbourhoods cost more than this, half cost less."
          />
          <HeadlineTile
            icon={Leaf}
            figure={summary.cheapest.locality}
            label="Most affordable area"
            plain={`Homes here typically cost ${formatCediCompact(summary.cheapest.medianPrice)}.`}
          />
          <HeadlineTile
            icon={TrendingUp}
            figure={summary.fastest.locality}
            label="Fastest rising"
            plain={`Up ${formatPct(summary.fastest.yoyPct)} over the past year.`}
          />
          <HeadlineTile
            icon={Search}
            figure={summary.totalListings.toLocaleString("en-GH")}
            label="Homes on the market"
            plain={`Across ${markets.length} neighbourhoods we track.`}
          />
        </div>
      )}

      {/* Controls kept to two: find a place, and change the ordering. */}
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <label className="min-w-0 flex-1 sm:max-w-xs">
          <span className="sr-only">Search neighbourhoods</span>
          <span className="relative block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline"
              aria-hidden
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Find a neighbourhood…"
              className="w-full rounded-md border border-outline-variant bg-surface-container-lowest py-2.5 pl-10 pr-4 text-body-md outline-none focus:border-tertiary-container"
            />
          </span>
        </label>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["price-asc", "Cheapest first"],
              ["price-desc", "Most expensive"],
              ["growth", "Rising fastest"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSort(key)}
              aria-pressed={sort === key}
              className={`rounded-full border px-4 py-2 font-data text-data-sm transition-colors ${
                sort === key
                  ? "border-primary bg-primary text-on-primary"
                  : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((m) => (
          <LocalityCard key={m.locality} market={m} />
        ))}
      </ul>

      {rows.length === 0 && (
        <p className="rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest p-10 text-center text-body-md text-on-surface-variant">
          No neighbourhood matches “{q}”.
        </p>
      )}

      <p className="mt-8 flex max-w-3xl items-start gap-2 rounded-md bg-surface-container-low p-4 font-data text-data-sm text-on-surface-variant">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        Figures are typical asking prices from listings on UrbanRise, updated as
        new properties are verified. They are a guide to the market, not a
        valuation of any particular home.
      </p>
    </div>
  );
}

function HeadlineTile({
  icon: Icon,
  figure,
  label,
  plain,
}: {
  icon: typeof Home;
  figure: string;
  label: string;
  plain: string;
}) {
  return (
    <div className="rounded-xl border border-primary/10 bg-surface-container-lowest p-5">
      <Icon className="mb-3 size-6 text-secondary" aria-hidden />
      <p className="font-data text-headline-md text-primary">{figure}</p>
      <p className="mt-0.5 font-data text-data-sm font-semibold text-on-surface">
        {label}
      </p>
      <p className="mt-1.5 text-[13px] leading-snug text-on-surface-variant">
        {plain}
      </p>
    </div>
  );
}

function LocalityCard({ market: m }: { market: LocalityMarket }) {
  const trend = trendOf(m.yoyPct);
  const band = bandOf(m.medianPrice);
  const TrendIcon = trend.icon;

  return (
    <li className="rounded-xl border border-primary/10 bg-surface-container-lowest p-5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h2 className="font-headline text-headline-md text-primary">
          {m.locality}
        </h2>
        <span className={`shrink-0 rounded-full px-3 py-1 text-label-caps ${band.tone}`}>
          {band.label}
        </span>
      </div>

      <p className="font-data text-headline-lg text-primary">
        {formatCediCompact(m.medianPrice)}
      </p>
      <p className="mb-4 text-[13px] text-on-surface-variant">
        typical price for a home here
      </p>

      <div className={`mb-4 flex items-start gap-2 rounded-md p-3 ${trend.chip}`}>
        <TrendIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
        <div>
          <p className="font-data text-data-sm font-semibold">
            {trend.label} · {formatPct(m.yoyPct)}
          </p>
          <p className="text-[12px] leading-snug opacity-90">{trend.plain}</p>
        </div>
      </div>

      <Sparkline series={m.series} rising={m.yoyPct >= 0} />

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-outline-variant/40 pt-3">
        <div>
          <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-on-surface-variant">
            <Ruler className="size-3.5" aria-hidden />
            Price per sqm
          </dt>
          <dd className="font-data text-data-sm font-semibold text-on-surface">
            ₵{m.avgPricePerSqm.toLocaleString("en-GH")}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-on-surface-variant">
            <Leaf className="size-3.5" aria-hidden />
            Eco-rated homes
          </dt>
          <dd className="font-data text-data-sm font-semibold text-on-surface">
            {m.ecoSharePct}%
          </dd>
        </div>
      </dl>

      <Link
        href={`/search?q=${encodeURIComponent(m.locality)}`}
        className="mt-4 inline-flex items-center gap-1.5 font-data text-data-sm text-secondary hover:underline"
      >
        See {m.listings} homes in {m.locality}
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </li>
  );
}

/**
 * Two years of monthly prices as a single shape.
 *
 * No axes or gridlines: at this size the only readable message is the
 * direction of travel, and the exact figures are stated above it in words.
 */
function Sparkline({
  series,
  rising,
}: {
  series: LocalityMarket["series"];
  rising: boolean;
}) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const height = 44;

  if (series.length < 2) return null;

  const values = series.map((p) => p.medianPrice);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const w = width || 280;

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = height - ((v - min) / span) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const stroke = rising ? "var(--color-secondary)" : "var(--color-error)";

  return (
    <div ref={ref} className="w-full">
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${w} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Price trend over the past two years: ${rising ? "upward" : "downward"}`}
      >
        <polyline
          points={points}
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="mt-1 text-[11px] text-on-surface-variant">
        Past two years
      </p>
    </div>
  );
}
