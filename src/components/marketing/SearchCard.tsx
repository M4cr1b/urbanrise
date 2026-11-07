"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, ChevronDown, Leaf, MapPin, Search } from "lucide-react";
import { PropertySearchField } from "@/components/search/PropertySearchField";
import type { Property } from "@/lib/types";
import styles from "./HomeSearch.module.css";

const TABS = ["Buy", "Rent", "New Developments"] as const;
type Tab = (typeof TABS)[number];
const INTENT: Record<Tab, string> = { Buy: "buy", Rent: "rent", "New Developments": "new" };

/** The landing search hands the selected criteria directly to the workbench. */
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
    if (query.trim()) params.set("q", query.trim());
    if (type !== "All") params.set("type", type);
    if (beds) params.set("minBeds", beds);
    if (price) params.set("maxPrice", price);
    if (ecoOnly) params.set("eco", "B");
    router.push("/search?" + params.toString());
  }

  return (
    <form className={styles.card} aria-label="Find a property" onSubmit={(event) => { event.preventDefault(); submit(); }}>
      <div className={styles.intro}>
        <h2>Find your kind of home.</h2>
        <span><MapPin aria-hidden />Ghana</span>
      </div>
      <div className={styles.tabs} aria-label="Property intent">
        {TABS.map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} aria-pressed={tab === t} aria-label={t}>
            {t === "New Developments" ? "New homes" : t}
          </button>
        ))}
      </div>
      <div className={styles.grid}>
        <label className={styles.field}>
          <span className={styles.label}>Location</span>
          <PropertySearchField properties={properties} value={query} onChange={setQuery}
            placeholder="Area, address or district"
            inputClassName={styles.input} wrapperClassName={styles.location}
            onSubmit={submit} icon={<MapPin aria-hidden />} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Property Type</span>
          <span className={styles.select}>
            <select value={type} onChange={(event) => setType(event.target.value)}>
              <option value="All">All Types</option>
              <option>Apartment</option><option>Compound House</option><option>Townhouse</option>
              <option>Duplex</option><option>Villa</option><option>Mansion</option><option>Bungalow</option>
            </select>
            <ChevronDown aria-hidden />
          </span>
        </label>
        <div className={styles.field}>
          <span className={styles.label}>Beds &amp; budget (₵)</span>
          <div className={styles.priceRow}>
            <span className={styles.select}>
              <select value={beds} onChange={(event) => setBeds(event.target.value)} aria-label="Minimum bedrooms">
                <option value="">Beds</option><option value="1">1+</option><option value="2">2+</option>
                <option value="3">3+</option><option value="4">4+</option>
              </select>
              <ChevronDown aria-hidden />
            </span>
            <span className={styles.select}>
              <select value={price} onChange={(event) => setPrice(event.target.value)} aria-label="Maximum price">
                <option value="">Any Price</option><option value="1000000">Up to ₵1M</option>
                <option value="3000000">Up to ₵3M</option><option value="5000000">Up to ₵5M</option>
                <option value="10000000">Up to ₵10M</option>
              </select>
              <ChevronDown aria-hidden />
            </span>
          </div>
        </div>
        <button type="submit" className={styles.submit} aria-label="Search properties">
          <span><Search aria-hidden />Find my home</span><ArrowRight aria-hidden />
        </button>
      </div>
      <div className={styles.footer}>
        <label className={styles.eco}>
          <span className={styles.switch}>
            <input type="checkbox" checked={ecoOnly} onChange={(event) => setEcoOnly(event.target.checked)} />
            <span className={styles.track} /><span className={styles.thumb} />
          </span>
          <span className={styles.ecoText}>Show eco-rated homes</span>
        </label>
        <span className={styles.footnote}><Leaf aria-hidden />A greener way to move</span>
      </div>
    </form>
  );
}
