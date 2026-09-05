"use client";

import { PropertySearchField } from "@/components/search/PropertySearchField";
import type { Comparable } from "@/lib/types";

/**
 * Toolbar above the comparables matrix.
 *
 * Provides a search field to find within the comparables dataset and a "view all"
 * affordance to navigate to the main /search page for a wider property search.
 */
export function ComparablesToolbar({
  comparables,
}: {
  comparables: Comparable[];
}) {
  return (
    <div className="shrink-0 border-b border-outline-variant bg-surface-container-lowest px-6 py-4">
      <div className="mb-4">
        <h3 className="font-headline text-headline-md text-primary">
          Comparable evidence
        </h3>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <PropertySearchField
            properties={comparables}
            value=""
            onChange={() => {}}
            placeholder="Search comparables by address or locality…"
            inputClassName="w-full rounded-md border border-outline-variant bg-surface py-2.5 pl-10 pr-4 text-body-md outline-none focus:border-tertiary-container focus:ring-2 focus:ring-tertiary-container"
            wrapperClassName="w-full"
            viewAllHref={(q) =>
              q
                ? `/search?q=${encodeURIComponent(q)}`
                : "/search"
            }
          />
        </div>

        <div className="whitespace-nowrap text-right font-data text-data-sm text-on-surface-variant">
          <span className="font-semibold text-on-surface">{comparables.length}</span>{" "}
          comparables on file
        </div>
      </div>
    </div>
  );
}
