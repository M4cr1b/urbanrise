import type { Comparable } from "@/lib/types";

/**
 * Comparables are a separate dataset the user supplies directly.
 * Empty until real comparable entries are provided.
 *
 * See conversation history for context on the split between
 * for-sale properties (`properties.ts`) and comparables.
 */

export const comparables: Comparable[] = [];
export const SUBJECT_COMPARABLE_ID: string | null = null;
