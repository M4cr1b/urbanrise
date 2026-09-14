import type { LocalityStats, NationalStats, Property, PropertyType, EcoRating } from "@/lib/types";

/** Locality address variants that should be collapsed into a single normalized name. */
export const LOCALITY_ALIASES: Record<string, string> = {
  "Adjiriganor": "Adjiringanor",
  "Achimota Tranta Hills": "Achimota",
  "Achimota Tantra Hills": "Achimota",
  "Achimota Mill 7": "Achimota",
  "Achimota, Kingsby": "Achimota",
};

/** Normalize a raw address string to a consistent locality name. */
export function normalizeLocality(address: string): string {
  return LOCALITY_ALIASES[address] ?? address;
}

/** Aggregate property data into locality-level statistics. */
export function aggregateLocalityStats(properties: Property[]): LocalityStats[] {
  const groups = new Map<string, Property[]>();

  // Group properties by normalized locality
  for (const prop of properties) {
    const normalized = normalizeLocality(prop.address);
    if (!groups.has(normalized)) {
      groups.set(normalized, []);
    }
    groups.get(normalized)!.push(prop);
  }

  // Convert groups to LocalityStats
  const stats: LocalityStats[] = [];

  for (const [locality, props] of groups) {
    const prices = props.map((p) => p.askingPrice).sort((a, b) => a - b);
    const bedrooms = props.map((p) => p.bedrooms);
    const typeCounts: Partial<Record<PropertyType, number>> = {};
    const ecoRatings: EcoRating[] = [];
    let pricePerSqmSum = 0;
    let pricePerSqmCount = 0;

    for (const prop of props) {
      typeCounts[prop.type] = (typeCounts[prop.type] ?? 0) + 1;
      ecoRatings.push(prop.ecoRating);
      if (prop.floorAreaSqm && prop.floorAreaSqm > 0) {
        pricePerSqmSum += prop.askingPrice / prop.floorAreaSqm;
        pricePerSqmCount++;
      }
    }

    // Compute median price
    const mid = Math.floor(prices.length / 2);
    const medianPrice =
      prices.length % 2 === 0
        ? Math.round((prices[mid - 1] + prices[mid]) / 2)
        : prices[mid];

    // Compute avg price per sqm (null if no usable floor area)
    const avgPricePerSqm =
      pricePerSqmCount > 0
        ? Math.round(pricePerSqmSum / pricePerSqmCount)
        : null;

    // Compute eco rating mode (ties toward better letter)
    const ecoMode = (
      ["A", "B", "C", "D", "E", "F", "G"] as const
    ).find((rating) => ecoRatings.filter((r) => r === rating).length ===
      Math.max(...["A", "B", "C", "D", "E", "F", "G"].map(
        (r) => ecoRatings.filter((er) => er === r).length,
      ))) ?? "D";

    const result: LocalityStats = {
      locality,
      district: props[0].district,
      region: props[0].region,
      listings: props.length,
      medianPrice,
      minPrice: prices[0],
      maxPrice: prices[prices.length - 1],
      avgPricePerSqm,
      pricePerSqmSampleSize: pricePerSqmCount,
      bedroomRange: {
        min: Math.min(...bedrooms),
        max: Math.max(...bedrooms),
      },
      typeMix: typeCounts,
      commonEcoRating: ecoMode,
    };

    stats.push(result);
  }

  // Sort by locality name for deterministic output
  return stats.sort((a, b) => a.locality.localeCompare(b.locality));
}

/** Aggregate property data into national statistics. */
export function aggregateNationalStats(properties: Property[]): NationalStats {
  const accra = properties.filter((p) => p.region === "Greater Accra");
  const prices = accra.map((p) => p.askingPrice).sort((a, b) => a - b);
  const mid = Math.floor(prices.length / 2);
  const medianGreaterAccra =
    prices.length % 2 === 0
      ? Math.round((prices[mid - 1] + prices[mid]) / 2)
      : prices[mid];

  // Count distinct normalized localities
  const localityStats = aggregateLocalityStats(accra);
  const areaCount = localityStats.length;

  return {
    verifiedListings: accra.length,
    medianGreaterAccra,
    areaCount,
  };
}
