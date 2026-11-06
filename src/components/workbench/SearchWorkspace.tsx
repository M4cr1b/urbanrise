"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  RotateCcw,
  Search,
  Image as ImageIcon,
  Home,
  Layers,
  FileText,
  Leaf as LeafIcon,
  Heart,
  SlidersHorizontal,
  BedDouble,
  Bath,
  Ruler,
  Building2,
} from "lucide-react";
import { PropertySearchField } from "@/components/search/PropertySearchField";
import { EcoBadge } from "@/components/ui/Badges";
import { formatCedi, formatSqm, pricePerSqm } from "@/lib/format";
import type { EcoRating, Property } from "@/lib/types";
import { FEATURED_PROPERTY_IDS } from "@/lib/data/properties";
import { FilterChip } from "./FilterChip";
import { MobileSheet } from "@/components/ui/MobileSheet";

const TYPES = ["All", "Apartment", "Compound House", "Mansion", "Townhouse", "Duplex", "Villa", "Bungalow"];
const STYLES = ["All", "Detached", "Semi-Detached"];
const STOREYS = ["All", "Single Storey", "Multi Storey"];
const TENURES = ["All", "Freehold", "Leasehold"];
const STATUSES = ["All", "Available", "Under Offer", "Sold"];
const ECO = ["All", "A", "B", "C", "D", "E", "F", "G"];

interface Filters {
  q: string;
  type: string;
  style: string;
  storey: string;
  tenure: string;
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
  storey: "All",
  tenure: "All",
  status: "All",
  eco: "All",
  minBeds: "",
  maxBeds: "",
  minPrice: "",
  maxPrice: "",
};

function buildFiltersFromParams(params: URLSearchParams): Filters {
  const q = params.get("q") || "";
  const type = params.get("type") || "All";
  const style = params.get("style") || "All";
  const storey = params.get("storey") || "All";
  const tenure = params.get("tenure") || "All";
  const status = params.get("status") || "All";
  const eco = params.get("eco") || "All";
  const minBeds = params.get("minBeds") || "";
  const maxBeds = params.get("maxBeds") || "";
  const minPrice = params.get("minPrice") || "";
  const maxPrice = params.get("maxPrice") || "";

  const validTypes = TYPES.includes(type as typeof TYPES[number]) ? type : "All";
  const validStyle = STYLES.includes(style as typeof STYLES[number]) ? style : "All";
  const validStorey = STOREYS.includes(storey as typeof STOREYS[number]) ? storey : "All";
  const validTenure = TENURES.includes(tenure as typeof TENURES[number]) ? tenure : "All";
  const validStatus = STATUSES.includes(status as typeof STATUSES[number]) ? status : "All";
  const validEco = ECO.includes(eco as typeof ECO[number]) ? eco : "All";

  return {
    q,
    type: validTypes,
    style: validStyle,
    storey: validStorey,
    tenure: validTenure,
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
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Icon className="size-3.5 text-primary" aria-hidden />
        <h3 className="font-data text-data-xs font-semibold text-on-surface uppercase tracking-wide">
          {label}
        </h3>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            aria-pressed={value === opt}
            className={`rounded-sm border px-2 py-1 font-data text-data-xs transition-colors ${
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
  if (f.storey !== "All") count++;
  if (f.tenure !== "All") count++;
  if (f.status !== "All") count++;
  if (f.eco !== "All") count++;
  if (f.minBeds) count++;
  if (f.maxBeds) count++;
  if (f.minPrice) count++;
  if (f.maxPrice) count++;
  return count;
}

function getUniqueAddresses(properties: Property[]): string[] {
  const addresses = [...new Set(properties.map(p => p.address))].sort();
  return addresses;
}

export function SearchWorkspace({ properties }: { properties: Property[] }) {
  const searchParams = useSearchParams();
  const [f, setF] = useState<Filters>(() => buildFiltersFromParams(searchParams));
  const [showAll, setShowAll] = useState(false);
  const [openChip, setOpenChip] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const mobileFiltersButtonRef = useRef<HTMLButtonElement>(null);

  const set = <K extends keyof Filters>(key: K, v: Filters[K]) =>
    setF((prev) => ({ ...prev, [key]: v }));

  const addresses = getUniqueAddresses(properties);

  const results = useMemo(() => {
    if (showAll) {
      return [...properties].sort((a, b) => b.askingPrice - a.askingPrice);
    }

    const ecoCeiling = f.eco === "All" ? null : ECO_ORDER.indexOf(f.eco as EcoRating);

    return properties.filter((p) => {
      if (f.type !== "All" && p.type !== f.type) return false;
      if (f.style !== "All" && p.style !== f.style) return false;
      if (f.storey !== "All" && p.storey !== f.storey) return false;

      if (f.tenure === "Freehold" && p.tenure !== "Freehold") return false;
      if (f.tenure === "Leasehold" && !p.tenure.startsWith("Leasehold")) return false;
      if (f.status !== "All" && p.status !== f.status) return false;
      if (ecoCeiling != null && ECO_ORDER.indexOf(p.ecoRating) > ecoCeiling)
        return false;
      if (f.minBeds && p.bedrooms < Number(f.minBeds)) return false;
      if (f.maxBeds && p.bedrooms > Number(f.maxBeds)) return false;
      if (f.minPrice && p.askingPrice < Number(f.minPrice)) return false;
      if (f.maxPrice && p.askingPrice > Number(f.maxPrice)) return false;
      if (f.q) {
        const hay = `${p.address} ${p.district} ${p.region}`.toLowerCase();
        if (!hay.includes(f.q.toLowerCase())) return false;
      }
      return true;
    });
  }, [properties, f, showAll]);

  const activeFilterCount = countActiveFilters(f);

  const getTenureDisplayValue = () => {
    if (f.tenure === "All") return "All";
    if (f.tenure === "Freehold") return "Freehold";
    if (f.tenure === "Leasehold") return "Leasehold";
    return "All";
  };

  return (
    <div className="flex min-h-full min-w-0 flex-col md:h-full">
      <MobileSheet open={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)} title="Property filters" returnFocusRef={mobileFiltersButtonRef}
        footer={<div className="flex items-center gap-3">
          <button type="button" onClick={() => { setF(EMPTY); setShowAll(false); }} className="min-h-12 rounded-md border border-outline-variant px-4 text-sm font-semibold text-primary">Reset filters</button>
          <button type="button" onClick={() => setMobileFiltersOpen(false)} className="min-h-12 min-w-0 flex-1 rounded-md bg-primary px-4 text-sm font-semibold text-on-primary">Show {results.length} {results.length === 1 ? "property" : "properties"}</button>
        </div>}>
        <div className="space-y-6">
          {([
            { key: "type", label: "Property type", icon: Home, options: TYPES },
            { key: "style", label: "Property style", icon: Layers, options: STYLES },
            { key: "storey", label: "Storey", icon: Building2, options: STOREYS },
            { key: "tenure", label: "Tenure", icon: FileText, options: TENURES },
            { key: "eco", label: "Eco rating", icon: LeafIcon, options: ECO },
            { key: "status", label: "Status", icon: Heart, options: STATUSES },
          ] as const).map(group => <FilterGroup key={group.key} label={group.label} icon={group.icon} options={group.options} value={f[group.key]} onChange={value => { set(group.key, value); setShowAll(false); }} />)}
          <RangeFilters filters={f} onChange={(key, value) => { set(key, value); setShowAll(false); }} />
        </div>
      </MobileSheet>
      {/* --- Search and filter bar -------------------------------------------------------- */}
      <div className="search-toolbar shrink-0 border-b border-outline-variant bg-surface-container-lowest p-4">
        <div className="flex flex-col gap-3">
          {/* Search row */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-0 basis-full md:flex-1 md:basis-0">
              <PropertySearchField
                properties={properties}
                value={f.q}
                onChange={(v) => set("q", v)}
                placeholder="Search by address or district…"
                inputClassName="w-full rounded-md border border-outline-variant bg-surface py-2 pl-10 pr-10 text-body-md outline-none focus:border-tertiary-container focus:ring-2 focus:ring-tertiary-container"
                wrapperClassName="w-full"
                icon={<Search className="size-4" aria-hidden />}
                onViewAll={(q) => {
                  set("q", q);
                  setShowAll(!q.trim());
                }}
                onSubmit={(q) => { set("q", q); setShowAll(false); }}
              />
            </div>
            <button ref={mobileFiltersButtonRef} type="button" onClick={() => { setOpenChip(null); setMobileFiltersOpen(true); }}
              className="flex min-h-11 items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-on-primary md:hidden">
              <SlidersHorizontal className="size-4" aria-hidden /> Filters
              {activeFilterCount > 0 && <span className="rounded-full bg-white/20 px-1.5 text-xs">{activeFilterCount}</span>}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAll(!showAll);
                if (!showAll) setF(EMPTY);
              }}
              className={`flex min-h-11 items-center gap-1.5 rounded-md border px-2.5 py-2 text-sm transition-colors whitespace-nowrap md:gap-2 md:px-3 md:font-data md:text-data-sm ${
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
                setOpenChip(null);
              }}
              className="ml-auto flex min-h-11 items-center gap-1.5 rounded-md border border-outline-variant px-2.5 py-2 text-sm text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors whitespace-nowrap md:ml-0 md:gap-2 md:px-3 md:font-data md:text-data-sm"
            >
              <RotateCcw className="size-4" aria-hidden />
              Reset
              {activeFilterCount > 0 && (
                <span className="ml-1 hidden size-5 items-center justify-center rounded-full bg-primary/20 text-primary text-data-xs font-semibold md:inline-flex">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Filter chip bar */}
          <div className="search-filter-bar hidden flex-wrap items-center gap-2 border p-3 md:flex">
            <FilterChip
              label="Type"
              icon={Home}
              value={f.type}
              isOpen={openChip === "type"}
              onToggle={() => setOpenChip(openChip === "type" ? null : "type")}
            >
              <FilterGroup
                label="Property type"
                icon={Home}
                options={TYPES}
                value={f.type}
                onChange={(v) => {
                  set("type", v);
                  setOpenChip(null);
                }}
              />
            </FilterChip>

            <FilterChip
              label="Style"
              icon={Layers}
              value={f.style}
              isOpen={openChip === "style"}
              onToggle={() => setOpenChip(openChip === "style" ? null : "style")}
            >
              <FilterGroup
                label="Property style"
                icon={Layers}
                options={STYLES}
                value={f.style}
                onChange={(v) => {
                  set("style", v);
                  setOpenChip(null);
                }}
              />
            </FilterChip>

            <FilterChip
              label="Storey"
              icon={Building2}
              value={f.storey}
              isOpen={openChip === "storey"}
              onToggle={() => setOpenChip(openChip === "storey" ? null : "storey")}
            >
              <FilterGroup
                label="Storey"
                icon={Building2}
                options={STOREYS}
                value={f.storey}
                onChange={(v) => {
                  set("storey", v);
                  setOpenChip(null);
                }}
              />
            </FilterChip>

            <FilterChip
              label="Tenure"
              icon={FileText}
              value={getTenureDisplayValue()}
              isOpen={openChip === "tenure"}
              onToggle={() => setOpenChip(openChip === "tenure" ? null : "tenure")}
            >
              <FilterGroup
                label="Tenure"
                icon={FileText}
                options={TENURES}
                value={f.tenure}
                onChange={(v) => {
                  set("tenure", v);
                  setOpenChip(null);
                }}
              />
            </FilterChip>

            <FilterChip
              label="Eco"
              icon={LeafIcon}
              value={f.eco}
              isOpen={openChip === "eco"}
              onToggle={() => setOpenChip(openChip === "eco" ? null : "eco")}
            >
              <FilterGroup
                label="Eco rating"
                icon={LeafIcon}
                options={ECO}
                value={f.eco}
                onChange={(v) => {
                  set("eco", v);
                  setOpenChip(null);
                }}
              />
            </FilterChip>

            <FilterChip
              label="Status"
              icon={Heart}
              value={f.status}
              isOpen={openChip === "status"}
              onToggle={() => setOpenChip(openChip === "status" ? null : "status")}
            >
              <FilterGroup
                label="Status"
                icon={Heart}
                options={STATUSES}
                value={f.status}
                onChange={(v) => {
                  set("status", v);
                  setOpenChip(null);
                }}
              />
            </FilterChip>

            <FilterChip
              label="Beds & price"
              icon={Home}
              value=""
              isOpen={openChip === "beds"}
              onToggle={() => setOpenChip(openChip === "beds" ? null : "beds")}
            >
              <div className="space-y-3">
                <div>
                  <label className="text-data-xs text-on-surface-variant">Beds from</label>
                  <input
                    type="number"
                    min="0"
                    value={f.minBeds}
                    onChange={(e) => set("minBeds", e.target.value)}
                    placeholder="e.g. 2"
                    className="mt-1 w-full rounded-sm border border-outline-variant bg-surface px-2 py-1.5 text-data-sm outline-none focus:border-tertiary-container focus:ring-2 focus:ring-tertiary-container"
                  />
                </div>
                <div>
                  <label className="text-data-xs text-on-surface-variant">to</label>
                  <input
                    type="number"
                    min="0"
                    value={f.maxBeds}
                    onChange={(e) => set("maxBeds", e.target.value)}
                    placeholder="e.g. 5"
                    className="mt-1 w-full rounded-sm border border-outline-variant bg-surface px-2 py-1.5 text-data-sm outline-none focus:border-tertiary-container focus:ring-2 focus:ring-tertiary-container"
                  />
                </div>
                <div>
                  <label className="text-data-xs text-on-surface-variant">₵ from</label>
                  <input
                    type="number"
                    min="0"
                    value={f.minPrice}
                    onChange={(e) => set("minPrice", e.target.value)}
                    placeholder="0"
                    className="mt-1 w-full rounded-sm border border-outline-variant bg-surface px-2 py-1.5 text-data-sm outline-none focus:border-tertiary-container focus:ring-2 focus:ring-tertiary-container"
                  />
                </div>
                <div>
                  <label className="text-data-xs text-on-surface-variant">to</label>
                  <input
                    type="number"
                    min="0"
                    value={f.maxPrice}
                    onChange={(e) => set("maxPrice", e.target.value)}
                    placeholder="Any"
                    className="mt-1 w-full rounded-sm border border-outline-variant bg-surface px-2 py-1.5 text-data-sm outline-none focus:border-tertiary-container focus:ring-2 focus:ring-tertiary-container"
                  />
                </div>
              </div>
            </FilterChip>

            <span className="ml-auto text-data-sm text-on-surface-variant">
              <strong className="text-on-surface">{results.length}</strong>{" "}
              {results.length === 1 ? "property" : "properties"}{" "}
              {showAll ? "in system" : "found"}
            </span>
          </div>

          {/* Quick browse */}
          {!showAll && (
            <div aria-label="Quick browse locations" className="quick-locations flex min-w-0 gap-2 overflow-x-auto overscroll-x-contain pb-1 md:flex-wrap">
              <span className="hidden font-data text-data-sm text-on-surface-variant md:inline-block">
                Quick browse:
              </span>
              {addresses.slice(0, 6).map((address) => (
                <button
                  key={address}
                  type="button"
                  onClick={() => {
                    set("q", address);
                    setShowAll(false);
                  }}
                  className="min-h-11 shrink-0 rounded-full border border-secondary/50 bg-secondary/10 px-3 py-1 font-data text-data-sm text-secondary hover:bg-secondary/20 transition-colors"
                >
                  {address}
                </button>
              ))}
            </div>
          )}
          <p aria-live="polite" className="text-sm text-on-surface-variant md:hidden"><strong className="text-on-surface">{results.length}</strong> {results.length === 1 ? "property" : "properties"} {showAll ? "in system" : "found"}</p>
        </div>
      </div>

      {/* --- Results Grid -------------------------------------------------------- */}
      <div className="search-results flex-1 md:min-h-0 md:overflow-auto scrollbar-slim">
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <Heart className="size-12 mb-4 text-outline-variant opacity-50" aria-hidden />
            <p className="text-center text-body-md text-on-surface-variant">
              No properties match these filters. Try widening the search.
            </p>
          </div>
        ) : (
          <div className="grid min-w-0 grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:gap-5 md:p-5 xl:grid-cols-3">
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

function RangeFilters({ filters, onChange }: { filters: Filters; onChange: (key: "minBeds" | "maxBeds" | "minPrice" | "maxPrice", value: string) => void }) {
  return <fieldset className="grid min-w-0 grid-cols-2 gap-3">
    <legend className="mb-3 text-sm font-semibold text-primary">Bedrooms &amp; price</legend>
    {([
      ["minBeds", "Minimum bedrooms", "Any"], ["maxBeds", "Maximum bedrooms", "Any"],
      ["minPrice", "Minimum price (GHS)", "0"], ["maxPrice", "Maximum price (GHS)", "Any"],
    ] as const).map(([key, label, placeholder]) => <label key={key} className="min-w-0 text-xs text-on-surface-variant">{label}
      <input type="number" inputMode="numeric" min="0" value={filters[key]} onChange={event => onChange(key, event.target.value)} placeholder={placeholder} className="mt-1 min-h-11 w-full min-w-0 rounded-md border border-outline-variant bg-surface px-3 py-2 text-on-surface" />
    </label>)}
  </fieldset>;
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
      className="surface-card group flex flex-col overflow-hidden text-left"
    >
      {/* Fill the thumbnail edge to edge with the selected exterior. */}
      <div className="relative aspect-4/3 w-full flex-shrink-0 overflow-hidden bg-surface">
        <Image
          src={p.images[0]}
          alt={`${p.type} at ${p.address}`}
          fill
          sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
          quality={90}
          className="object-cover"
          priority={false}
        />

        {/* Badge overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <EcoBadge rating={p.ecoRating} className="absolute left-3 top-3" />

        {/* Featured ribbon */}
        {isFeatured && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 font-data text-label-caps text-on-primary shadow-sm">
            <Heart className="size-3" aria-hidden />
            Featured
          </span>
        )}

        {/* Image count */}
        {p.images.length > 1 && (
          <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-sm bg-black/70 px-2 py-1 font-data text-[10px] text-white">
            <ImageIcon className="size-3" aria-hidden />
            {p.images.length}
          </span>
        )}
      </div>

      {/* Card body - compact */}
      <div className="property-card-body relative flex flex-1 flex-col">
        {/* Price row */}
        <div className="property-card-price mb-1 text-primary">
          {formatCedi(p.askingPrice)}
        </div>
        {rate && (
          <div className="mb-2 font-data text-data-xs text-on-surface-variant">
            ₵{rate.toLocaleString("en-GH")}/sqm
          </div>
        )}

        {/* Address */}
        <div className="property-card-address mb-3 line-clamp-2 text-on-surface">
          {p.address}
        </div>

        {/* Quick facts row */}
        <div className="mb-3 flex items-center gap-3 border-t border-outline-variant/20 pt-3 font-data text-data-xs text-on-surface-variant">
          <span className="flex items-center gap-1">
            <BedDouble className="size-3.5 text-secondary" aria-hidden /> {p.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="size-3.5 text-secondary" aria-hidden /> {p.bathrooms}
          </span>
          <span className="flex items-center gap-1">
            <Ruler className="size-3.5 text-secondary" aria-hidden /> {formatSqm(p.floorAreaSqm)}
          </span>
        </div>

        {/* Status and tenure row */}
        <div className="mb-2 flex flex-wrap items-center gap-2 font-data text-data-xs">
          <span className="property-card-status inline-flex items-center">
            {p.status}
          </span>
          <span className="text-on-surface-variant">{p.tenure}</span>
        </div>

        {/* Location info */}
        <div className="mb-3 border-t border-outline-variant/20 pt-2 font-data text-data-xs">
          <div className="text-on-surface-variant">
            <span className="font-semibold text-on-surface text-data-sm">
              {p.address}
            </span>{" "}
            • {p.district}
          </div>
        </div>

        {/* Key specs grid - compact */}
        <div className="grid grid-cols-2 gap-2 border-t border-outline-variant/20 pt-2 font-data text-data-xs text-on-surface-variant">
          <div>
            <div className="text-on-surface-variant">Type</div>
            <div className="font-semibold text-on-surface text-data-sm">{p.type}</div>
          </div>
          <div>
            <div className="text-on-surface-variant">Style</div>
            <div className="font-semibold text-on-surface text-data-sm">{p.style}</div>
          </div>
        </div>

        {/* Agent info if available */}
        {p.agent && (
          <div className="mt-auto border-t border-outline-variant/20 pt-2">
            <div className="font-data text-data-xs text-on-surface-variant mb-1">
              Agent
            </div>
            <div className="font-data text-data-xs">
              <div className="font-semibold text-on-surface">{p.agent.name}</div>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
