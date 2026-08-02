import type { LocalityMarket, MarketPoint, Region } from "@/lib/types";

/**
 * Locality-level market intelligence.
 *
 * The 24-month series is derived from each locality's current median and its
 * year-on-year movement rather than hand-entered, so the trend lines and the
 * headline figures can never drift apart. A small deterministic wobble keeps
 * the curves readable as real series instead of straight lines — seeded, so
 * server and client render identically.
 */

const MONTHS = 24;

/** Deterministic pseudo-noise in [-1, 1], stable across renders. */
function wobble(seed: number, i: number): number {
  const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

function buildSeries(
  medianNow: number,
  perSqmNow: number,
  yoyPct: number,
  listings: number,
  seed: number,
): MarketPoint[] {
  // Two years back at the current annual rate, compounded.
  const annual = yoyPct / 100;
  const start = medianNow / Math.pow(1 + annual, 2);
  const startPerSqm = perSqmNow / Math.pow(1 + annual, 2);

  const points: MarketPoint[] = [];
  const end = new Date("2026-07-01");

  for (let i = 0; i < MONTHS; i++) {
    const t = i / (MONTHS - 1);
    const growth = Math.pow(1 + annual, 2 * t);
    const noise = 1 + wobble(seed, i) * 0.018;

    const d = new Date(end);
    d.setMonth(d.getMonth() - (MONTHS - 1 - i));

    points.push({
      period: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      medianPrice: Math.round((start * growth * noise) / 1000) * 1000,
      avgPricePerSqm: Math.round(startPerSqm * growth * noise),
      listings: Math.max(
        8,
        Math.round(listings * (0.82 + t * 0.18) * (1 + wobble(seed + 7, i) * 0.09)),
      ),
    });
  }

  return points;
}

interface Seed {
  locality: string;
  region: Region;
  medianPrice: number;
  avgPricePerSqm: number;
  yoyPct: number;
  listings: number;
  ecoSharePct: number;
}

const seeds: Seed[] = [
  { locality: "Airport Residential", region: "Greater Accra", medianPrice: 3_450_000, avgPricePerSqm: 11_200, yoyPct: 6.4, listings: 142, ecoSharePct: 31 },
  { locality: "Cantonments", region: "Greater Accra", medianPrice: 2_980_000, avgPricePerSqm: 10_400, yoyPct: 7.1, listings: 168, ecoSharePct: 38 },
  { locality: "Labone", region: "Greater Accra", medianPrice: 2_420_000, avgPricePerSqm: 9_600, yoyPct: 5.2, listings: 121, ecoSharePct: 24 },
  { locality: "East Legon", region: "Greater Accra", medianPrice: 2_310_000, avgPricePerSqm: 9_800, yoyPct: 8.2, listings: 394, ecoSharePct: 42 },
  { locality: "East Legon Hills", region: "Greater Accra", medianPrice: 1_940_000, avgPricePerSqm: 7_650, yoyPct: 11.4, listings: 287, ecoSharePct: 51 },
  { locality: "Dzorwulu", region: "Greater Accra", medianPrice: 2_050_000, avgPricePerSqm: 8_900, yoyPct: 4.8, listings: 96, ecoSharePct: 27 },
  { locality: "West Legon", region: "Greater Accra", medianPrice: 1_820_000, avgPricePerSqm: 7_900, yoyPct: 6.9, listings: 134, ecoSharePct: 33 },
  { locality: "Tema Community 25", region: "Greater Accra", medianPrice: 1_280_000, avgPricePerSqm: 5_400, yoyPct: 9.6, listings: 218, ecoSharePct: 46 },
  { locality: "Spintex", region: "Greater Accra", medianPrice: 1_010_000, avgPricePerSqm: 5_150, yoyPct: 3.4, listings: 176, ecoSharePct: 19 },
  { locality: "Adenta", region: "Greater Accra", medianPrice: 745_000, avgPricePerSqm: 4_380, yoyPct: -2.1, listings: 152, ecoSharePct: 12 },
  { locality: "Ashongman", region: "Greater Accra", medianPrice: 690_000, avgPricePerSqm: 4_050, yoyPct: -3.6, listings: 118, ecoSharePct: 9 },
  { locality: "Ahodwo", region: "Ashanti", medianPrice: 1_620_000, avgPricePerSqm: 5_900, yoyPct: 7.8, listings: 88, ecoSharePct: 29 },
  { locality: "Nhyiaeso", region: "Ashanti", medianPrice: 910_000, avgPricePerSqm: 4_720, yoyPct: 5.5, listings: 74, ecoSharePct: 22 },
];

export const localityMarkets: LocalityMarket[] = seeds.map((s, i) => ({
  ...s,
  series: buildSeries(
    s.medianPrice,
    s.avgPricePerSqm,
    s.yoyPct,
    s.listings,
    i + 1,
  ),
}));

/** Headline figures for the marketing page's stats band. */
export const nationalStats = {
  verifiedListings: 12_480,
  medianGreaterAccra: 1_900_000,
  medianGreaterAccraYoy: 8.2,
  avgPerSqmEastLegon: 9_800,
};
