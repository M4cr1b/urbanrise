"use client";

import { useMemo, useState } from "react";
import { BarChart3, Table2 } from "lucide-react";
import {
  DivergingBars,
  RankedBars,
  StatTile,
  TrendLines,
  type Series,
} from "@/components/charts/Charts";
import { CATEGORICAL, MAX_SERIES } from "@/components/charts/palette";
import { formatCedi, formatCediCompact, formatPct } from "@/lib/format";
import type { LocalityMarket } from "@/lib/types";

/**
 * Market intelligence.
 *
 * Four forms, each chosen for the job the data is doing: headline magnitudes as
 * stat tiles, locality comparison as a single-hue ranked bar, year-on-year
 * movement as a diverging bar around zero, and change over time as a trend line
 * capped at four series (the number the validated palette can separate).
 */
export function MarketWorkspace({ markets }: { markets: LocalityMarket[] }) {
  const [selected, setSelected] = useState<string[]>([
    "East Legon",
    "East Legon Hills",
    "Tema Community 25",
  ]);
  const [view, setView] = useState<"chart" | "table">("chart");

  const byRate = useMemo(
    () => [...markets].sort((a, b) => b.avgPricePerSqm - a.avgPricePerSqm),
    [markets],
  );
  const byYoy = useMemo(
    () => [...markets].sort((a, b) => b.yoyPct - a.yoyPct),
    [markets],
  );

  const series: Series[] = useMemo(
    () =>
      selected
        .map((name) => markets.find((m) => m.locality === name))
        .filter((m): m is LocalityMarket => Boolean(m))
        .map((m) => ({
          name: m.locality,
          points: m.series.map((p) => ({
            period: p.period,
            value: p.avgPricePerSqm,
          })),
        })),
    [selected, markets],
  );

  const national = useMemo(() => {
    const totalListings = markets.reduce((sum, m) => sum + m.listings, 0);
    const weightedYoy =
      markets.reduce((sum, m) => sum + m.yoyPct * m.listings, 0) /
      (totalListings || 1);
    const medians = [...markets.map((m) => m.medianPrice)].sort((a, b) => a - b);
    return {
      totalListings,
      weightedYoy,
      median: medians[Math.floor(medians.length / 2)],
      topRate: byRate[0],
    };
  }, [markets, byRate]);

  function toggle(locality: string) {
    setSelected((prev) =>
      prev.includes(locality)
        ? prev.filter((l) => l !== locality)
        : prev.length >= MAX_SERIES
          ? prev
          : [...prev, locality],
    );
  }

  return (
    <div className="p-6 md:p-8">
      <header className="mb-6">
        <h1 className="font-headline text-headline-lg text-primary">
          Market Intelligence
        </h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Median prices, rates per square metre and year-on-year movement across
          tracked localities.
        </p>
      </header>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Tracked listings"
          value={national.totalListings.toLocaleString("en-GH")}
          hint={`${markets.length} localities`}
        />
        <StatTile
          label="Median asking price"
          value={formatCedi(national.median)}
          delta={national.weightedYoy}
        />
        <StatTile
          label="Highest rate"
          value={`₵${national.topRate.avgPricePerSqm.toLocaleString("en-GH")}/sqm`}
          hint={national.topRate.locality}
        />
        <StatTile
          label="Localities in decline"
          value={String(markets.filter((m) => m.yoyPct < 0).length)}
          hint="Negative year-on-year"
        />
      </div>

      {/* Filters in one row above the charts */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="font-data text-data-sm text-on-surface-variant">
          Compare (max {MAX_SERIES}):
        </span>
        {markets.map((m) => {
          const idx = selected.indexOf(m.locality);
          const on = idx >= 0;
          const full = selected.length >= MAX_SERIES && !on;
          return (
            <button
              key={m.locality}
              type="button"
              onClick={() => toggle(m.locality)}
              disabled={full}
              aria-pressed={on}
              className={`flex items-center gap-1.5 rounded-sm border px-2.5 py-1 font-data text-data-sm transition-colors ${
                on
                  ? "border-primary bg-primary text-on-primary"
                  : full
                    ? "cursor-not-allowed border-outline-variant/50 text-outline"
                    : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-primary/50 hover:text-primary"
              }`}
            >
              {on && (
                <span
                  aria-hidden
                  className="inline-block size-2 rounded-full"
                  style={{ backgroundColor: CATEGORICAL[idx] }}
                />
              )}
              {m.locality}
            </button>
          );
        })}

        <div className="ml-auto flex rounded-sm border border-outline-variant">
          <button
            type="button"
            onClick={() => setView("chart")}
            aria-pressed={view === "chart"}
            className={`flex items-center gap-1.5 px-3 py-1 font-data text-data-sm ${view === "chart" ? "bg-primary text-on-primary" : "text-on-surface-variant"}`}
          >
            <BarChart3 className="size-3.5" aria-hidden />
            Chart
          </button>
          <button
            type="button"
            onClick={() => setView("table")}
            aria-pressed={view === "table"}
            className={`flex items-center gap-1.5 px-3 py-1 font-data text-data-sm ${view === "table" ? "bg-primary text-on-primary" : "text-on-surface-variant"}`}
          >
            <Table2 className="size-3.5" aria-hidden />
            Table
          </button>
        </div>
      </div>

      {view === "table" ? (
        <MarketTable markets={byRate} />
      ) : (
        <div className="space-y-6">
          <Panel
            title="Rate per square metre over time"
            note="Monthly average asking rate, 24 months to July 2026."
          >
            {series.length === 0 ? (
              <p className="py-8 text-center font-data text-data-sm text-on-surface-variant">
                Select a locality to plot.
              </p>
            ) : (
              <TrendLines
                series={series}
                label="Average rate per square metre by locality over 24 months"
                format={(v) => `₵${Math.round(v).toLocaleString("en-GH")}`}
              />
            )}
          </Panel>

          <div className="grid gap-6 xl:grid-cols-2">
            <Panel
              title="Rate per square metre"
              note="Current average, ranked."
            >
              <RankedBars
                data={byRate.map((m) => ({
                  name: m.locality,
                  value: m.avgPricePerSqm,
                }))}
                format={(v) => `₵${v.toLocaleString("en-GH")}`}
                label="Average rate per square metre by locality"
              />
            </Panel>

            <Panel
              title="Year-on-year movement"
              note="Growth in green, decline in clay."
            >
              <DivergingBars
                data={byYoy.map((m) => ({
                  name: m.locality,
                  value: m.yoyPct,
                }))}
                label="Year-on-year price movement by locality"
              />
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}

function Panel({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-outline-variant/60 bg-surface-container-lowest p-5">
      <h2 className="font-headline text-headline-md text-primary">{title}</h2>
      {note && (
        <p className="mb-4 mt-0.5 font-data text-data-sm text-on-surface-variant">
          {note}
        </p>
      )}
      {children}
    </section>
  );
}

function MarketTable({ markets }: { markets: LocalityMarket[] }) {
  return (
    <div className="overflow-auto rounded-md border border-outline-variant/60 scrollbar-slim">
      <table className="w-full border-collapse bg-surface-container-lowest font-data text-data-sm">
        <caption className="sr-only">
          Market statistics by locality: median price, rate per square metre,
          year-on-year movement, listing count and share of eco-rated stock.
        </caption>
        <thead>
          <tr className="bg-primary text-inverse-on-surface">
            <th scope="col" className="px-3 py-2 text-left font-semibold">Locality</th>
            <th scope="col" className="px-3 py-2 text-left font-semibold">Region</th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">Median</th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">₵/sqm</th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">YoY</th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">Listings</th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">Eco A–B</th>
          </tr>
        </thead>
        <tbody>
          {markets.map((m, i) => (
            <tr
              key={m.locality}
              className={i % 2 ? "bg-surface-container-low" : ""}
            >
              <th scope="row" className="px-3 py-2 text-left font-medium text-on-surface">
                {m.locality}
              </th>
              <td className="px-3 py-2 text-on-surface-variant">{m.region}</td>
              <td className="px-3 py-2 text-right">{formatCediCompact(m.medianPrice)}</td>
              <td className="px-3 py-2 text-right">
                ₵{m.avgPricePerSqm.toLocaleString("en-GH")}
              </td>
              <td
                className={`px-3 py-2 text-right font-medium ${m.yoyPct >= 0 ? "text-secondary" : "text-error"}`}
              >
                {formatPct(m.yoyPct)}
              </td>
              <td className="px-3 py-2 text-right">{m.listings}</td>
              <td className="px-3 py-2 text-right">{m.ecoSharePct}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
