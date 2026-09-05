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
  const [locality, setLocality] = useState("");
  const [type, setType] = useState("All");
  const [beds, setBeds] = useState("");
  const [price, setPrice] = useState("");
  const [ecoOnly, setEcoOnly] = useState(true);

  function submit() {
    const params = new URLSearchParams({ intent: INTENT[tab] });
    if (locality) params.set("q", locality);
    if (type !== "All") params.set("type", type);
    if (beds) params.set("minBeds", beds);
    if (price) params.set("maxPrice", price);
    if (ecoOnly) params.set("eco", "B");
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="topo-bg rounded-xl border border-primary/10 bg-surface-container-lowest p-6 shadow-[var(--shadow-level-2)] md:p-8">
      <div className="mb-6 flex gap-8 border-b border-outline-variant/30">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 pb-4 font-headline text-headline-md transition-colors ${
              tab === t
                ? "border-primary font-bold text-primary"
                : "border-transparent text-on-surface-variant hover:text-primary"
            }`}
          >
            {t}
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
            value={locality}
            onChange={setLocality}
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
            <option>Townhouse</option>
            <option>Compound House</option>
            <option>Land</option>
          </select>
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-label-caps text-on-surface-variant">
            Beds &amp; Price (₵)
          </span>
          <div className="flex gap-2">
            <select
              value={beds}
              onChange={(e) => setBeds(e.target.value)}
              aria-label="Minimum bedrooms"
              className="w-2/5 appearance-none rounded-md border border-outline-variant bg-surface px-3 py-3 text-on-surface outline-none focus:border-tertiary-container focus:ring-2 focus:ring-tertiary-container"
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
              className="w-2/3 appearance-none rounded-md border border-outline-variant bg-surface px-3 py-3 text-on-surface outline-none focus:border-tertiary-container focus:ring-2 focus:ring-tertiary-container"
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
          className="btn-leaf flex w-full items-center justify-center gap-2 rounded-md bg-primary-container px-6 py-3 font-data text-data-lg text-on-primary-container hover:bg-primary hover:text-on-primary"
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
