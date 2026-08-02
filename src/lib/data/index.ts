import { isSupabaseConfigured } from "@/lib/supabase/config";
import * as seed from "./seed-source";
import * as live from "./supabase-source";

/**
 * The data-access seam.
 *
 * One switch, read once: with Supabase credentials present the app talks to the
 * database; without them it runs on the seeded Ghanaian dataset. Both modules
 * satisfy the same contract, so every screen is written against one shape and
 * none of them know which source answered.
 *
 * This is what lets the UI be finished before the credentials arrive.
 */

const source = isSupabaseConfigured() ? live : seed;

export type { PropertyFilters, ProfessionalFilters } from "./contract";

export const getProperties = source.getProperties;
export const getPropertyById = source.getPropertyById;
export const getFeaturedProperties = source.getFeaturedProperties;
export const searchProperties = source.searchProperties;
export const getLocalities = source.getLocalities;

export const getSubjectProperty = source.getSubjectProperty;
export const getComparables = source.getComparables;

export const getProfessionals = source.getProfessionals;

export const getLocalityMarket = source.getLocalityMarket;
export const getLocalityMarkets = source.getLocalityMarkets;
export const getNationalStats = source.getNationalStats;

export const getMaterials = source.getMaterials;

/** True when the app is reading from Supabase rather than the seeded dataset. */
export const usingLiveData = isSupabaseConfigured();
