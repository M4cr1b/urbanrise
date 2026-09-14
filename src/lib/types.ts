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
  | "Duplex"
  | "Villa"
  | "Mansion";

export type PropertyStyle =
  | "Detached"
  | "Semi-Detached"
  | "Terrace"
  | "Mid Terrace"
  | "End Terrace"
  | "Bungalow"
  | "Purpose Built"
  | "Unknown";

export type PropertyStorey =
  | "Single Storey"
  | "Multi Storey";

/** Ghana's land market is overwhelmingly leasehold; freehold is the exception. */
export type Tenure =
  | "Freehold"
  | "Leasehold"
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
  phone: string;
  /** A second contact number, when the listing gave more than one. */
  secondaryPhone?: string;
  /** Registered with the Ghana Institution of Surveyors. */
  ghisVerified: boolean;
}

export interface ListingAgent {
  name: string;
  phone: string;
  /** A second contact number, when the listing gave more than one. */
  secondaryPhone?: string;
}

export interface Property {
  id: string;
  /** Street-level address as it would be advertised. */
  address: string;
  district: string;
  region: Region;

  type: PropertyType;
  style: PropertyStyle;
  storey?: PropertyStorey | null;
  bedrooms: number;
  bathrooms: number;
  toilets?: number | null;
  floorAreaSqm: number | null;
  /** e.g. "Semi-Furnished". Absent for older listings that predate this field. */
  furnishing?: string;
  /** e.g. "Newly Built", "Renovated", "Old". */
  condition?: string;
  /** Whether the property is self-contained. */
  selfContained?: boolean;
  /** Flat amenity list, e.g. "Wi-Fi", "24-hour Electricity". */
  facilities?: string[];

  /** Cedi. */
  askingPrice: number;
  status: ListingStatus;

  tenure: Tenure;
  /** e.g. "Not specified", "Renewable". */
  remainingLeaseTerm?: string | null;

  ecoRating: EcoRating;
  greenFeatures: GreenFeature[];

  agent: ListingAgent;

  images: string[];
  summary: string;
}

export interface Comparable {
  id: string;
  address: string;
  district: string;
  region: Region;
  /** [lng, lat] — matches PostGIS point ordering. */
  coords: [number, number] | null;

  type: PropertyType;
  style: PropertyStyle;
  storey?: PropertyStorey | null;
  bedrooms: number;
  bathrooms: number;
  toilets?: number | null;
  floorAreaSqm: number | null;
  plotAreaSqm: number | null;
  yearBuilt: number | null;
  furnishing?: string;
  condition?: string;
  facilities?: string[];

  askingPrice: number;
  listedDate: string;
  status: ListingStatus;
  saleHistory: SaleRecord[];

  tenure: Tenure;
  leaseYearsRemaining: number | null;
  remainingLeaseTerm?: string | null;
  titleStatus: TitleStatus;

  ecoRating: EcoRating;
  greenFeatures: GreenFeature[];
  greenFeaturesNote?: string | null;

  agent: Agent;
  verifiedBy: string | null;

  images: string[];
  summary: string;

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

export interface LocalityStats {
  /** Normalized display name, e.g. "Achimota" (typos/sub-areas collapsed). */
  locality: string;
  district: string;
  region: Region;
  /** Sample size — always rendered next to every aggregate figure. */
  listings: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  /** Average ₵/sqm, computed only over listings with non-null floorAreaSqm. */
  avgPricePerSqm: number | null;
  /** How many of `listings` had a usable floor area — shown when < listings. */
  pricePerSqmSampleSize: number;
  /** e.g. { min: 3, max: 5 } — "3–5 bedrooms" */
  bedroomRange: { min: number; max: number };
  /** Counts per PropertyType present, e.g. { Villa: 2, Duplex: 1 }. */
  typeMix: Partial<Record<PropertyType, number>>;
  /** Mode eco rating (ties broken toward the better/lower letter). Never a % on small n. */
  commonEcoRating: EcoRating;
}

export interface NationalStats {
  verifiedListings: number;
  medianGreaterAccra: number;
  areaCount: number;
}
