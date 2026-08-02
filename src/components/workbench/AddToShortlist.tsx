"use client";

import Link from "next/link";
import { ArrowRight, Check, Plus } from "lucide-react";
import { useShortlist } from "./shortlist-store";

/** Adds a property to the valuation shortlist from its detail page. */
export function AddToShortlist({
  id,
  address,
}: {
  id: string;
  address: string;
}) {
  const { has, toggle, count } = useShortlist();
  const picked = has(id);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => toggle(id)}
        aria-pressed={picked}
        aria-label={
          picked
            ? `Remove ${address} from the valuation shortlist`
            : `Add ${address} to the valuation shortlist`
        }
        className={`btn-leaf flex items-center gap-2 rounded-md px-5 py-2.5 font-data text-data-sm transition-colors ${
          picked
            ? "bg-secondary text-on-secondary"
            : "bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary"
        }`}
      >
        {picked ? (
          <>
            <Check className="size-4" aria-hidden />
            On shortlist
          </>
        ) : (
          <>
            <Plus className="size-4" aria-hidden />
            Add to comparables
          </>
        )}
      </button>

      {count > 0 && (
        <Link
          href="/comparables?stage=shortlist"
          className="flex items-center gap-1.5 font-data text-data-sm text-primary hover:underline"
        >
          {count} shortlisted
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}
