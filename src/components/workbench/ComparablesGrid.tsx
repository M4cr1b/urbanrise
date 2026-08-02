"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, ImageIcon, MapPin, Plus, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { StatusChip, TitleStatusText } from "@/components/ui/Badges";
import {
  formatCedi,
  formatDate,
  formatDistance,
  formatSqm,
  pricePerSqm,
} from "@/lib/format";
import type { Comparable, Property } from "@/lib/types";
import { useShortlist } from "./shortlist-store";

/* ---------------------------------------------------------------------------
   Row model.

   One CSS grid holds the whole matrix: `280px repeat(N, 240px)`. Because every
   attribute is a grid row spanning all columns, rows stay aligned across
   columns even when cells differ in height — which they do, since sold prices
   carry a date on a second line. A per-column flex layout with fixed row
   heights breaks the moment one cell wraps.
   ------------------------------------------------------------------------ */

interface Row {
  label: string;
  /** Rendered for every comparable, and for the subject unless overridden. */
  value: (p: Property) => ReactNode;
  /** Subject-specific rendering — e.g. it has no distance from itself. */
  subject?: (p: Property) => ReactNode;
  /** Draw a heavier rule above this row to separate groups of attributes. */
  startsGroup?: boolean;
}

const dash = <span className="text-outline">—</span>;

const ROWS: Row[] = [
  { label: "Property type", value: (p) => p.type },
  { label: "Property style", value: (p) => p.style },
  { label: "Bedrooms", value: (p) => p.bedrooms },
  { label: "Bathrooms", value: (p) => p.bathrooms },
  { label: "Year built", value: (p) => p.yearBuilt ?? "Unknown" },
  { label: "Floor area", value: (p) => formatSqm(p.floorAreaSqm) },
  {
    label: "Plot area",
    value: (p) => (p.plotAreaSqm ? formatSqm(p.plotAreaSqm) : "Unknown"),
  },

  {
    label: "Asking price",
    startsGroup: true,
    value: (p) => (
      <span className="flex flex-col items-end">
        <span className="font-semibold">{formatCedi(p.askingPrice)}</span>
        <span className="text-[11px] font-normal text-on-surface-variant">
          Listed {formatDate(p.listedDate)}
        </span>
      </span>
    ),
  },
  {
    label: "Last sold price",
    value: (p) => {
      const last = p.saleHistory[0];
      if (!last) return dash;
      return (
        <span className="flex flex-col items-end">
          <span className="font-semibold">{formatCedi(last.price)}</span>
          <span className="text-[11px] font-normal text-on-surface-variant">
            {formatDate(last.date)}
          </span>
        </span>
      );
    },
  },
  {
    label: "Price per sqm",
    value: (p) => {
      const v = pricePerSqm(p.askingPrice, p.floorAreaSqm);
      return v == null ? dash : `₵${v.toLocaleString("en-GH")}`;
    },
  },
  { label: "Status", value: (p) => <StatusChip status={p.status} /> },

  { label: "Tenure", startsGroup: true, value: (p) => p.tenure },
  {
    label: "Title status",
    value: (p) => <TitleStatusText status={p.titleStatus} />,
  },

  {
    label: "Eco rating",
    startsGroup: true,
    value: (p) => (
      <span
        className={`inline-flex size-5 items-center justify-center rounded-sm text-[11px] font-bold ${
          p.ecoRating <= "B"
            ? "bg-secondary text-on-secondary"
            : p.ecoRating <= "D"
              ? "bg-surface-container-high text-on-surface-variant"
              : "bg-error-container text-on-error-container"
        }`}
      >
        {p.ecoRating}
      </span>
    ),
  },
  {
    label: "Green features",
    value: (p) =>
      p.greenFeatures.length === 0 ? (
        dash
      ) : (
        <span
          className="text-right text-[11px] leading-tight"
          title={p.greenFeatures.map((f) => f.label).join(", ")}
        >
          {p.greenFeatures.length} listed
        </span>
      ),
  },

  { label: "Locality", startsGroup: true, value: (p) => p.locality },
  { label: "District", value: (p) => p.district },
  {
    label: "Agent",
    value: (p) => (
      <span className="flex flex-col items-end text-right">
        <span>{p.agent.firm}</span>
        <span className="text-[11px] font-normal text-on-surface-variant">
          {p.agent.phone}
        </span>
      </span>
    ),
  },
  {
    label: "Verification",
    value: (p) =>
      p.verifiedBy ? (
        <span className="flex items-center gap-1 text-secondary">
          <ShieldCheck className="size-3.5" aria-hidden />
          GhIS
        </span>
      ) : (
        <span className="text-outline">Unverified</span>
      ),
  },
  {
    label: "Distance",
    value: (p) => formatDistance((p as Comparable).distanceKm),
    subject: () => <span className="text-outline">Subject</span>,
  },
];

/* ------------------------------------------------------------------------ */

const SUBJECT_W = 280;
const COL_W = 240;

/** Label-left / value-right cell — the reference repeats labels in every column. */
function Cell({
  label,
  children,
  striped,
  startsGroup,
  sticky,
}: {
  label: string;
  children: ReactNode;
  striped: boolean;
  startsGroup?: boolean;
  sticky?: boolean;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-2 border-r border-outline-variant/40 px-3 py-2 font-data text-data-sm ${
        striped ? "bg-surface-container-low" : "bg-surface-container-lowest"
      } ${startsGroup ? "border-t-2 border-t-outline-variant" : "border-t border-t-outline-variant/25"} ${
        sticky ? "sticky left-0 z-10" : ""
      }`}
    >
      <span className="shrink-0 text-on-surface-variant">{label}</span>
      <span className="min-w-0 text-right font-medium text-on-surface">
        {children}
      </span>
    </div>
  );
}

export function ComparablesGrid({
  subject,
  comparables,
}: {
  subject: Property;
  comparables: Comparable[];
}) {
  const { has, toggle } = useShortlist();

  const columns = `${SUBJECT_W}px repeat(${comparables.length}, ${COL_W}px)`;

  return (
    <div className="h-full overflow-auto scrollbar-slim">
      <div className="grid w-max" style={{ gridTemplateColumns: columns }}>
        {/* ---- Address band (sticks to the top while attributes scroll) --- */}
        <div className="sticky left-0 top-0 z-30 flex h-16 flex-col justify-center border-r border-white/10 bg-primary px-3 text-inverse-on-surface">
          <span className="text-[11px] uppercase tracking-wide text-primary-fixed-dim">
            Subject property
          </span>
          <span className="truncate text-data-sm font-semibold">
            {subject.address}
          </span>
        </div>
        {comparables.map((c) => (
          <div
            key={`head-${c.id}`}
            className="sticky top-0 z-20 flex h-16 flex-col justify-center border-r border-white/10 bg-primary-container px-3 text-inverse-on-surface"
          >
            <span className="line-clamp-2 text-data-sm leading-tight">
              {c.address}
            </span>
            <span className="mt-0.5 flex items-center gap-1 text-[11px] text-primary-fixed-dim">
              <MapPin className="size-3" aria-hidden />
              {formatDistance(c.distanceKm)}
            </span>
          </div>
        ))}

        {/* ---- Photography ------------------------------------------------ */}
        <div className="sticky left-0 z-10 h-32 border-r border-outline-variant/40 bg-surface-container-lowest">
          <PhotoCell property={subject} />
        </div>
        {comparables.map((c) => (
          <div
            key={`img-${c.id}`}
            className="h-32 border-r border-outline-variant/40 bg-surface-container-lowest"
          >
            <PhotoCell property={c} />
          </div>
        ))}

        {/* ---- Action bar -------------------------------------------------- */}
        <div className="sticky left-0 z-10 flex border-r border-white/10 bg-inverse-surface">
          <Link
            href={`/property/${subject.id}`}
            className="flex-1 py-2 text-center text-label-caps uppercase text-inverse-on-surface/80 hover:text-inverse-on-surface"
          >
            Menu
          </Link>
        </div>
        {comparables.map((c) => {
          const picked = has(c.id);
          return (
            <div
              key={`act-${c.id}`}
              className="flex border-r border-white/10 bg-inverse-surface"
            >
              <Link
                href={`/property/${c.id}`}
                className="flex-1 border-r border-white/10 py-2 text-center text-label-caps uppercase text-inverse-on-surface/80 hover:text-inverse-on-surface"
              >
                Menu
              </Link>
              <button
                type="button"
                onClick={() => toggle(c.id)}
                aria-pressed={picked}
                aria-label={
                  picked
                    ? `Remove ${c.address} from shortlist`
                    : `Add ${c.address} to shortlist`
                }
                className={`w-12 transition-colors ${
                  picked
                    ? "bg-secondary text-on-secondary"
                    : "text-inverse-on-surface/80 hover:bg-white/10"
                }`}
              >
                {picked ? (
                  <Check className="mx-auto size-4" aria-hidden />
                ) : (
                  <Plus className="mx-auto size-4" aria-hidden />
                )}
              </button>
            </div>
          );
        })}

        {/* ---- Attribute rows --------------------------------------------- */}
        {ROWS.map((row, i) => {
          const striped = i % 2 === 1;
          return (
            <RowCells
              key={row.label}
              row={row}
              striped={striped}
              subject={subject}
              comparables={comparables}
            />
          );
        })}
      </div>
    </div>
  );
}

function RowCells({
  row,
  striped,
  subject,
  comparables,
}: {
  row: Row;
  striped: boolean;
  subject: Property;
  comparables: Comparable[];
}) {
  return (
    <>
      <Cell
        label={row.label}
        striped={striped}
        startsGroup={row.startsGroup}
        sticky
      >
        {row.subject ? row.subject(subject) : row.value(subject)}
      </Cell>
      {comparables.map((c) => (
        <Cell
          key={`${row.label}-${c.id}`}
          label={row.label}
          striped={striped}
          startsGroup={row.startsGroup}
        >
          {row.value(c)}
        </Cell>
      ))}
    </>
  );
}

function PhotoCell({ property }: { property: Property }) {
  return (
    <div className="relative size-full">
      <Image
        src={property.images[0]}
        alt={`${property.type} at ${property.address}`}
        fill
        sizes="280px"
        className="object-cover"
      />
      <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-sm bg-black/60 px-1.5 py-0.5 font-data text-[10px] text-white">
        <ImageIcon className="size-3" aria-hidden />
        {property.images.length}
      </span>
    </div>
  );
}
