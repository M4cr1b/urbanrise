"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Leaf, MapPin, Search } from "lucide-react";
import { PropertySearchField } from "@/components/search/PropertySearchField";
import type { Property } from "@/lib/types";

const TABS = ["Buy", "Rent", "New Developments"] as const;
type Tab = (typeof TABS)[number];

const INTENT: Record<Tab, string> = {
  Buy: "buy",
  Rent: "rent",
  "New Developments": "new",
};

/**
 * The primary entry point into the platform. Submitting hands off to the
 * workbench search with the filters pre-applied.
 */
export function SearchCard({ properties }: { properties: Property[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Buy");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [beds, setBeds] = useState("");
  const [price, setPrice] = useState("");
  const [ecoOnly, setEcoOnly] = useState(true);

  function submit() {
    const params = new URLSearchParams({ intent: INTENT[tab] });
    if (query) params.set("q", query);
    if (type !== "All") params.set("type", type);
    if (beds) params.set("minBeds", beds);
    if (price) params.set("maxPrice", price);
    if (ecoOnly) params.set("eco", "B");
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="home-search surface-panel min-w-0 p-4 sm:p-6 md:p-7">
      <div className="home-search-tabs mb-6 grid grid-cols-3 sm:flex">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            aria-label={t}
            className={`-mb-px min-h-11 border-b-2 pb-3 text-left font-headline text-base font-semibold transition-colors sm:pb-4 sm:text-headline-md ${
              tab === t
                ? "border-primary font-bold text-primary"
                : "border-transparent text-on-surface-variant hover:text-primary"
            }`}
          >
            {t === "New Developments" ? <><span className="sm:hidden">New homes</span><span className="hidden sm:inline">{t}</span></> : t}
          </button>
        ))}
      </div>

      {/* Two columns, not four: the card sits in the hero's left column so the
          image has room to expand from the right. Four would truncate the
          selects. */}
      <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-label-caps text-on-surface-variant">Location</span>
          <PropertySearchField
            properties={properties}
            value={query}
            onChange={setQuery}
            placeholder="East Legon, Cantonments…"
            inputClassName="w-full rounded-md border border-outline-variant bg-surface py-3 pl-10 pr-4 text-on-surface outline-none transition-all focus:border-tertiary-container focus:ring-2 focus:ring-tertiary-container"
            wrapperClassName="relative"
            onSubmit={submit}
            icon={
              <MapPin
                className="size-4 text-outline"
                aria-hidden
              />
            }
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-label-caps text-on-surface-variant">
            Property Type
          </span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full appearance-none rounded-md border border-outline-variant bg-surface px-4 py-3 text-on-surface outline-none transition-all focus:border-tertiary-container focus:ring-2 focus:ring-tertiary-container"
          >
            <option value="All">All Types</option>
            <option>House</option>
            <option>Apartment</option>
            <option>Compound House</option>
            <option>Townhouse</option>
            <option>Duplex</option>
            <option>Villa</option>
            <option>Mansion</option>
            <option>Bungalow</option>
          </select>
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-label-caps text-on-surface-variant">
            Beds &amp; Price (₵)
          </span>
          <div className="grid min-w-0 grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-2">
            <select
              value={beds}
              onChange={(e) => setBeds(e.target.value)}
              aria-label="Minimum bedrooms"
              className="w-full min-w-0 appearance-none rounded-md border border-outline-variant bg-surface px-3 py-3 text-on-surface outline-none focus:border-tertiary-container focus:ring-2 focus:ring-tertiary-container"
            >
              <option value="">Beds</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
            <select
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              aria-label="Maximum price"
              className="w-full min-w-0 appearance-none rounded-md border border-outline-variant bg-surface px-3 py-3 text-on-surface outline-none focus:border-tertiary-container focus:ring-2 focus:ring-tertiary-container"
            >
              <option value="">Any Price</option>
              <option value="1000000">Under ₵1M</option>
              <option value="3000000">₵1M – ₵3M</option>
              <option value="99000000">Over ₵3M</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={submit}
          className="action-primary flex min-h-12 w-full items-center justify-center gap-2 px-6 py-3"
        >
          <Search className="size-5" aria-hidden />
          Search
        </button>
      </div>

      <label className="mt-6 flex w-fit cursor-pointer items-center gap-3">
        <span className="relative inline-flex">
          <input
            type="checkbox"
            checked={ecoOnly}
            onChange={(e) => setEcoOnly(e.target.checked)}
            className="peer sr-only"
          />
          <span className="block h-6 w-11 rounded-full bg-surface-variant transition-colors peer-checked:bg-secondary" />
          <span className="pointer-events-none absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
        </span>
        <span className="flex items-center gap-1 font-data text-data-sm text-on-surface-variant">
          Show eco-rated homes
          <Leaf className="size-4 text-secondary" aria-hidden />
        </span>
      </label>
    </div>
  );
}
