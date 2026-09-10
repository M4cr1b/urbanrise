import type { Property } from "@/lib/types";

/**
 * Seeded listings for Greater Accra.
 *
 * These stand in for the Notion import until the share links land; the shape is
 * identical to what `scripts/notion-sync.ts` will write to Supabase, so swapping
 * the source is a change to `src/lib/data/index.ts` alone.
 */

export const properties: Property[] = [];

/** The record currently under valuation in the comparables workbench. */
export const SUBJECT_PROPERTY_ID = "";

/** Curated for the landing page's "Featured homes" row — 4 premium properties by value. */
export const FEATURED_PROPERTY_IDS: string[] = [];
