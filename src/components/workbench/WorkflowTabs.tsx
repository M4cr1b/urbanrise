"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Leaf } from "lucide-react";
import { useShortlist } from "./shortlist-store";

/**
 * The linear valuation workflow across the dark top bar.
 *
 * Mirrors the reference tool's COMPARABLES → BASKET → ANALYSIS → RATIONALE →
 * VALUATION → SUBMIT, including the count badge that tells you how much
 * evidence you have gathered so far.
 */

export const STAGES = [
  { id: "comparables", label: "Comparables" },
  { id: "shortlist", label: "Shortlist" },
  { id: "analysis", label: "Analysis" },
  { id: "rationale", label: "Rationale" },
  { id: "valuation", label: "Valuation" },
  { id: "submit", label: "Submit" },
] as const;

export type StageId = (typeof STAGES)[number]["id"];

export function WorkflowTabs() {
  const pathname = usePathname();
  const params = useSearchParams();
  const { count } = useShortlist();

  const inWorkflow = pathname.startsWith("/comparables");
  const current = (params.get("stage") ?? "comparables") as StageId;

  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-slim">
      {STAGES.map((stage) => {
        const active = inWorkflow && current === stage.id;
        const href =
          stage.id === "comparables"
            ? "/comparables"
            : `/comparables?stage=${stage.id}`;

        return (
          <Link
            key={stage.id}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-label-caps uppercase transition-colors ${
              active
                ? "border-inverse-on-surface text-inverse-on-surface"
                : "border-transparent text-inverse-on-surface/60 hover:text-inverse-on-surface"
            }`}
          >
            {stage.label}
            {stage.id === "shortlist" && count > 0 && (
              <span className="rounded-sm bg-secondary-container px-1.5 py-px font-data text-[11px] font-semibold text-on-secondary-fixed">
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

export function WorkbenchBrand() {
  return (
    <Link
      href="/"
      className="flex shrink-0 items-center gap-2 pr-4 font-headline text-headline-md font-bold text-inverse-on-surface"
    >
      <Leaf className="size-5" aria-hidden />
      UrbanRise
    </Link>
  );
}
