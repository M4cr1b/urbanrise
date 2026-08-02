import { createClient } from "@/lib/supabase/server";
import type {
  Comparable,
  EcoRating,
  GreenFeature,
  GreenMaterial,
  LocalityMarket,
  MarketPoint,
  Professional,
  Property,
  Region,
} from "@/lib/types";
import type { PropertyFilters, ProfessionalFilters } from "./contract";

/**
 * Supabase implementation of the data source.
 *
 * Selected by `index.ts` when credentials are present. Shapes rows into the
 * same domain types the seeded source returns, so no screen knows which one it
 * is reading from.
 */

const PROPERTY_SELECT = `
  id, address, locality, district, region, lng, lat,
  type, style, bedrooms, bathrooms, floor_area_sqm, plot_area_sqm, year_built,
  asking_price, listed_date, status, tenure, title_status, eco_rating,
  verified_by, summary,
  agents ( name, firm, phone, ghis_verified ),
  property_media ( url, sort ),
  property_green_features ( label, icon ),
  sale_history ( price, sold_at, source )
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

  const saleHistory = (row.sale_history ?? [])
    .map((s: any) => ({
      price: Number(s.price),
      date: s.sold_at as string,
      source: s.source as Property["saleHistory"][number]["source"],
    }))
    .sort((a: any, b: any) => b.date.localeCompare(a.date));

  return {
    id: row.id,
    address: row.address,
    locality: row.locality,
    district: row.district,
    region: row.region as Region,
    coords: [Number(row.lng ?? 0), Number(row.lat ?? 0)],

    type: row.type,
    style: row.style ?? "Unknown",
    bedrooms: row.bedrooms ?? 0,
    bathrooms: row.bathrooms ?? 0,
    floorAreaSqm: row.floor_area_sqm != null ? Number(row.floor_area_sqm) : null,
    plotAreaSqm: row.plot_area_sqm != null ? Number(row.plot_area_sqm) : null,
    yearBuilt: row.year_built ?? null,

    askingPrice: Number(row.asking_price),
    listedDate: row.listed_date ?? "",
    status: row.status,
    saleHistory,

    tenure: row.tenure ?? "Unknown",
    titleStatus: row.title_status ?? "Unknown",

    ecoRating: (row.eco_rating ?? "D") as EcoRating,
    greenFeatures: (row.property_green_features ?? []).map(
      (f: any): GreenFeature => ({ label: f.label, icon: f.icon }),
    ),

    agent: {
      name: agent?.name ?? "Unknown",
      firm: agent?.firm ?? "Unknown",
      phone: agent?.phone ?? "",
      ghisVerified: Boolean(agent?.ghis_verified),
    },
    verifiedBy: row.verified_by ?? null,

    images: images.length > 0 ? images : ["/placeholder-property.svg"],
    summary: row.summary ?? "",
  };
}

/* --- Properties --------------------------------------------------------- */

export async function getProperties(): Promise<Property[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .order("asking_price", { ascending: false });

  if (error) throw new Error(`getProperties: ${error.message}`);
  return (data ?? []).map(mapProperty);
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`getPropertyById: ${error.message}`);
  return data ? mapProperty(data) : null;
}

export async function getFeaturedProperties(): Promise<Property[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .in("eco_rating", ["A", "B"])
    .eq("status", "Available")
    .order("asking_price", { ascending: false })
    .limit(3);

  if (error) throw new Error(`getFeaturedProperties: ${error.message}`);
  return (data ?? []).map(mapProperty);
}

const ECO_ORDER: EcoRating[] = ["A", "B", "C", "D", "E", "F", "G"];

export async function searchProperties(
  filters: PropertyFilters = {},
): Promise<Property[]> {
  const supabase = await createClient();
  let q = supabase.from("properties").select(PROPERTY_SELECT);

  if (filters.locality && filters.locality !== "All")
    q = q.eq("locality", filters.locality);
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
      `address.ilike.${term},locality.ilike.${term},district.ilike.${term}`,
    );
  }

  const { data, error } = await q.order("asking_price", { ascending: false });
  if (error) throw new Error(`searchProperties: ${error.message}`);
  return (data ?? []).map(mapProperty);
}

export async function getLocalities(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("properties").select("locality");
  if (error) throw new Error(`getLocalities: ${error.message}`);
  return [...new Set((data ?? []).map((r: any) => r.locality as string))].sort();
}

/* --- Comparables -------------------------------------------------------- */

/**
 * The subject under valuation. Until valuations are persisted per user, this is
 * the most recently listed verified property — a sensible default case file.
 */
export async function getSubjectProperty(): Promise<Property> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .not("verified_by", "is", null)
    .order("listed_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`getSubjectProperty: ${error.message}`);
  if (!data) throw new Error("getSubjectProperty: no properties found");
  return mapProperty(data);
}

export async function getComparables(
  subjectId?: string,
): Promise<Comparable[]> {
  const supabase = await createClient();
  const id = subjectId ?? (await getSubjectProperty()).id;

  // PostGIS does the distance work — ST_DWithin on the GiST index.
  const { data: near, error: rpcError } = await supabase.rpc(
    "comparables_within",
    { subject_id: id, radius_m: 60000, max_rows: 30 },
  );
  if (rpcError) throw new Error(`getComparables: ${rpcError.message}`);

  const rows = (near ?? []) as { property_id: string; distance_km: number }[];
  if (rows.length === 0) return [];

  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .in(
      "id",
      rows.map((r) => r.property_id),
    );
  if (error) throw new Error(`getComparables: ${error.message}`);

  const distances = new Map(rows.map((r) => [r.property_id, r.distance_km]));
  return (data ?? [])
    .map((row) => ({
      ...mapProperty(row),
      distanceKm: distances.get(row.id) ?? 0,
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/* --- Professionals ------------------------------------------------------ */

export async function getProfessionals(
  filters: ProfessionalFilters = {},
): Promise<Professional[]> {
  const supabase = await createClient();
  let q = supabase.from("professionals").select("*");

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
    }),
  );
}

/* --- Market intelligence ------------------------------------------------ */

export async function getLocalityMarkets(): Promise<LocalityMarket[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("market_stats")
    .select("*")
    .order("period", { ascending: true });

  if (error) throw new Error(`getLocalityMarkets: ${error.message}`);

  // Group the monthly rows into one series per locality; the newest row
  // supplies the headline figures.
  const grouped = new Map<string, any[]>();
  for (const row of data ?? []) {
    const list = grouped.get(row.locality) ?? [];
    list.push(row);
    grouped.set(row.locality, list);
  }

  return [...grouped.entries()].map(([locality, rows]) => {
    const latest = rows[rows.length - 1];
    const series: MarketPoint[] = rows.map((r) => ({
      period: String(r.period).slice(0, 7),
      medianPrice: Number(r.median_price ?? 0),
      avgPricePerSqm: Number(r.avg_price_per_sqm ?? 0),
      listings: r.listings ?? 0,
    }));

    return {
      locality,
      region: latest.region as Region,
      medianPrice: Number(latest.median_price ?? 0),
      avgPricePerSqm: Number(latest.avg_price_per_sqm ?? 0),
      yoyPct: Number(latest.yoy_pct ?? 0),
      listings: latest.listings ?? 0,
      ecoSharePct: Number(latest.eco_share_pct ?? 0),
      series,
    };
  });
}

export async function getLocalityMarket(
  locality: string,
): Promise<LocalityMarket | null> {
  const all = await getLocalityMarkets();
  return all.find((m) => m.locality === locality) ?? null;
}

export async function getNationalStats() {
  const markets = await getLocalityMarkets();
  const accra = markets.filter((m) => m.region === "Greater Accra");
  const medians = accra.map((m) => m.medianPrice).sort((a, b) => a - b);
  const eastLegon = markets.find((m) => m.locality === "East Legon");

  return {
    verifiedListings: markets.reduce((sum, m) => sum + m.listings, 0),
    medianGreaterAccra: medians[Math.floor(medians.length / 2)] ?? 0,
    medianGreaterAccraYoy: eastLegon?.yoyPct ?? 0,
    avgPerSqmEastLegon: eastLegon?.avgPricePerSqm ?? 0,
  };
}

/* --- Green Building Hub ------------------------------------------------- */

export async function getMaterials(): Promise<GreenMaterial[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("green_materials")
    .select("*, suppliers ( name )")
    .order("saving_vs_conventional_pct", { ascending: false });

  if (error) throw new Error(`getMaterials: ${error.message}`);

  return (data ?? []).map((r: any): GreenMaterial => {
    const supplier = Array.isArray(r.suppliers) ? r.suppliers[0] : r.suppliers;
    return {
      id: r.id,
      name: r.name,
      category: r.category,
      supplier: supplier?.name ?? "Unknown",
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
