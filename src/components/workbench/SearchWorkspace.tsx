"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
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
  Eye,
  BedDouble,
  Bath,
  Ruler,
} from "lucide-react";
import { PropertySearchField } from "@/components/search/PropertySearchField";
import { EcoBadge, VerifiedBadge } from "@/components/ui/Badges";
import { formatCedi, formatSqm, pricePerSqm } from "@/lib/format";
import type { EcoRating, Property } from "@/lib/types";
import { FEATURED_PROPERTY_IDS } from "@/lib/data/properties";
import { FilterChip } from "./FilterChip";
import { LeaseholdYearModal } from "./LeaseholdYearModal";
import { PropertyDetailsModal } from "./PropertyDetailsModal";

const TYPES = ["All", "Apartment", "Mansion"];
const STYLES = ["All", "Detached", "Semi-Detached", "Single Storey", "Multi Storey"];
const TENURES = ["All", "Freehold", "Leasehold"];
const TITLES = ["All", "Registered", "Pending", "Unregistered"];
const STATUSES = ["All", "Available", "Under Offer", "Sold"];
const ECO = ["All", "A", "B", "C", "D"];

interface Filters {
  q: string;
  type: string;
  style: string;
  tenure: string;
  leaseYears: string;
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
  leaseYears: "",
  title: "All",
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
  const tenure = params.get("tenure") || "All";
  const leaseYears = params.get("leaseYears") || "";
  const title = params.get("title") || "All";
  const status = params.get("status") || "All";
  const eco = params.get("eco") || "All";
  const minBeds = params.get("minBeds") || "";
  const maxBeds = params.get("maxBeds") || "";
  const minPrice = params.get("minPrice") || "";
  const maxPrice = params.get("maxPrice") || "";

  const validTypes = TYPES.includes(type as typeof TYPES[number]) ? type : "All";
  const validStyle = STYLES.includes(style as typeof STYLES[number]) ? style : "All";
  const validTenure = TENURES.includes(tenure as typeof TENURES[number]) ? tenure : "All";
  const validTitle = TITLES.includes(title as typeof TITLES[number]) ? title : "All";
  const validStatus = STATUSES.includes(status as typeof STATUSES[number]) ? status : "All";
  const validEco = ECO.includes(eco as typeof ECO[number]) ? eco : "All";

  return {
    q,
    type: validTypes,
    style: validStyle,
    tenure: validTenure,
    leaseYears,
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
  if (f.tenure !== "All") count++;
  if (f.leaseYears) count++;
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
  const [f, setF] = useState<Filters>(() => buildFiltersFromParams(searchParams));
  const [showAll, setShowAll] = useState(false);
  const [openChip, setOpenChip] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [leaseholdModalOpen, setLeaseholdModalOpen] = useState(false);
  const [selectedLeaseYear, setSelectedLeaseYear] = useState<number | null>(
    f.leaseYears ? Number(f.leaseYears) : null
  );

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

      if (f.tenure === "Freehold" && p.tenure !== "Freehold") return false;
      if (f.tenure === "Leasehold") {
        if (!p.tenure.startsWith("Leasehold")) return false;
        if (f.leaseYears && p.leaseYearsRemaining !== Number(f.leaseYears))
          return false;
      }

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

  const getTenureDisplayValue = () => {
    if (f.tenure === "All") return "All";
    if (f.tenure === "Freehold") return "Freehold";
    if (f.tenure === "Leasehold") {
      return f.leaseYears ? `Leasehold · ${f.leaseYears}y` : "Leasehold";
    }
    return "All";
  };

  return (
    <div className="flex h-full flex-col">
      {/* --- Search and filter bar -------------------------------------------------------- */}
      <div className="shrink-0 border-b border-outline-variant bg-surface-container-lowest p-4">
        <div className="flex flex-col gap-3">
          {/* Search row */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-64">
              <PropertySearchField
                properties={properties}
                value={f.q}
                onChange={(v) => set("q", v)}
                placeholder="Search by address, locality or district…"
                inputClassName="w-full rounded-md border border-outline-variant bg-surface py-2 pl-10 pr-10 text-body-md outline-none focus:border-tertiary-container focus:ring-2 focus:ring-tertiary-container"
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
              className={`flex items-center gap-2 rounded-md border px-3 py-2 font-data text-data-sm transition-colors whitespace-nowrap ${
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
                setSelectedLeaseYear(null);
              }}
              className="flex items-center gap-2 rounded-md border border-outline-variant px-3 py-2 font-data text-data-sm text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors whitespace-nowrap"
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

          {/* Filter chip bar */}
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest p-3">
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
                  if (v === "Leasehold") {
                    setLeaseholdModalOpen(true);
                  } else {
                    set("leaseYears", "");
                    setSelectedLeaseYear(null);
                    setOpenChip(null);
                  }
                }}
              />
            </FilterChip>

            <FilterChip
              label="Title"
              icon={FileText}
              value={f.title}
              isOpen={openChip === "title"}
              onToggle={() => setOpenChip(openChip === "title" ? null : "title")}
            >
              <FilterGroup
                label="Title status"
                icon={FileText}
                options={TITLES}
                value={f.title}
                onChange={(v) => {
                  set("title", v);
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
            <div className="flex flex-wrap gap-2">
              <span className="inline-block font-data text-data-sm text-on-surface-variant">
                Quick browse:
              </span>
              {localities.slice(0, 6).map((locality) => (
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
          <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...results]
              .sort((a, b) => b.askingPrice - a.askingPrice)
              .map((p) => (
                <PropertyResultCard
                  key={p.id}
                  property={p}
                  isFeatured={FEATURED_PROPERTY_IDS.includes(p.id)}
                  onOpen={() => setSelectedProperty(p)}
                />
              ))}
          </div>
        )}
      </div>

      {/* Leasehold year modal */}
      <LeaseholdYearModal
        open={leaseholdModalOpen}
        initialYear={selectedLeaseYear}
        onApply={(year) => {
          setSelectedLeaseYear(year);
          set("leaseYears", year ? String(year) : "");
        }}
        onClose={() => {
          setLeaseholdModalOpen(false);
          setOpenChip(null);
        }}
      />

      {/* Property details modal */}
      <PropertyDetailsModal
        property={selectedProperty}
        isFeatured={
          selectedProperty
            ? FEATURED_PROPERTY_IDS.includes(selectedProperty.id)
            : false
        }
        onClose={() => setSelectedProperty(null)}
      />
    </div>
  );
}

function PropertyResultCard({
  property: p,
  isFeatured,
  onOpen,
}: {
  property: Property;
  isFeatured: boolean;
  onOpen: () => void;
}) {
  const rate = pricePerSqm(p.askingPrice, p.floorAreaSqm);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex flex-col overflow-hidden rounded-lg border border-primary/10 bg-surface-container-lowest text-left transition-shadow hover:shadow-[var(--shadow-level-2)]"
    >
      {/* Image container with badges - larger proportion */}
      <div className="relative h-56 w-full flex-shrink-0 overflow-hidden bg-surface">
        <Image
          src={p.images[0]}
          alt={`${p.type} at ${p.address}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          priority={false}
        />

        {/* Badge overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <EcoBadge rating={p.ecoRating} className="absolute left-3 top-3" />

        {p.verifiedBy && <VerifiedBadge className="absolute bottom-3 left-3" />}

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
      <div className="relative flex flex-1 flex-col p-4">
        {/* Price row */}
        <div className="mb-1 font-data text-data-md font-bold text-primary">
          {formatCedi(p.askingPrice)}
        </div>
        {rate && (
          <div className="mb-2 font-data text-data-xs text-on-surface-variant">
            ₵{rate.toLocaleString("en-GH")}/sqm
          </div>
        )}

        {/* Address */}
        <div className="mb-3 line-clamp-2 text-body-sm font-medium text-on-surface">
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
          <span className="inline-flex items-center rounded-sm px-1.5 py-0.5 text-data-xs font-semibold bg-secondary text-on-secondary">
            {p.status}
          </span>
          <span className="text-on-surface-variant">{p.tenure}</span>
        </div>

        {/* Location info */}
        <div className="mb-3 border-t border-outline-variant/20 pt-2 font-data text-data-xs">
          <div className="text-on-surface-variant">
            <span className="font-semibold text-on-surface text-data-sm">
              {p.locality}
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
              <div className="text-on-surface-variant">{p.agent.firm}</div>
            </div>
          </div>
        )}
      </div>
    </button>
  );
}
