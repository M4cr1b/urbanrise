"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Home,
  Info,
  Leaf,
  Ruler,
  Search,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { formatCediCompact } from "@/lib/format";
import type { LocalityStats } from "@/lib/types";
import { PRIMARY_REGION } from "@/lib/regions";
import { EcoBadge } from "@/components/ui/Badges";

/* ---------------------------------------------------------------------------
   Market intelligence, for people who do not value property for a living.

   Three questions an ordinary buyer actually arrives with:
     1. What do homes cost around here?
     2. How much do homes vary in each area?
     3. Where can I afford?

   Every figure is paired with a plain sentence and a sample size, so small
   samples read as honest rather than authoritative. Visualizations show real
   data only — no fabricated trends.
   ------------------------------------------------------------------------ */

type SortKey = "price-asc" | "price-desc" | "listings";

/** Affordability banding, so "where can I afford" is answerable at a glance. */
function bandOf(median: number) {
  if (median >= 2_500_000) return { label: "Premium", tone: "bg-tertiary-container text-on-tertiary-container" };
  if (median >= 1_500_000) return { label: "Upper", tone: "bg-primary-container text-on-primary-container" };
  if (median >= 900_000) return { label: "Mid-range", tone: "bg-secondary-container text-on-secondary-container" };
  return { label: "Entry-level", tone: "bg-surface-container-high text-on-surface-variant" };
}

export function MarketWorkspace({ markets }: { markets: LocalityStats[] }) {
  const [sort, setSort] = useState<SortKey>("price-asc");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const filtered = q
      ? markets.filter((m) => m.locality.toLowerCase().includes(q.toLowerCase()))
      : markets;
    const sorted = [...filtered];
    if (sort === "price-asc") sorted.sort((a, b) => a.medianPrice - b.medianPrice);
    else if (sort === "price-desc") sorted.sort((a, b) => b.medianPrice - a.medianPrice);
    else sorted.sort((a, b) => b.listings - a.listings);
    return sorted;
  }, [markets, sort, q]);

  /* Region-level summary: the single most useful numbers. */
  const summary = useMemo(() => {
    if (markets.length === 0) return null;
    const prices = markets.map((m) => m.medianPrice).sort((a, b) => a - b);
    const mid = Math.floor(prices.length / 2);
    const typical =
      prices.length % 2 === 0
        ? Math.round((prices[mid - 1] + prices[mid]) / 2)
        : prices[mid];
    const cheapest = [...markets].sort((a, b) => a.medianPrice - b.medianPrice)[0];
    const mostActive = [...markets].sort((a, b) => b.listings - a.listings)[0];
    const totalListings = markets.reduce((n, m) => n + m.listings, 0);
    return { typical, cheapest, mostActive, totalListings };
  }, [markets]);

  return (
    <div className="p-5 md:p-8">
      <header className="mb-6">
        <h1 className="font-headline text-headline-lg text-primary">
          What homes cost in {PRIMARY_REGION}
        </h1>
        <p className="mt-1 max-w-2xl text-body-md text-on-surface-variant">
          A plain look at prices across each neighbourhood — what you would
          typically pay, and how much they vary.
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
            figure={summary.mostActive.locality}
            label="Most homes listed"
            plain={`${summary.mostActive.listings} homes currently on the market.`}
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
              ["listings", "Most listings"],
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
          No neighbourhood matches "{q}".
        </p>
      )}

      <p className="mt-8 flex max-w-3xl items-start gap-2 rounded-md bg-surface-container-low p-4 font-data text-data-sm text-on-surface-variant">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        Figures are calculated from live UrbanRise listings. Areas with few homes
        show a wider price range and a smaller sample — treat those figures as
        indicative, not definitive.
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

function LocalityCard({ market: m }: { market: LocalityStats }) {
  const band = bandOf(m.medianPrice);

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
        typical price · based on {m.listings} home{m.listings === 1 ? "" : "s"}
      </p>

      <PriceRangeBar min={m.minPrice} median={m.medianPrice} max={m.maxPrice} />

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-outline-variant/40 pt-3">
        <div>
          <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-on-surface-variant">
            <Ruler className="size-3.5" aria-hidden />
            Price per sqm
          </dt>
          <dd className="font-data text-data-sm font-semibold text-on-surface">
            {m.avgPricePerSqm != null
              ? `₵${m.avgPricePerSqm.toLocaleString("en-GH")}${
                  m.pricePerSqmSampleSize < m.listings
                    ? ` (${m.pricePerSqmSampleSize} of ${m.listings})`
                    : ""
                }`
              : "Not enough data"}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-on-surface-variant">
            <Leaf className="size-3.5" aria-hidden />
            Typical rating
          </dt>
          <dd className="font-data text-data-sm font-semibold text-on-surface">
            {m.commonEcoRating}
          </dd>
        </div>
      </dl>

      <div className="mt-3 border-t border-outline-variant/40 pt-3 space-y-1">
        <div className="text-[12px] text-on-surface-variant">
          <span className="font-semibold text-on-surface">{m.bedroomRange.min}–{m.bedroomRange.max} bed</span>
          {Object.keys(m.typeMix).length > 0 && (
            <>
              {" · "}
              <span>mostly {Object.entries(m.typeMix).sort((a, b) => b[1] - a[1])[0][0]}s</span>
            </>
          )}
        </div>
      </div>

      <Link
        href={`/search?q=${encodeURIComponent(m.locality)}`}
        className="mt-4 inline-flex items-center gap-1.5 font-data text-data-sm text-secondary hover:underline"
      >
        See {m.listings} home{m.listings === 1 ? "" : "s"} in {m.locality}
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </li>
  );
}

function PriceRangeBar({
  min,
  median,
  max,
}: {
  min: number;
  median: number;
  max: number;
}) {
  const span = max - min || 1;
  const medianPct = ((median - min) / span) * 100;

  return (
    <div className="w-full">
      <div className="relative h-2 rounded-full bg-surface-container-high">
        <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-primary/15" />
        <div
          className="absolute top-1/2 size-3 -translate-y-1/2 -translate-x-1/2 rounded-full bg-primary ring-2 ring-surface-container-lowest"
          style={{ left: `${medianPct}%` }}
          aria-hidden
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-on-surface-variant">
        <span>{formatCediCompact(min)}</span>
        <span>{formatCediCompact(max)}</span>
      </div>
    </div>
  );
}
