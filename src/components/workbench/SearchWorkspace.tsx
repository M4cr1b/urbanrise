"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  RotateCcw,
  Search,
  X,
  Image as ImageIcon,
  Home,
  Layers,
  FileText,
  Leaf as LeafIcon,
  Heart,
  Eye,
} from "lucide-react";
import { PropertySearchField } from "@/components/search/PropertySearchField";
import { EcoBadge, StatusChip, TitleStatusText, VerifiedBadge } from "@/components/ui/Badges";
import { formatCedi, formatSqm, pricePerSqm } from "@/lib/format";
import { BedDouble, Bath, Ruler } from "lucide-react";
import type { EcoRating, Property } from "@/lib/types";

/**
 * The search module.
 *
 * Filters are segmented button rows rather than dropdowns — the reference
 * tool's signature, and genuinely faster to operate when you are sweeping a
 * market rather than picking one known value.
 */

const TYPES = ["All", "House", "Apartment", "Townhouse", "Compound House", "Land"];
const STYLES = ["All", "Detached", "Semi-Detached", "Terrace", "Mid Terrace", "End Terrace", "Storey", "Bungalow"];
const TENURES = ["All", "Freehold", "Leasehold 99yr", "Leasehold 50yr", "Customary"];
const TITLES = ["All", "Registered", "Pending", "Unregistered"];
const STATUSES = ["All", "Available", "Under Offer", "Sold"];
const ECO = ["All", "A", "B", "C", "D"];

// Imported from the seed data to tag featured cards.
const FEATURED_PROPERTY_IDS = ["michelle-camp-gbetsile", "east-legon-hills", "fairhaven-east-legon"];

interface Filters {
  q: string;
  type: string;
  style: string;
  tenure: string;
  title: string;
  status: string;
  eco: string;
  minBeds: string;
  maxBeds: string;
  minPrice: string;
  maxPrice: string;
}

const EMPTY: Filters = {
  q: "",
  type: "All",
  style: "All",
  tenure: "All",
  title: "All",
  status: "All",
  eco: "All",
  minBeds: "",
  maxBeds: "",
  minPrice: "",
  maxPrice: "",
};

/**
 * Seed filters from URL search params (fix for the bug where homepage
 * search form submit params are silently ignored).
 */
function buildFiltersFromParams(params: URLSearchParams): Filters {
  const q = params.get("q") || "";
  const type = params.get("type") || "All";
  const style = params.get("style") || "All";
  const tenure = params.get("tenure") || "All";
  const title = params.get("title") || "All";
  const status = params.get("status") || "All";
  const eco = params.get("eco") || "All";
  const minBeds = params.get("minBeds") || "";
  const maxBeds = params.get("maxBeds") || "";
  const minPrice = params.get("minPrice") || "";
  const maxPrice = params.get("maxPrice") || "";

  // Validate type, tenure, title, status, eco against known options
  const validTypes = TYPES.includes(type as typeof TYPES[number])
    ? type
    : "All";
  const validTenure = TENURES.includes(tenure as typeof TENURES[number])
    ? tenure
    : "All";
  const validTitle = TITLES.includes(title as typeof TITLES[number])
    ? title
    : "All";
  const validStatus = STATUSES.includes(status as typeof STATUSES[number])
    ? status
    : "All";
  const validEco = ECO.includes(eco as typeof ECO[number]) ? eco : "All";

  return {
    q,
    type: validTypes,
    style,
    tenure: validTenure,
    title: validTitle,
    status: validStatus,
    eco: validEco,
    minBeds,
    maxBeds,
    minPrice,
    maxPrice,
  };
}

function FilterGroup({
  label,
  icon: Icon,
  options,
  value,
  onChange,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="size-4 text-primary" aria-hidden />
        <h3 className="font-data text-data-sm font-semibold text-on-surface">
          {label}
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            aria-pressed={value === opt}
            className={`rounded-sm border px-3 py-1.5 font-data text-data-sm transition-colors ${
              value === opt
                ? "border-primary bg-primary text-on-primary"
                : "border-outline-variant bg-surface text-on-surface-variant hover:border-primary/50 hover:text-primary"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

const ECO_ORDER: EcoRating[] = ["A", "B", "C", "D", "E", "F", "G"];

function countActiveFilters(f: Filters): number {
  let count = 0;
  if (f.q) count++;
  if (f.type !== "All") count++;
  if (f.style !== "All") count++;
  if (f.tenure !== "All") count++;
  if (f.title !== "All") count++;
  if (f.status !== "All") count++;
  if (f.eco !== "All") count++;
  if (f.minBeds) count++;
  if (f.maxBeds) count++;
  if (f.minPrice) count++;
  if (f.maxPrice) count++;
  return count;
}

function getUniqueLocalities(properties: Property[]): string[] {
  const localities = [...new Set(properties.map(p => p.locality))].sort();
  return localities;
}

export function SearchWorkspace({ properties }: { properties: Property[] }) {
  const searchParams = useSearchParams();
  const [f, setF] = useState<Filters>(() =>
    buildFiltersFromParams(searchParams)
  );
  const [showAll, setShowAll] = useState(false);
  const set = <K extends keyof Filters>(key: K, v: Filters[K]) =>
    setF((prev) => ({ ...prev, [key]: v }));

  const localities = getUniqueLocalities(properties);

  const results = useMemo(() => {
    if (showAll) {
      return properties.sort((a, b) => b.askingPrice - a.askingPrice);
    }

    const ecoCeiling = f.eco === "All" ? null : ECO_ORDER.indexOf(f.eco as EcoRating);

    return properties.filter((p) => {
      if (f.type !== "All" && p.type !== f.type) return false;
      if (f.style !== "All" && p.style !== f.style) return false;
      if (f.tenure !== "All" && p.tenure !== f.tenure) return false;
      if (f.title !== "All" && p.titleStatus !== f.title) return false;
      if (f.status !== "All" && p.status !== f.status) return false;
      if (ecoCeiling != null && ECO_ORDER.indexOf(p.ecoRating) > ecoCeiling)
        return false;
      if (f.minBeds && p.bedrooms < Number(f.minBeds)) return false;
      if (f.maxBeds && p.bedrooms > Number(f.maxBeds)) return false;
      if (f.minPrice && p.askingPrice < Number(f.minPrice)) return false;
      if (f.maxPrice && p.askingPrice > Number(f.maxPrice)) return false;
      if (f.q) {
        const hay = `${p.address} ${p.locality} ${p.district} ${p.region}`.toLowerCase();
        if (!hay.includes(f.q.toLowerCase())) return false;
      }
      return true;
    });
  }, [properties, f, showAll]);

  const activeFilterCount = countActiveFilters(f);

  return (
    <div className="flex h-full flex-col">
      {/* --- Filters -------------------------------------------------------- */}
      <div className="shrink-0 border-b border-outline-variant bg-surface-container-lowest p-6">
        {/* Search bar with affordances */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-start gap-3">
            <div className="relative flex-1 min-w-64">
              <PropertySearchField
                properties={properties}
                value={f.q}
                onChange={(v) => set("q", v)}
                placeholder="Search by address, locality or district…"
                inputClassName="w-full rounded-md border border-outline-variant bg-surface py-2.5 pl-10 pr-10 text-body-md outline-none focus:border-tertiary-container focus:ring-2 focus:ring-tertiary-container"
                wrapperClassName="w-full"
                icon={<Search className="size-4" aria-hidden />}
                onViewAll={(q) => {
                  set("q", q);
                  setShowAll(true);
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setShowAll(!showAll);
                if (!showAll) setF(EMPTY);
              }}
              className={`flex items-center gap-2 rounded-md border px-4 py-2.5 font-data text-data-sm transition-colors whitespace-nowrap ${
                showAll
                  ? "border-primary bg-primary/10 text-primary hover:bg-primary/20"
                  : "border-outline-variant text-on-surface-variant hover:border-primary/50 hover:text-primary"
              }`}
            >
              <Heart className="size-4" aria-hidden />
              {showAll ? "Filtered" : "View All"}
            </button>
            <button
              type="button"
              onClick={() => {
                setF(EMPTY);
                setShowAll(false);
              }}
              className="flex items-center gap-2 rounded-md border border-outline-variant px-4 py-2.5 font-data text-data-sm text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors whitespace-nowrap"
            >
              <RotateCcw className="size-4" aria-hidden />
              Reset
              {activeFilterCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-data-xs font-semibold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Quick locality filters */}
          {!showAll && (
            <div className="flex flex-wrap gap-2">
              <span className="inline-block font-data text-data-sm text-on-surface-variant">Quick browse:</span>
              {localities.slice(0, 8).map((locality) => (
                <button
                  key={locality}
                  type="button"
                  onClick={() => {
                    set("q", locality);
                    setShowAll(false);
                  }}
                  className="rounded-full border border-secondary/50 bg-secondary/10 px-3 py-1 font-data text-data-sm text-secondary hover:bg-secondary/20 transition-colors"
                >
                  {locality}
                </button>
              ))}
            </div>
          )}

          {/* Live result count visibility indicator */}
          <div className="flex items-center justify-between">
            <span className="font-data text-data-sm text-on-surface-variant">
              <strong className="text-on-surface text-data-md font-semibold">{results.length}</strong>{" "}
              {results.length === 1 ? "property" : "properties"}{" "}
              {showAll ? "in system" : "found"}
            </span>
            {showAll && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-data text-data-sm text-primary">
                <Eye className="size-3.5" aria-hidden />
                Viewing all
              </span>
            )}
          </div>
        </div>

        {/* Grouped filter grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FilterGroup label="Property type" icon={Home} options={TYPES} value={f.type} onChange={(v) => set("type", v)} />
          <FilterGroup label="Property style" icon={Layers} options={STYLES} value={f.style} onChange={(v) => set("style", v)} />
          <FilterGroup label="Tenure" icon={FileText} options={TENURES} value={f.tenure} onChange={(v) => set("tenure", v)} />
          <FilterGroup label="Title status" icon={FileText} options={TITLES} value={f.title} onChange={(v) => set("title", v)} />
          <FilterGroup label="Eco rating" icon={LeafIcon} options={ECO} value={f.eco} onChange={(v) => set("eco", v)} />
          <FilterGroup label="Status" icon={Heart} options={STATUSES} value={f.status} onChange={(v) => set("status", v)} />
        </div>

        {/* Bedrooms & price range */}
        <div className="mt-4 rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-4">
          <h3 className="mb-3 font-data text-data-sm font-semibold text-on-surface">
            Bedrooms &amp; price
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <NumField label="Beds from" value={f.minBeds} onChange={(v) => set("minBeds", v)} />
            <NumField label="to" value={f.maxBeds} onChange={(v) => set("maxBeds", v)} />
            <NumField label="₵ from" value={f.minPrice} onChange={(v) => set("minPrice", v)} />
            <NumField label="to" value={f.maxPrice} onChange={(v) => set("maxPrice", v)} />
          </div>
        </div>
      </div>

      {/* --- Results Grid -------------------------------------------------------- */}
      <div className="min-h-0 flex-1 overflow-auto scrollbar-slim bg-surface-container">
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <Heart className="size-12 mb-4 text-outline-variant opacity-50" aria-hidden />
            <p className="text-center text-body-md text-on-surface-variant">
              No properties match these filters. Try widening the search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 xl:grid-cols-3">
            {[...results]
              .sort((a, b) => b.askingPrice - a.askingPrice)
              .map((p) => (
                <PropertyResultCard
                  key={p.id}
                  property={p}
                  isFeatured={FEATURED_PROPERTY_IDS.includes(p.id)}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-data text-data-sm text-on-surface-variant">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-sm border border-outline-variant bg-surface px-2 py-1.5 text-right text-body-sm outline-none focus:border-tertiary-container focus:ring-2 focus:ring-tertiary-container"
      />
    </label>
  );
}

function PropertyResultCard({
  property: p,
  isFeatured,
}: {
  property: Property;
  isFeatured: boolean;
}) {
  const rate = pricePerSqm(p.askingPrice, p.floorAreaSqm);

  return (
    <Link
      href={`/property/${p.id}`}
      className="group overflow-hidden rounded-xl border border-primary/10 bg-surface-container-lowest transition-shadow hover:shadow-[var(--shadow-level-2)]"
    >
      {/* Image container with badges */}
      <div className="relative h-64 overflow-hidden">
        <Image
          src={p.images[0]}
          alt={`${p.type} at ${p.address}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badge overlays */}
        <EcoBadge rating={p.ecoRating} className="absolute left-4 top-4" />

        {p.verifiedBy && (
          <VerifiedBadge className="absolute bottom-4 left-4" />
        )}

        {/* Featured ribbon */}
        {isFeatured && (
          <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 font-data text-label-caps text-on-primary shadow-sm">
            <Heart className="size-3.5" aria-hidden />
            Featured
          </span>
        )}

        {/* Image count */}
        {p.images.length > 1 && (
          <span className="absolute bottom-4 right-4 flex items-center gap-1 rounded-sm bg-black/65 px-1.5 py-0.5 font-data text-[11px] text-white">
            <ImageIcon className="size-3" aria-hidden />
            {p.images.length}
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="relative p-6">
        <div className="topo-bg pointer-events-none absolute bottom-0 right-0 size-24 opacity-30" />

        {/* Price row */}
        <div className="mb-1 font-data text-data-lg text-primary">
          {formatCedi(p.askingPrice)}
        </div>
        {rate && (
          <div className="mb-4 font-data text-data-sm text-on-surface-variant">
            ₵{rate.toLocaleString("en-GH")}/sqm
          </div>
        )}

        {/* Address */}
        <div className="mb-4 text-body-md font-medium text-on-surface">
          {p.address}
        </div>

        {/* Quick facts row */}
        <div className="mb-4 flex items-center gap-4 border-t border-outline-variant/30 pt-4 font-data text-data-sm text-on-surface-variant">
          <span className="flex items-center gap-1">
            <BedDouble className="size-4 text-secondary" aria-hidden /> {p.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="size-4 text-secondary" aria-hidden /> {p.bathrooms}
          </span>
          <span className="flex items-center gap-1">
            <Ruler className="size-4 text-secondary" aria-hidden /> {formatSqm(p.floorAreaSqm)}
          </span>
        </div>

        {/* Secondary details row 1 */}
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 font-data text-data-sm">
          <StatusChip status={p.status} />
          <span className="text-on-surface-variant">
            {p.tenure}
          </span>
          <TitleStatusText status={p.titleStatus} />
        </div>

        {/* Location info */}
        <div className="mb-3 border-t border-outline-variant/30 pt-3 font-data text-data-sm">
          <div className="text-on-surface-variant">
            <span className="font-semibold text-on-surface">{p.locality}</span> • {p.district}
          </div>
          <div className="text-on-surface-variant text-data-xs mt-1">
            {p.address}
          </div>
        </div>

        {/* Key specs in compact format */}
        <div className="grid grid-cols-2 gap-2 border-t border-outline-variant/30 pt-3 font-data text-data-sm text-on-surface-variant">
          <div>
            <div className="text-data-xs text-on-surface-variant">Type</div>
            <div className="font-semibold text-on-surface">{p.type}</div>
          </div>
          <div>
            <div className="text-data-xs text-on-surface-variant">Style</div>
            <div className="font-semibold text-on-surface">{p.style}</div>
          </div>
          <div>
            <div className="text-data-xs text-on-surface-variant">Plot</div>
            <div className="font-semibold text-on-surface">{formatSqm(p.plotAreaSqm)}</div>
          </div>
          <div>
            <div className="text-data-xs text-on-surface-variant">Year</div>
            <div className="font-semibold text-on-surface">{p.yearBuilt}</div>
          </div>
        </div>

        {/* Agent info if available */}
        {p.agent && (
          <div className="mt-3 border-t border-outline-variant/30 pt-3">
            <div className="font-data text-data-xs text-on-surface-variant mb-1">
              Agent
            </div>
            <div className="font-data text-data-sm">
              <div className="font-semibold text-on-surface">{p.agent.name}</div>
              <div className="text-on-surface-variant text-data-xs">{p.agent.firm}</div>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
