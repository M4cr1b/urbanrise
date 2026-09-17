import type {
  Comparable,
  EcoRating,
  Professional,
  Property,
} from "@/lib/types";
import type { PropertyFilters, ProfessionalFilters } from "./contract";
import {
  FEATURED_PROPERTY_IDS,
  properties,
} from "./properties";
import {
  comparables,
  SUBJECT_COMPARABLE_ID,
} from "./comparables";
import { professionals } from "./professionals";
import { materials } from "./materials";
import {
  aggregateLocalityStats,
  aggregateNationalStats,
  normalizeLocality,
} from "./market";
import { isActiveRegion } from "@/lib/regions";

/**
 * Only records inside the covered region reach the interface.
 *
 * Filtered once here rather than at each call site, so a new query cannot
 * accidentally leak an out-of-scope record — and so widening coverage is a
 * change to `ACTIVE_REGIONS` alone.
 */
const inScope = properties.filter((p) => isActiveRegion(p.region));
const prosInScope = professionals.filter((p) => isActiveRegion(p.region));
const materialsInScope = materials.filter((m) => isActiveRegion(m.region));

/**
 * Seeded implementation of the data source.
 *
 * Satisfies the same contract as `supabase-source.ts`; `index.ts` picks between
 * them at import time based on whether credentials are present. Every screen
 * reads through these functions and nothing imports the seed arrays directly.
 */

export async function getNationalStats() {
  return aggregateNationalStats(inScope);
}

// ---------------------------------------------------------------------------
// Properties
// ---------------------------------------------------------------------------

export async function getProperties(): Promise<Property[]> {
  return inScope;
}

export async function getPropertyById(id: string): Promise<Property | null> {
  return inScope.find((p) => p.id === id) ?? null;
}

export async function getFeaturedProperties(): Promise<Property[]> {
  return FEATURED_PROPERTY_IDS.map(
    (id) => inScope.find((p) => p.id === id)!,
  ).filter(Boolean);
}

const ECO_ORDER: EcoRating[] = ["A", "B", "C", "D", "E", "F", "G"];

export async function searchProperties(
  filters: PropertyFilters = {},
): Promise<Property[]> {
  const {
    type,
    minBeds,
    maxBeds,
    minPrice,
    maxPrice,
    tenure,
    status,
    minEcoRating,
    query,
  } = filters;

  const ecoCeiling = minEcoRating ? ECO_ORDER.indexOf(minEcoRating) : null;

  return inScope.filter((p) => {
    if (type && type !== "All" && p.type !== type) return false;
    if (minBeds != null && p.bedrooms < minBeds) return false;
    if (maxBeds != null && p.bedrooms > maxBeds) return false;
    if (minPrice != null && p.askingPrice < minPrice) return false;
    if (maxPrice != null && p.askingPrice > maxPrice) return false;
    if (tenure && tenure !== "All" && p.tenure !== tenure) return false;
    if (status && status !== "All" && p.status !== status) return false;
    if (ecoCeiling != null && ECO_ORDER.indexOf(p.ecoRating) > ecoCeiling)
      return false;
    if (query) {
      const haystack =
        `${p.address} ${p.district} ${p.summary}`.toLowerCase();
      if (!haystack.includes(query.toLowerCase())) return false;
    }
    return true;
  });
}

/** Property ids for `generateStaticParams`. */
export async function getPropertyIds(): Promise<string[]> {
  return inScope.map((p) => p.id);
}


// ---------------------------------------------------------------------------
// Comparables
// ---------------------------------------------------------------------------

export async function getSubjectProperty(): Promise<Comparable | null> {
  if (!SUBJECT_COMPARABLE_ID) return null;
  return comparables.find((c) => c.id === SUBJECT_COMPARABLE_ID) ?? null;
}

/** Comparable evidence for a subject, nearest first. */
export async function getComparables(): Promise<Comparable[]> {
  return comparables;
}

// ---------------------------------------------------------------------------
// Professionals
// ---------------------------------------------------------------------------

export async function getProfessionals(
  filters: ProfessionalFilters = {},
): Promise<Professional[]> {
  const { discipline, region, verifiedOnly, query } = filters;

  return prosInScope.filter((p) => {
    if (discipline && discipline !== "All" && p.discipline !== discipline)
      return false;
    if (region && region !== "All" && p.region !== region) return false;
    if (verifiedOnly && !p.verified) return false;
    if (query) {
      const haystack =
        `${p.name} ${p.firm} ${p.specialisms.join(" ")}`.toLowerCase();
      if (!haystack.includes(query.toLowerCase())) return false;
    }
    return true;
  });
}

// ---------------------------------------------------------------------------
// Market intelligence
// ---------------------------------------------------------------------------

export async function getLocalityMarket(locality: string) {
  const normalized = normalizeLocality(locality);
  const all = aggregateLocalityStats(inScope);
  return all.find((m) => m.locality === normalized) ?? null;
}

export async function getLocalityMarkets() {
  return aggregateLocalityStats(inScope);
}

// ---------------------------------------------------------------------------
// Green Building Hub
// ---------------------------------------------------------------------------

export async function getMaterials() {
  return materialsInScope;
}
