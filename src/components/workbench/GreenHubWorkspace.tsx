"use client";

import { useMemo, useState } from "react";
import { Leaf, Search } from "lucide-react";
import { RankedBars } from "@/components/charts/Charts";
import { formatCedi } from "@/lib/format";
import type { GreenMaterial, MaterialCategory, Region } from "@/lib/types";

/**
 * Green Building Materials Hub.
 *
 * Every entry states its carbon saving against the conventional equivalent,
 * because "sustainable" is the claim and the saving is the evidence — the gap
 * the proposal identifies is precisely that this figure is not published
 * anywhere a Ghanaian self-builder can reach it.
 */

const CATEGORIES: (MaterialCategory | "All")[] = [
  "All",
  "Structure",
  "Roofing",
  "Insulation",
  "Energy",
  "Water",
  "Finishes",
];

const REGIONS: (Region | "All")[] = [
  "All",
  "Greater Accra",
  "Ashanti",
  "Western",
  "Eastern",
  "Central",
  "Northern",
];

export function GreenHubWorkspace({
  materials,
}: {
  materials: GreenMaterial[];
}) {
  const [category, setCategory] = useState<MaterialCategory | "All">("All");
  const [region, setRegion] = useState<Region | "All">("All");
  const [q, setQ] = useState("");

  const results = useMemo(
    () =>
      materials.filter((m) => {
        if (category !== "All" && m.category !== category) return false;
        if (region !== "All" && m.region !== region) return false;
        if (q) {
          const hay = `${m.name} ${m.supplier} ${m.certification}`.toLowerCase();
          if (!hay.includes(q.toLowerCase())) return false;
        }
        return true;
      }),
    [materials, category, region, q],
  );

  const topSavers = useMemo(
    () =>
      [...materials]
        .sort((a, b) => b.savingVsConventionalPct - a.savingVsConventionalPct)
        .slice(0, 8)
        .map((m) => ({ name: m.name, value: m.savingVsConventionalPct })),
    [materials],
  );

  return (
    <div className="p-6 md:p-8">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 font-headline text-headline-lg text-primary">
          <Leaf className="size-6 text-secondary" aria-hidden />
          Green Building Hub
        </h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Certified sustainable materials and suppliers, with the carbon saving
          against the conventional equivalent stated for each.
        </p>
      </header>

      <section className="mb-6 rounded-md border border-outline-variant/60 bg-surface-container-lowest p-5">
        <h2 className="font-headline text-headline-md text-primary">
          Largest carbon savings
        </h2>
        <p className="mb-4 mt-0.5 font-data text-data-sm text-on-surface-variant">
          Percentage reduction in embodied carbon against the conventional
          equivalent.
        </p>
        <RankedBars
          data={topSavers}
          format={(v) => `${v}%`}
          label="Carbon saving against conventional equivalent by material"
          labelWidth={280}
        />
      </section>

      <div className="mb-6 space-y-3 rounded-md border border-outline-variant/60 bg-surface-container-lowest p-4">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline"
            aria-hidden
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search materials, suppliers or certifications…"
            className="w-full rounded-md border border-outline-variant bg-surface py-2.5 pl-10 pr-4 text-body-md outline-none focus:border-tertiary-container focus:ring-2 focus:ring-tertiary-container"
          />
        </div>
        <FilterRow
          label="Category"
          options={CATEGORIES}
          value={category}
          onChange={(v) => setCategory(v as MaterialCategory | "All")}
        />
        <FilterRow
          label="Region"
          options={REGIONS}
          value={region}
          onChange={(v) => setRegion(v as Region | "All")}
        />
      </div>

      <p className="mb-3 font-data text-data-sm text-on-surface-variant">
        <strong className="text-on-surface">{results.length}</strong>{" "}
        {results.length === 1 ? "material" : "materials"}
      </p>

      {results.length === 0 ? (
        <p className="rounded-md border border-outline-variant/60 bg-surface-container-lowest p-8 text-center text-body-md text-on-surface-variant">
          No materials match these filters.
        </p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((m) => (
            <li
              key={m.id}
              className="flex flex-col rounded-md border border-outline-variant/60 bg-surface-container-lowest p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-headline text-headline-md text-primary">
                  {m.name}
                </h3>
                <span className="leaf-badge shrink-0 bg-secondary px-2.5 py-1 text-label-caps text-on-secondary">
                  −{m.savingVsConventionalPct}%
                </span>
              </div>

              <p className="mt-2 flex-1 font-data text-data-sm text-on-surface-variant">
                {m.summary}
              </p>

              <dl className="mt-4 space-y-1.5 border-t border-outline-variant/40 pt-3 font-data text-data-sm">
                <Row label="Supplier" value={m.supplier} />
                <Row label="Region" value={m.region} />
                <Row label="Certification" value={m.certification} />
                <Row
                  label="Embodied carbon"
                  value={`${m.carbonKgCo2e} kg CO₂e / ${m.unit}`}
                />
                <Row
                  label="Indicative price"
                  value={`${formatCedi(m.pricePerUnit)} / ${m.unit}`}
                />
              </dl>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-on-surface-variant">{label}</dt>
      <dd className="text-right font-medium text-on-surface">{value}</dd>
    </div>
  );
}

function FilterRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-[90px_1fr] items-start gap-3">
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
