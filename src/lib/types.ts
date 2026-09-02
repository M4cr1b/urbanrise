/**
 * UrbanRise domain model.
 *
 * Deliberately mirrors the columns a Ghanaian valuer actually reasons with:
 * tenure and Land Commission title status matter as much as price here, because
 * unregistered or customary-held land is the single biggest source of
 * transaction risk the proposal identifies.
 */

export type PropertyType =
  | "House"
  | "Apartment"
  | "Townhouse"
  | "Compound House"
  | "Land";

export type PropertyStyle =
  | "Detached"
  | "Semi-Detached"
  | "Terrace"
  | "Mid Terrace"
  | "End Terrace"
  | "Storey"
  | "Bungalow"
  | "Purpose Built"
  | "Unknown";

/** Ghana's land market is overwhelmingly leasehold; freehold is the exception. */
export type Tenure =
  | "Freehold"
  | "Leasehold 99yr"
  | "Leasehold 50yr"
  | "Customary"
  | "Unknown";

/** Registration state at the Lands Commission. */
export type TitleStatus = "Registered" | "Pending" | "Unregistered" | "Unknown";

/** A–G, mirroring the EPC banding valuers already recognise. */
export type EcoRating = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export type ListingStatus = "Available" | "Under Offer" | "Sold";

export type Region =
  | "Greater Accra"
  | "Ashanti"
  | "Western"
  | "Eastern"
  | "Central"
  | "Northern";

export interface GreenFeature {
  label: string;
  /** Lucide icon name, resolved at render time. */
  icon: "sun" | "droplets" | "wind" | "recycle" | "leaf" | "battery-charging";
}

export interface SaleRecord {
  price: number;
  /** ISO date. */
  date: string;
  source: "Lands Commission" | "Agent declared" | "Verified survey";
}

export interface Agent {
  name: string;
  firm: string;
  phone: string;
  /** Registered with the Ghana Institution of Surveyors. */
  ghisVerified: boolean;
}

export interface Property {
  id: string;
  /** Street-level address as it would be advertised. */
  address: string;
  locality: string;
  district: string;
  region: Region;
  /** [lng, lat] — matches PostGIS point ordering. Null when not yet surveyed. */
  coords: [number, number] | null;

  type: PropertyType;
  style: PropertyStyle;
  bedrooms: number;
  bathrooms: number;
  floorAreaSqm: number | null;
  plotAreaSqm: number | null;
  yearBuilt: number | null;
  /** e.g. "Semi-Furnished". Absent for older listings that predate this field. */
  furnishing?: string;
  /** Flat amenity list, e.g. "Wi-Fi", "24-hour Electricity". */
  facilities?: string[];

  /** Cedi. */
  askingPrice: number;
  listedDate: string;
  status: ListingStatus;
  saleHistory: SaleRecord[];

  tenure: Tenure;
  titleStatus: TitleStatus;

  ecoRating: EcoRating;
  greenFeatures: GreenFeature[];

  agent: Agent;
  /** Name of the GhIS-registered surveyor who verified the record. */
  verifiedBy: string | null;

  images: string[];
  summary: string;
}

/** A property positioned relative to a subject property under valuation. */
export interface Comparable extends Property {
  /** Kilometres from the subject. */
  distanceKm: number;
}

export type Discipline =
  | "Estate Surveyor & Valuer"
  | "Estate Agent"
  | "Property Lawyer"
  | "Architect"
  | "Structural Engineer"
  | "Quantity Surveyor"
  | "Property Manager"
  | "Mortgage Consultant";

export interface Professional {
  id: string;
  name: string;
  firm: string;
  discipline: Discipline;
  /** Professional body registration number. */
  licenceNo: string;
  region: Region;
  verified: boolean;
  yearsExperience: number;
  specialisms: string[];
  phone: string;
  email: string;
  /** Profile photograph served from /public. */
  photoUrl: string | null;
}

export type MaterialCategory =
  | "Structure"
  | "Roofing"
  | "Insulation"
  | "Energy"
  | "Water"
  | "Finishes";

/** Where a material can actually be bought — the Green Hub's whole point. */
export interface Supplier {
  name: string;
  locality: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
}

export interface GreenMaterial {
  id: string;
  name: string;
  category: MaterialCategory;
  supplier: string;
  /** Full purchasing detail; `supplier` remains the display name. */
  supplierDetail: Supplier | null;
  /** Photograph of the material itself. */
  imageUrl: string | null;
  region: Region;
  certification: string;
  /** kg CO2e per functional unit — lower is better. */
  carbonKgCo2e: number;
  /** Percentage saving against the conventional equivalent. */
  savingVsConventionalPct: number;
  unit: string;
  pricePerUnit: number;
  summary: string;
}

export interface MarketPoint {
  /** ISO month, e.g. "2026-01". */
  period: string;
  medianPrice: number;
  avgPricePerSqm: number;
  listings: number;
}

export interface LocalityMarket {
  locality: string;
  region: Region;
  medianPrice: number;
  avgPricePerSqm: number;
  /** Year-on-year change, percent. Negative means decline. */
  yoyPct: number;
  listings: number;
  /** Share of listings rated A or B. */
  ecoSharePct: number;
  series: MarketPoint[];
}
