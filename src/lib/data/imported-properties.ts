import type { Property } from "@/lib/types";
import type { PropertyFilters } from "./contract";
import { isActiveRegion } from "@/lib/regions";
import { properties37To44 } from "./properties-37-44";
import { orderPropertyImages } from "./property-images";

/** Ship these reviewed listings with their assets until they are stored in Supabase. */
const imported = properties37To44
  .filter((property) => isActiveRegion(property.region))
  .map((property) => ({
    ...property,
    images: orderPropertyImages(property.id, property.images),
  }));

export const importedPropertyIds = imported.map((property) => property.id);

/** A database record takes precedence, even when it no longer matches a filter. */
export function unpublishedProperties(publishedIds: readonly string[]): Property[] {
  const published = new Set(publishedIds);
  return imported.filter((property) => !published.has(property.id));
}

export function getImportedProperty(id: string): Property | null {
  return imported.find((property) => property.id === id) ?? null;
}

export function mergeProperties(database: Property[], additions: Property[]): Property[] {
  const merged = new Map(additions.map((property) => [property.id, property]));
  for (const property of database) merged.set(property.id, property);
  return [...merged.values()].sort((a, b) => b.askingPrice - a.askingPrice);
}

const ecoOrder = ["A", "B", "C", "D", "E", "F", "G"];

/** Match the public Supabase filters for the bundled portion of the catalog. */
export function matchesPropertyFilters(property: Property, filters: PropertyFilters): boolean {
  if (filters.type && filters.type !== "All" && property.type !== filters.type) return false;
  if (filters.tenure && filters.tenure !== "All" && property.tenure !== filters.tenure) return false;
  if (filters.status && filters.status !== "All" && property.status !== filters.status) return false;
  if (filters.minBeds != null && property.bedrooms < filters.minBeds) return false;
  if (filters.maxBeds != null && property.bedrooms > filters.maxBeds) return false;
  if (filters.minPrice != null && property.askingPrice < filters.minPrice) return false;
  if (filters.maxPrice != null && property.askingPrice > filters.maxPrice) return false;
  if (filters.minEcoRating && ecoOrder.indexOf(property.ecoRating) > ecoOrder.indexOf(filters.minEcoRating)) return false;
  if (filters.query) {
    const query = filters.query.toLowerCase();
    if (!property.address.toLowerCase().includes(query) && !property.district.toLowerCase().includes(query)) return false;
  }
  return true;
}
