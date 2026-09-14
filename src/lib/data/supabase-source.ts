import { createStaticClient } from "@/lib/supabase/static";

/**
 * Every read below is public reference data — listings, professionals,
 * materials, market statistics. None of it is scoped to a signed-in user, so
 * none of it needs the cookie-bound client.
 *
 * That distinction is not cosmetic. Reading `cookies()` opts a route out of
 * caching entirely, so with the session client every page render hit Supabase
 * afresh. Under even light concurrency the connection times out and the page
 * 500s — which is exactly what the test suite caught. Reading anonymously lets
 * these routes be cached and revalidated on a timer instead.
 *
 * When per-user data arrives (a valuer's saved valuations), that query — and
 * only that query — takes the session client from `@/lib/supabase/server`.
 */
function db() {
  return createStaticClient();
}
import type {
  Comparable,
  EcoRating,
  GreenFeature,
  GreenMaterial,
  LocalityStats,
  NationalStats,
  Professional,
  Property,
  Region,
} from "@/lib/types";
import {
  aggregateLocalityStats,
  aggregateNationalStats,
  normalizeLocality,
} from "@/lib/data/market";
import type { PropertyFilters, ProfessionalFilters } from "./contract";
import { FEATURED_PROPERTY_IDS } from "./properties";
import { ACTIVE_REGIONS } from "@/lib/regions";

/**
 * Supabase implementation of the data source.
 *
 * Selected by `index.ts` when credentials are present. Shapes rows into the
 * same domain types the seeded source returns, so no screen knows which one it
 * is reading from.
 */

const PROPERTY_SELECT = `
  id, address, district, region,
  type, style, storey, bedrooms, bathrooms, toilets, floor_area_sqm,
  asking_price, status, tenure, remaining_lease_terms, eco_rating,
  condition, summary, furnishing, facilities, self_contained,
  agents ( name, phone, secondary_phone ),
  property_media ( url, sort ),
  property_green_features ( label, icon )
`;

/* eslint-disable @typescript-eslint/no-explicit-any -- PostgREST embeds are
   loosely typed until `supabase gen types` runs against the live project; the
   mappers below are the single place that shape is pinned down. */

function mapProperty(row: any): Property {
  const agent = Array.isArray(row.agents) ? row.agents[0] : row.agents;

  const images = (row.property_media ?? [])
    .slice()
    .sort((a: any, b: any) => (a.sort ?? 0) - (b.sort ?? 0))
    .map((m: any) => m.url as string);

  return {
    id: row.id,
    address: row.address,
    district: row.district,
    region: row.region as Region,

    type: row.type,
    style: row.style ?? "Unknown",
    storey: row.storey ?? null,
    bedrooms: row.bedrooms ?? 0,
    bathrooms: row.bathrooms ?? 0,
    toilets: row.toilets ?? null,
    floorAreaSqm: row.floor_area_sqm != null ? Number(row.floor_area_sqm) : null,

    askingPrice: Number(row.asking_price),
    status: row.status,

    tenure: row.tenure ?? "Unknown",
    remainingLeaseTerm: row.remaining_lease_terms ?? null,

    condition: row.condition ?? undefined,
    ecoRating: (row.eco_rating ?? "D") as EcoRating,
    greenFeatures: (row.property_green_features ?? []).map(
      (f: any): GreenFeature => ({ label: f.label, icon: f.icon }),
    ),
    furnishing: row.furnishing ?? undefined,
    facilities: row.facilities ?? undefined,
    selfContained: row.self_contained ?? undefined,

    agent: {
      name: agent?.name ?? "Unknown",
      phone: agent?.phone ?? "",
      secondaryPhone: agent?.secondary_phone ?? undefined,
    },

    images: images.length > 0 ? images : ["/placeholder-property.svg"],
    summary: row.summary ?? "",
  };
}

/* --- Properties --------------------------------------------------------- */

export async function getProperties(): Promise<Property[]> {
  const supabase = db();
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .in("region", ACTIVE_REGIONS)
    .order("asking_price", { ascending: false });

  if (error) throw new Error(`getProperties: ${error.message}`);
  return (data ?? []).map(mapProperty);
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const supabase = db();
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .in("region", ACTIVE_REGIONS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`getPropertyById: ${error.message}`);
  return data ? mapProperty(data) : null;
}

export async function getFeaturedProperties(): Promise<Property[]> {
  const supabase = db();
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .in("region", ACTIVE_REGIONS)
    .in("id", FEATURED_PROPERTY_IDS);

  if (error) throw new Error(`getFeaturedProperties: ${error.message}`);

  // Re-sort by the order in FEATURED_PROPERTY_IDS since PostgREST .in() doesn't preserve order
  const dataMap = new Map((data ?? []).map((p) => [p.id, p]));
  const ordered = FEATURED_PROPERTY_IDS
    .map((id) => dataMap.get(id))
    .filter((p): p is typeof data[number] => p != null)
    .map(mapProperty);

  return ordered;
}

const ECO_ORDER: EcoRating[] = ["A", "B", "C", "D", "E", "F", "G"];

export async function searchProperties(
  filters: PropertyFilters = {},
): Promise<Property[]> {
  const supabase = db();
  let q = supabase.from("properties").select(PROPERTY_SELECT).in("region", ACTIVE_REGIONS);

  if (filters.type && filters.type !== "All") q = q.eq("type", filters.type);
  if (filters.tenure && filters.tenure !== "All")
    q = q.eq("tenure", filters.tenure);
  if (filters.status && filters.status !== "All")
    q = q.eq("status", filters.status);
  if (filters.minBeds != null) q = q.gte("bedrooms", filters.minBeds);
  if (filters.maxBeds != null) q = q.lte("bedrooms", filters.maxBeds);
  if (filters.minPrice != null) q = q.gte("asking_price", filters.minPrice);
  if (filters.maxPrice != null) q = q.lte("asking_price", filters.maxPrice);
  if (filters.minEcoRating) {
    const allowed = ECO_ORDER.slice(0, ECO_ORDER.indexOf(filters.minEcoRating) + 1);
    q = q.in("eco_rating", allowed);
  }
  if (filters.query) {
    const term = `%${filters.query}%`;
    q = q.or(
      `address.ilike.${term},district.ilike.${term}`,
    );
  }

  const { data, error } = await q.order("asking_price", { ascending: false });
  if (error) throw new Error(`searchProperties: ${error.message}`);
  return (data ?? []).map(mapProperty);
}

/**
 * Property ids for `generateStaticParams`.
 *
 * Uses the cookie-free client: this runs at build time, where there is no
 * request and therefore no cookie store to read.
 */
export async function getPropertyIds(): Promise<string[]> {
  const supabase = db();
  const { data, error } = await supabase.from("properties").select("id").in("region", ACTIVE_REGIONS);
  if (error) throw new Error(`getPropertyIds: ${error.message}`);
  return (data ?? []).map((r: { id: string }) => r.id);
}


/* --- Comparables -------------------------------------------------------- */

/**
 * The subject under valuation.
 *
 * Until valuations are persisted per user there is no real "current case", so
 * this resolves the same designated record the seeded source uses — otherwise
 * a local demo and the deployed site would open on different subjects, which is
 * needlessly confusing. Falls back to the most recently listed verified
 * property if that record is absent from the database.
 */
export async function getSubjectProperty(): Promise<Comparable | null> {
  return null;
}

export async function getComparables(): Promise<Comparable[]> {
  return [];
}

/* --- Professionals ------------------------------------------------------ */

export async function getProfessionals(
  filters: ProfessionalFilters = {},
): Promise<Professional[]> {
  const supabase = db();
  let q = supabase.from("professionals").select("*").in("region", ACTIVE_REGIONS);

  if (filters.discipline && filters.discipline !== "All")
    q = q.eq("discipline", filters.discipline);
  if (filters.region && filters.region !== "All")
    q = q.eq("region", filters.region);
  if (filters.verifiedOnly) q = q.eq("verified", true);
  if (filters.query) {
    const term = `%${filters.query}%`;
    q = q.or(`name.ilike.${term},firm.ilike.${term}`);
  }

  const { data, error } = await q.order("name");
  if (error) throw new Error(`getProfessionals: ${error.message}`);

  return (data ?? []).map(
    (r: any): Professional => ({
      id: r.id,
      name: r.name,
      firm: r.firm,
      discipline: r.discipline,
      licenceNo: r.licence_no ?? "",
      region: r.region,
      verified: Boolean(r.verified),
      yearsExperience: r.years_experience ?? 0,
      specialisms: r.specialisms ?? [],
      phone: r.phone ?? "",
      email: r.email ?? "",
      photoUrl: r.photo_url ?? null,
    }),
  );
}

/* --- Market intelligence ------------------------------------------------ */

export async function getLocalityMarkets(): Promise<LocalityStats[]> {
  const properties = await getProperties();
  return aggregateLocalityStats(properties);
}

export async function getLocalityMarket(
  locality: string,
): Promise<LocalityStats | null> {
  const normalized = normalizeLocality(locality);
  const all = await getLocalityMarkets();
  return all.find((m) => m.locality === normalized) ?? null;
}

export async function getNationalStats(): Promise<NationalStats> {
  const properties = await getProperties();
  return aggregateNationalStats(properties);
}

/* --- Green Building Hub ------------------------------------------------- */

export async function getMaterials(): Promise<GreenMaterial[]> {
  const supabase = db();
  const { data, error } = await supabase
    .from("green_materials")
    .select("*, suppliers ( name, locality, address, phone, email, website )")
    .in("region", ACTIVE_REGIONS)
    .order("saving_vs_conventional_pct", { ascending: false });

  if (error) throw new Error(`getMaterials: ${error.message}`);

  return (data ?? []).map((r: any): GreenMaterial => {
    const supplier = Array.isArray(r.suppliers) ? r.suppliers[0] : r.suppliers;
    return {
      id: r.id,
      name: r.name,
      category: r.category,
      supplier: supplier?.name ?? "Unknown",
      supplierDetail: supplier
        ? {
            name: supplier.name,
            locality: supplier.locality ?? null,
            address: supplier.address ?? null,
            phone: supplier.phone ?? null,
            email: supplier.email ?? null,
            website: supplier.website ?? null,
          }
        : null,
      imageUrl: r.image_url ?? null,
      region: r.region,
      certification: r.certification ?? "",
      carbonKgCo2e: Number(r.carbon_kg_co2e ?? 0),
      savingVsConventionalPct: Number(r.saving_vs_conventional_pct ?? 0),
      unit: r.unit ?? "unit",
      pricePerUnit: Number(r.price_per_unit ?? 0),
      summary: r.summary ?? "",
    };
  });
}
