import type {
  Comparable,
  EcoRating,
  Professional,
  Property,
} from "@/lib/types";
import type { PropertyFilters, ProfessionalFilters } from "./contract";
import {
  FEATURED_PROPERTY_IDS,
  SUBJECT_PROPERTY_ID,
  properties,
} from "./properties";
import { professionals } from "./professionals";
import { materials } from "./materials";
import { localityMarkets, nationalStats } from "./market";

/**
 * Seeded implementation of the data source.
 *
 * Satisfies the same contract as `supabase-source.ts`; `index.ts` picks between
 * them at import time based on whether credentials are present. Every screen
 * reads through these functions and nothing imports the seed arrays directly.
 */

export async function getNationalStats() {
  return nationalStats;
}

// ---------------------------------------------------------------------------
// Properties
// ---------------------------------------------------------------------------

export async function getProperties(): Promise<Property[]> {
  return properties;
}

export async function getPropertyById(id: string): Promise<Property | null> {
  return properties.find((p) => p.id === id) ?? null;
}

export async function getFeaturedProperties(): Promise<Property[]> {
  return FEATURED_PROPERTY_IDS.map(
    (id) => properties.find((p) => p.id === id)!,
  ).filter(Boolean);
}

const ECO_ORDER: EcoRating[] = ["A", "B", "C", "D", "E", "F", "G"];

export async function searchProperties(
  filters: PropertyFilters = {},
): Promise<Property[]> {
  const {
    locality,
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

  return properties.filter((p) => {
    if (locality && locality !== "All" && p.locality !== locality) return false;
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
        `${p.address} ${p.locality} ${p.district} ${p.summary}`.toLowerCase();
      if (!haystack.includes(query.toLowerCase())) return false;
    }
    return true;
  });
}

/** Property ids for `generateStaticParams`. */
export async function getPropertyIds(): Promise<string[]> {
  return properties.map((p) => p.id);
}

export async function getLocalities(): Promise<string[]> {
  return [...new Set(properties.map((p) => p.locality))].sort();
}

// ---------------------------------------------------------------------------
// Comparables
// ---------------------------------------------------------------------------

/**
 * Great-circle distance in kilometres.
 * Replaced by `ST_Distance` on the PostGIS `geom` column once Supabase is live.
 */
function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export async function getSubjectProperty(): Promise<Property> {
  return properties.find((p) => p.id === SUBJECT_PROPERTY_ID)!;
}

/** Comparable evidence for a subject, nearest first. */
export async function getComparables(
  subjectId: string = SUBJECT_PROPERTY_ID,
): Promise<Comparable[]> {
  const subject = properties.find((p) => p.id === subjectId);
  if (!subject) return [];

  return properties
    .filter((p) => p.id !== subjectId)
    .map((p) => ({ ...p, distanceKm: haversineKm(subject.coords, p.coords) }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

// ---------------------------------------------------------------------------
// Professionals
// ---------------------------------------------------------------------------

export async function getProfessionals(
  filters: ProfessionalFilters = {},
): Promise<Professional[]> {
  const { discipline, region, verifiedOnly, query } = filters;

  return professionals.filter((p) => {
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
  return localityMarkets.find((m) => m.locality === locality) ?? null;
}

export async function getLocalityMarkets() {
  return localityMarkets;
}

// ---------------------------------------------------------------------------
// Green Building Hub
// ---------------------------------------------------------------------------

export async function getMaterials() {
  return materials;
}
