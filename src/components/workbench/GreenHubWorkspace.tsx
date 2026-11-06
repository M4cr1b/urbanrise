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
  MessageCircle,
  Paintbrush,
  Phone,
  Sun,
  Thermometer,
} from "lucide-react";
import { EmptyState } from "@/components/ui/States";
import type { GreenMaterial, MaterialCategory } from "@/lib/types";
import { PRIMARY_REGION } from "@/lib/regions";
import { CollectionPanel, CollectionSearch, CollectionReset } from "./CollectionPanel";
import styles from "./CollectionPanel.module.css";

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

function whatsappUrl(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

function mapSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

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
    <div className={styles.workspace}>
      <CollectionPanel eyebrow="THE GREEN BUILDING COLLECTION" title={<>Green Building <em>Materials</em></>} description={<>Explore sustainable materials and find their suppliers in {PRIMARY_REGION}. Thoughtful choices for the spaces you build.</>} count={results.length} countLabel="materials">
        <div className={styles.controls}>
          <CollectionSearch label="Search materials" placeholder="Materials, suppliers or ideas…" value={q} onChange={setQ} />
          <CollectionReset onClick={() => { setQ(""); setCategory("All"); }} />
        </div>
        <div aria-label="Material categories" className={styles.filterRow}>
          <span className={styles.filterLabel}>Explore</span>
          <button type="button" onClick={() => setCategory("All")} aria-pressed={category === "All"} className={styles.chip}><Leaf className="size-3.5" aria-hidden />Everything</button>
          {CATEGORIES.map(c => {
            const { icon: Icon, blurb } = CATEGORY_META[c];
            return <button key={c} type="button" onClick={() => setCategory(c)} aria-pressed={category === c} title={blurb} className={styles.chip}>
              <Icon className="size-3.5" aria-hidden />{c}
            </button>;
          })}
        </div>
      </CollectionPanel>

      {results.length === 0 ? (
        <EmptyState
          icon={Leaf}
          title="No materials match"
          body="Try a different category, or clear the search to see everything available in Greater Accra."
          action={{ href: "/green-hub", label: "Show all materials" }}
        />
      ) : (
        <ul className={"grid " + styles.grid}>
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
    <li className={styles.itemCard + " flex flex-col"}>
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

      <div className={styles.materialBody}>
        <span className="mb-2 flex items-center gap-1.5 font-data text-[11px] uppercase tracking-wide text-on-surface-variant">
          <CategoryIcon className="size-3.5" aria-hidden />
          {m.category}
        </span>

        <h2 className="mb-2 font-headline text-headline-md text-primary">
          {m.name}
        </h2>
        <p className={styles.materialSummary}>{m.summary}</p>

        {/* Benefit in words first, figures underneath for anyone who wants them. */}
        <div className={styles.benefit}>
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
        <div className={styles.supplier}>
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

          <div className={styles.contactLinks}>
            {supplier?.phone && (
              <a
                href={`tel:${supplier.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-1.5 text-primary hover:underline"
              >
                <Phone className="size-3.5" aria-hidden />
                {supplier.phone}
              </a>
            )}
            {supplier?.phone && (
              <a
                href={whatsappUrl(supplier.phone)}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-1.5 text-primary hover:underline"
              >
                <MessageCircle className="size-3.5" aria-hidden />
                WhatsApp
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
            {(supplier?.address || supplier?.locality) && (
              <a
                href={mapSearchUrl(
                  [supplier?.address, supplier?.locality]
                    .filter(Boolean)
                    .join(", "),
                )}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-1.5 text-primary hover:underline"
              >
                <MapPin className="size-3.5" aria-hidden />
                View on map
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
