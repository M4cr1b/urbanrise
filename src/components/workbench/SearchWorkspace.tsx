"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { RotateCcw, Search,
  Image as ImageIcon,
} from "lucide-react";
import { StatusChip, TitleStatusText } from "@/components/ui/Badges";
import { formatCedi, formatSqm, pricePerSqm } from "@/lib/format";
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

function SegmentedRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-[130px_1fr] items-start gap-3 border-b border-outline-variant/40 py-2.5">
      <span className="pt-1.5 font-data text-data-sm text-on-surface-variant">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            aria-pressed={value === opt}
            className={`rounded-sm border px-3 py-1.5 font-data text-data-sm transition-colors ${
              value === opt
                ? "border-primary bg-primary text-on-primary"
                : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-primary/50 hover:text-primary"
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

  return (
    <div className="flex h-full flex-col">
      {/* --- Filters -------------------------------------------------------- */}
      <div className="shrink-0 border-b border-outline-variant bg-surface-container-lowest p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-64 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline"
              aria-hidden
            />
            <input
              value={f.q}
              onChange={(e) => set("q", e.target.value)}
              placeholder="Search by address, locality or district…"
              className="w-full rounded-md border border-outline-variant bg-surface py-2.5 pl-10 pr-4 text-body-md outline-none focus:border-tertiary-container focus:ring-2 focus:ring-tertiary-container"
            />
          </div>
          <button
            type="button"
            onClick={() => setF(EMPTY)}
            className="flex items-center gap-2 rounded-md border border-outline-variant px-4 py-2.5 font-data text-data-sm text-on-surface-variant hover:border-primary/50 hover:text-primary"
          >
            <RotateCcw className="size-4" aria-hidden />
            Reset
          </button>
        </div>

        <SegmentedRow label="Property type" options={TYPES} value={f.type} onChange={(v) => set("type", v)} />
        <SegmentedRow label="Property style" options={STYLES} value={f.style} onChange={(v) => set("style", v)} />
        <SegmentedRow label="Tenure" options={TENURES} value={f.tenure} onChange={(v) => set("tenure", v)} />
        <SegmentedRow label="Title status" options={TITLES} value={f.title} onChange={(v) => set("title", v)} />
        <SegmentedRow label="Eco rating" options={ECO} value={f.eco} onChange={(v) => set("eco", v)} />
        <SegmentedRow label="Status" options={STATUSES} value={f.status} onChange={(v) => set("status", v)} />

        <div className="grid grid-cols-[130px_1fr] items-center gap-3 py-2.5">
          <span className="font-data text-data-sm text-on-surface-variant">
            Bedrooms &amp; price
          </span>
          <div className="flex flex-wrap items-center gap-2 font-data text-data-sm">
            <NumField label="Beds from" value={f.minBeds} onChange={(v) => set("minBeds", v)} width="w-24" />
            <NumField label="to" value={f.maxBeds} onChange={(v) => set("maxBeds", v)} width="w-24" />
            <span className="mx-2 h-5 w-px bg-outline-variant" />
            <NumField label="₵ from" value={f.minPrice} onChange={(v) => set("minPrice", v)} width="w-36" />
            <NumField label="to" value={f.maxPrice} onChange={(v) => set("maxPrice", v)} width="w-36" />
          </div>
        </div>
      </div>

      {/* --- Results -------------------------------------------------------- */}
      <div className="flex items-center justify-between border-b border-outline-variant/50 bg-surface-container px-5 py-2 font-data text-data-sm text-on-surface-variant">
        <span>
          <strong className="text-on-surface">{results.length}</strong>{" "}
          {results.length === 1 ? "property" : "properties"}
        </span>
        <span>Sorted by asking price, highest first</span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto scrollbar-slim">
        {results.length === 0 ? (
          <p className="p-8 text-center text-body-md text-on-surface-variant">
            No properties match these filters. Try widening the search.
          </p>
        ) : (
          <ul className="divide-y divide-outline-variant/40">
            {[...results]
              .sort((a, b) => b.askingPrice - a.askingPrice)
              .map((p) => (
                <ResultRow key={p.id} property={p} />
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
  width,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  width: string;
}) {
  return (
    <label className="flex items-center gap-1.5">
      <span className="text-on-surface-variant">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${width} rounded-sm border border-outline-variant bg-surface px-2 py-1.5 text-right outline-none focus:border-tertiary-container focus:ring-2 focus:ring-tertiary-container`}
      />
    </label>
  );
}

function ResultRow({ property: p }: { property: Property }) {
  const rate = pricePerSqm(p.askingPrice, p.floorAreaSqm);
  return (
    <li>
      <Link
        href={`/property/${p.id}`}
        className="flex gap-4 bg-surface-container-lowest px-5 py-3 transition-colors hover:bg-surface-container-low"
      >
        <div className="relative size-20 shrink-0 overflow-hidden rounded-sm">
          <Image
            src={p.images[0]}
            alt={`${p.type} at ${p.address}`}
            fill
            sizes="80px"
            className="object-cover"
          />
          {/* Says a listing has more to see, so the gallery is discoverable
              from the results rather than only after opening the page. */}
          {p.images.length > 1 && (
            <span className="absolute bottom-0.5 right-0.5 flex items-center gap-0.5 rounded-sm bg-black/65 px-1 py-0.5 font-data text-[10px] text-white">
              <ImageIcon className="size-2.5" aria-hidden />
              {p.images.length}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-body-md font-medium text-on-surface">
                {p.address}
              </p>
              <p className="font-data text-data-sm text-on-surface-variant">
                {p.bedrooms} bed · {p.style} · {formatSqm(p.floorAreaSqm)} ·{" "}
                {p.district}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <div className="font-data text-data-lg text-primary">
                {formatCedi(p.askingPrice)}
              </div>
              {rate && (
                <div className="font-data text-data-sm text-on-surface-variant">
                  ₵{rate.toLocaleString("en-GH")}/sqm
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-data text-data-sm">
            <StatusChip status={p.status} />
            <span className="text-on-surface-variant">
              Tenure: <span className="text-on-surface">{p.tenure}</span>
            </span>
            <span className="text-on-surface-variant">
              Title: <TitleStatusText status={p.titleStatus} />
            </span>
            <span className="text-on-surface-variant">
              Eco: <span className="text-on-surface">{p.ecoRating}</span>
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}
