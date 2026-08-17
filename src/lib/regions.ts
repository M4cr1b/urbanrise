import type { Region } from "./types";

/**
 * Which regions the platform currently covers.
 *
 * The project is scoped to Greater Accra, but the data model has always been
 * national and the database still holds records elsewhere. Rather than delete
 * them, everything the interface reads is filtered through this list — so
 * widening coverage later is a one-line change here, not a data recovery
 * exercise and a hunt through every query.
 *
 * Keep this ordered: the first entry is treated as the default for new records
 * and for the region label the interface shows.
 */
export const ACTIVE_REGIONS: Region[] = ["Greater Accra"];

export const PRIMARY_REGION: Region = ACTIVE_REGIONS[0];

/** True when a record falls inside the covered area. */
export function isActiveRegion(region: string | null | undefined): boolean {
  return !!region && (ACTIVE_REGIONS as string[]).includes(region);
}

/**
 * True when the platform covers exactly one region.
 *
 * When it does, printing the region on every card is noise — everything is in
 * Greater Accra, so saying so on each of forty listings tells the reader
 * nothing. The interface uses this to drop the redundant label and to hide the
 * region filter entirely.
 */
export const IS_SINGLE_REGION = ACTIVE_REGIONS.length === 1;
