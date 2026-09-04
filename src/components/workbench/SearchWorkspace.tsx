"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
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
} from "lucide-react";
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

export function SearchWorkspace({ properties }: { properties: Property[] }) {
  const [f, setF] = useState<Filters>(EMPTY);
  const set = <K extends keyof Filters>(key: K, v: Filters[K]) =>
    setF((prev) => ({ ...prev, [key]: v }));

  const results = useMemo(() => {
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
  }, [properties, f]);

  const activeFilterCount = countActiveFilters(f);

  return (
    <div className="flex h-full flex-col">
      {/* --- Filters -------------------------------------------------------- */}
      <div className="shrink-0 border-b border-outline-variant bg-surface-container-lowest p-6">
        {/* Search bar with affordances */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-start gap-3">
            <div className="relative flex-1 min-w-64">
              <button
                type="button"
                onClick={() => {
                  const input = document.querySelector('input[placeholder*="Search by"]') as HTMLInputElement;
                  input?.focus();
                }}
                className="pointer-events-auto absolute left-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                aria-label="Focus search input"
              >
                <Search className="size-4" aria-hidden />
              </button>
              <input
                value={f.q}
                onChange={(e) => set("q", e.target.value)}
                placeholder="Search by address, locality or district…"
                className="w-full rounded-md border border-outline-variant bg-surface py-2.5 pl-10 pr-10 text-body-md outline-none focus:border-tertiary-container focus:ring-2 focus:ring-tertiary-container"
              />
              {f.q && (
                <button
                  type="button"
                  onClick={() => set("q", "")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                  aria-label="Clear search"
                >
                  <X className="size-4" aria-hidden />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setF(EMPTY)}
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

          {/* Live result count visibility indicator */}
          <div className="flex items-center gap-2">
            <span className="font-data text-data-sm text-on-surface-variant">
              <strong className="text-on-surface text-data-md font-semibold">{results.length}</strong>{" "}
              {results.length === 1 ? "property" : "properties"} found
            </span>
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

        {/* Secondary details */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-data text-data-sm">
          <StatusChip status={p.status} />
          <span className="text-on-surface-variant">
            {p.tenure}
          </span>
          <TitleStatusText status={p.titleStatus} />
        </div>
      </div>
    </Link>
  );
}
