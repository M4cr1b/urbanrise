import type {
  Discipline,
  EcoRating,
  ListingStatus,
  PropertyType,
  Region,
  Tenure,
} from "@/lib/types";

/** Filter shapes shared by both data sources. */

export interface PropertyFilters {
  locality?: string;
  type?: PropertyType | "All";
  minBeds?: number;
  maxBeds?: number;
  minPrice?: number;
  maxPrice?: number;
  tenure?: Tenure | "All";
  status?: ListingStatus | "All";
  /** Only return listings at or above this band (A is best). */
  minEcoRating?: EcoRating;
  query?: string;
}

export interface ProfessionalFilters {
  discipline?: Discipline | "All";
  region?: Region | "All";
  verifiedOnly?: boolean;
  query?: string;
}
