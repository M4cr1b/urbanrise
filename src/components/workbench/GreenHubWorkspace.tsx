"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  Building2,
  Droplets,
  Globe,
  Hammer,
  Home,
  Leaf,
  Mail,
  MapPin,
  Paintbrush,
  Phone,
  Search,
  Sun,
  Thermometer,
} from "lucide-react";
import { EmptyState } from "@/components/ui/States";
import type { GreenMaterial, MaterialCategory } from "@/lib/types";
import { PRIMARY_REGION } from "@/lib/regions";

/* ---------------------------------------------------------------------------
   Green Building Materials Hub.

   Rebuilt around the question the hub exists to answer: "what is this, why is
   it better, and where do I buy it". The previous version was a specification
   table — carbon figures and certification codes — which is the last part of
   that question and none of the first two.

   Each card now leads with a photograph of the material, states the benefit in
   plain words before any number, and ends with a named supplier, their address
   and a tappable phone number.
   ------------------------------------------------------------------------ */

const CATEGORY_META: Record<
  MaterialCategory,
  { icon: typeof Leaf; blurb: string }
> = {
  Structure: { icon: Building2, blurb: "Walls, blocks and framing" },
  Roofing: { icon: Home, blurb: "Sheets, tiles and coverings" },
  Insulation: { icon: Thermometer, blurb: "Keeps interiors cooler" },
  Energy: { icon: Sun, blurb: "Solar, batteries and backup" },
  Water: { icon: Droplets, blurb: "Harvesting and recycling" },
  Finishes: { icon: Paintbrush, blurb: "Paints, floors and surfaces" },
};

const CATEGORIES = Object.keys(CATEGORY_META) as MaterialCategory[];

/**
 * Turns the carbon saving into something a homeowner can act on.
 *
 * "78% less embodied carbon than the conventional equivalent" is accurate and
 * almost useless to a non-specialist. A band with a plain sentence is not.
 */
function benefitOf(m: GreenMaterial): { label: string; tone: string; plain: string } {
  const s = m.savingVsConventionalPct;
  if (s >= 70)
    return {
      label: "Much greener",
      tone: "bg-secondary text-on-secondary",
      plain: `Around ${s}% less carbon than the usual choice`,
    };
  if (s >= 45)
    return {
      label: "Greener",
      tone: "bg-secondary-container text-on-secondary-container",
      plain: `About ${s}% less carbon than the usual choice`,
    };
  return {
    label: "Somewhat greener",
    tone: "bg-tertiary-fixed text-on-tertiary-fixed",
    plain: `Roughly ${s}% less carbon than the usual choice`,
  };
}

export function GreenHubWorkspace({ materials }: { materials: GreenMaterial[] }) {
  const [category, setCategory] = useState<MaterialCategory | "All">("All");
  const [q, setQ] = useState("");

  const results = useMemo(
    () =>
      materials.filter((m) => {
        if (category !== "All" && m.category !== category) return false;
        if (q) {
          const hay = `${m.name} ${m.supplier} ${m.summary}`.toLowerCase();
          if (!hay.includes(q.toLowerCase())) return false;
        }
        return true;
      }),
    [materials, category, q],
  );

  return (
    <div className="p-5 md:p-8">
      <header className="mb-6">
        <h1 className="font-headline text-headline-lg text-primary">
          Green Building Materials
        </h1>
        <p className="mt-1 max-w-2xl text-body-md text-on-surface-variant">
          Sustainable materials available in {PRIMARY_REGION}, with the supplier
          and where to find them. Better for the environment, and usually
          cheaper to run.
        </p>
      </header>

      {/* Category chips carry a one-line explanation, so the taxonomy does not
          assume construction vocabulary. */}
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory("All")}
          aria-pressed={category === "All"}
          className={`rounded-full border px-4 py-2 font-data text-data-sm transition-colors ${
            category === "All"
              ? "border-primary bg-primary text-on-primary"
              : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-primary"
          }`}
        >
          Everything
        </button>
        {CATEGORIES.map((c) => {
          const { icon: Icon, blurb } = CATEGORY_META[c];
          const active = category === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={active}
              title={blurb}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 font-data text-data-sm transition-colors ${
                active
                  ? "border-primary bg-primary text-on-primary"
                  : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-primary"
              }`}
            >
              <Icon className="size-4" aria-hidden />
              {c}
            </button>
          );
        })}
      </div>

      <label className="mb-6 block max-w-md">
        <span className="sr-only">Search materials</span>
        <span className="relative block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline"
            aria-hidden
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search materials or suppliers…"
            className="w-full rounded-md border border-outline-variant bg-surface-container-lowest py-2.5 pl-10 pr-4 text-body-md outline-none focus:border-tertiary-container"
          />
        </span>
      </label>

      <p className="mb-4 font-data text-data-sm text-on-surface-variant" aria-live="polite">
        <strong className="text-on-surface">{results.length}</strong>{" "}
        {results.length === 1 ? "material" : "materials"}
        {category !== "All" && ` in ${category}`}
      </p>

      {results.length === 0 ? (
        <EmptyState
          icon={Leaf}
          title="No materials match"
          body="Try a different category, or clear the search to see everything available in Greater Accra."
          action={{ href: "/green-hub", label: "Show all materials" }}
        />
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((m) => (
            <MaterialCard key={m.id} material={m} />
          ))}
        </ul>
      )}
    </div>
  );
}

function MaterialCard({ material: m }: { material: GreenMaterial }) {
  const benefit = benefitOf(m);
  const { icon: CategoryIcon } = CATEGORY_META[m.category];
  const supplier = m.supplierDetail;

  return (
    <li className="flex flex-col overflow-hidden rounded-xl border border-primary/10 bg-surface-container-lowest">
      <div className="relative aspect-4/3 bg-surface-container">
        {m.imageUrl ? (
          <Image
            src={m.imageUrl}
            alt={m.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <span className="flex size-full items-center justify-center">
            <CategoryIcon className="size-10 text-outline" aria-hidden />
          </span>
        )}
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-label-caps shadow-sm ${benefit.tone}`}
        >
          {benefit.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className="mb-2 flex items-center gap-1.5 font-data text-[11px] uppercase tracking-wide text-on-surface-variant">
          <CategoryIcon className="size-3.5" aria-hidden />
          {m.category}
        </span>

        <h2 className="mb-2 font-headline text-headline-md text-primary">
          {m.name}
        </h2>
        <p className="mb-4 text-body-md text-on-surface-variant">{m.summary}</p>

        {/* Benefit in words first, figures underneath for anyone who wants them. */}
        <div className="mb-4 rounded-md bg-secondary-container/40 p-3">
          <p className="flex items-start gap-2 font-data text-data-sm text-on-secondary-container">
            <Leaf className="mt-0.5 size-4 shrink-0" aria-hidden />
            {benefit.plain}
          </p>
          <p className="mt-1.5 pl-6 font-data text-[11px] text-on-surface-variant">
            {m.carbonKgCo2e} kg CO₂e per {m.unit} · {m.certification}
          </p>
        </div>

        <p className="mb-4 font-data text-data-lg text-primary">
          ₵{m.pricePerUnit.toLocaleString("en-GH")}
          <span className="font-data text-data-sm font-normal text-on-surface-variant">
            {" "}
            per {m.unit}
          </span>
        </p>

        {/* Where to buy it — pushed to the bottom so every card ends here. */}
        <div className="mt-auto border-t border-outline-variant/40 pt-4">
          <p className="mb-2 flex items-center gap-1.5 font-data text-[11px] uppercase tracking-wide text-on-surface-variant">
            <Hammer className="size-3.5" aria-hidden />
            Where to buy
          </p>
          <p className="font-data text-data-sm font-semibold text-on-surface">
            {m.supplier}
          </p>

          {supplier?.address && (
            <p className="mt-1 flex items-start gap-1.5 font-data text-data-sm text-on-surface-variant">
              <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              <span>
                {supplier.address}
                {supplier.locality && (
                  <span className="block text-[11px]">{supplier.locality}</span>
                )}
              </span>
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 font-data text-data-sm">
            {supplier?.phone && (
              <a
                href={`tel:${supplier.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-1.5 text-primary hover:underline"
              >
                <Phone className="size-3.5" aria-hidden />
                {supplier.phone}
              </a>
            )}
            {supplier?.email && (
              <a
                href={`mailto:${supplier.email}`}
                className="flex items-center gap-1.5 text-primary hover:underline"
              >
                <Mail className="size-3.5" aria-hidden />
                Email
              </a>
            )}
            {supplier?.website && (
              <a
                href={`https://${supplier.website.replace(/^https?:\/\//, "")}`}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-1.5 text-primary hover:underline"
              >
                <Globe className="size-3.5" aria-hidden />
                Website
              </a>
            )}
          </div>

          {!supplier?.phone && !supplier?.email && (
            <p className="mt-2 font-data text-[11px] text-outline">
              Contact details not yet on file for this supplier.
            </p>
          )}
        </div>
      </div>
    </li>
  );
}
