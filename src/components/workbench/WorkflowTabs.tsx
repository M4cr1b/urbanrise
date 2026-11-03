"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
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
  const tabsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const tabs = tabsRef.current;
    const active = tabs?.querySelector<HTMLElement>('[aria-current="page"]');
    if (tabs && active) tabs.scrollLeft = Math.max(0, active.offsetLeft - tabs.clientWidth / 2 + active.offsetWidth / 2);
  }, [current]);

  return (
    <nav ref={tabsRef} aria-label="Valuation workflow" className={`relative min-w-0 basis-full items-center gap-1 overflow-x-auto overscroll-x-contain scrollbar-slim md:flex md:flex-1 md:basis-auto ${inWorkflow ? "flex" : "hidden"}`}>
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
    </nav>
  );
}

export function WorkbenchBrand() {
  return (
    <Link
      href="/"
      className="flex min-h-14 shrink-0 items-center gap-2 font-headline text-xl font-bold text-inverse-on-surface md:pr-4 md:text-headline-md"
    >
      <Leaf className="size-5" aria-hidden />
      UrbanRise
    </Link>
  );
}

export function MobileModuleTitle() {
  const pathname = usePathname();
  const title = pathname.startsWith("/property/") ? "Property details" : ({
    "/search": "Property search", "/comparables": "Valuation", "/market": "Market insights",
    "/professionals": "Professionals", "/green-hub": "Green building",
  } as Record<string, string>)[pathname];
  return <span className="ml-auto min-w-0 text-right text-xs font-medium text-primary-fixed-dim md:hidden">{title}</span>;
}
