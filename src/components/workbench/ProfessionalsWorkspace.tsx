"use client";

import Image from "next/image";

import { useMemo, useState } from "react";
import { Mail, Phone, Search, ShieldCheck } from "lucide-react";
import type { Discipline, Professional, Region } from "@/lib/types";
import { IS_SINGLE_REGION, PRIMARY_REGION } from "@/lib/regions";

/**
 * The directory of estate professionals.
 *
 * The proposal's point is that a residential transaction needs a whole chain of
 * professionals who currently sit on separate platforms — so the filter is by
 * discipline first, and registration status is surfaced on every card rather
 * than buried in a profile.
 */

const DISCIPLINES: (Discipline | "All")[] = [
  "All",
  "Estate Surveyor & Valuer",
  "Estate Agent",
  "Property Lawyer",
  "Architect",
  "Structural Engineer",
  "Quantity Surveyor",
  "Property Manager",
  "Mortgage Consultant",
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

export function ProfessionalsWorkspace({
  professionals,
}: {
  professionals: Professional[];
}) {
  const [discipline, setDiscipline] = useState<Discipline | "All">("All");
  const [region, setRegion] = useState<Region | "All">("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [q, setQ] = useState("");

  const results = useMemo(
    () =>
      professionals.filter((p) => {
        if (discipline !== "All" && p.discipline !== discipline) return false;
        if (region !== "All" && p.region !== region) return false;
        if (verifiedOnly && !p.verified) return false;
        if (q) {
          const hay =
            `${p.name} ${p.firm} ${p.specialisms.join(" ")}`.toLowerCase();
          if (!hay.includes(q.toLowerCase())) return false;
        }
        return true;
      }),
    [professionals, discipline, region, verifiedOnly, q],
  );

  return (
    <div className="p-6 md:p-8">
      <header className="mb-6">
        <h1 className="font-headline text-headline-lg text-primary">
          Find a Professional
        </h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Verified surveyors, valuers, lawyers, architects and engineers in{" "}
          {PRIMARY_REGION}.
        </p>
      </header>

      <div className="mb-6 space-y-3 rounded-md border border-outline-variant/60 bg-surface-container-lowest p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-64 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline"
              aria-hidden
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, firm or specialism…"
              className="w-full rounded-md border border-outline-variant bg-surface py-2.5 pl-10 pr-4 text-body-md outline-none focus:border-tertiary-container focus:ring-2 focus:ring-tertiary-container"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 font-data text-data-sm text-on-surface-variant">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="size-4 accent-[#006e24]"
            />
            Registered only
          </label>
        </div>

        <FilterRow
          label="Discipline"
          options={DISCIPLINES}
          value={discipline}
          onChange={(v) => setDiscipline(v as Discipline | "All")}
        />
        {/* Only worth offering once coverage spans more than one region;
            until then every option but one returns nothing. */}
        {!IS_SINGLE_REGION && (
          <FilterRow
            label="Region"
            options={REGIONS}
            value={region}
            onChange={(v) => setRegion(v as Region | "All")}
          />
        )}
      </div>

      <p className="mb-3 font-data text-data-sm text-on-surface-variant">
        <strong className="text-on-surface">{results.length}</strong>{" "}
        {results.length === 1 ? "professional" : "professionals"}
      </p>

      {results.length === 0 ? (
        <p className="rounded-md border border-outline-variant/60 bg-surface-container-lowest p-8 text-center text-body-md text-on-surface-variant">
          No professionals match these filters.
        </p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((p) => (
            <li
              key={p.id}
              className="overflow-hidden rounded-md border border-outline-variant/60 bg-surface-container-lowest"
            >
              {/* Photograph first: engaging a valuer or lawyer is a personal
                  decision, and a wall of names tells you nothing about who you
                  would be dealing with. */}
              <div className="flex gap-4 p-5">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-full bg-surface-container ring-1 ring-outline-variant/40 sm:size-24">
                  {p.photoUrl ? (
                    <Image
                      src={p.photoUrl}
                      alt={`${p.name}, ${p.discipline}`}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    // Monogram for members who have not uploaded a photograph.
                    // Brand-toned rather than grey, so it reads as a designed
                    // state and not a broken image.
                    <span className="flex size-full items-center justify-center bg-primary-container font-headline text-headline-md text-on-primary-container">
                      {p.name
                        .split(" ")
                        .filter(Boolean)
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="font-headline text-headline-md text-primary">
                        {p.name}
                      </h2>
                      <p className="font-data text-data-sm text-on-surface-variant">
                        {p.firm}
                      </p>
                    </div>
                    {p.verified && (
                      <span
                        className="flex shrink-0 items-center gap-1 rounded-sm bg-secondary-container px-2 py-1 text-label-caps text-on-secondary-fixed"
                        title="Registration confirmed with the professional body"
                      >
                        <ShieldCheck className="size-3.5" aria-hidden />
                        Registered
                      </span>
                    )}
                  </div>

                  <p className="mt-2 font-data text-data-sm font-medium text-on-surface">
                    {p.discipline}
                  </p>
                  <p className="font-data text-data-sm text-on-surface-variant">
                    {p.yearsExperience} years · {p.licenceNo}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5">

              <ul className="mt-3 flex flex-wrap gap-1.5">
                {p.specialisms.map((s) => (
                  <li
                    key={s}
                    className="rounded-full border border-outline-variant/60 bg-surface-container-low px-2.5 py-0.5 font-data text-[11px] text-on-surface-variant"
                  >
                    {s}
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-outline-variant/40 pt-3 font-data text-data-sm">
                <a
                  href={`tel:${p.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-1.5 text-primary hover:underline"
                >
                  <Phone className="size-3.5" aria-hidden />
                  {p.phone}
                </a>
                <a
                  href={`mailto:${p.email}`}
                  className="flex items-center gap-1.5 text-primary hover:underline"
                >
                  <Mail className="size-3.5" aria-hidden />
                  Email
                </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
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
