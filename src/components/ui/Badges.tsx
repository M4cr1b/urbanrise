import {
  BatteryCharging,
  Droplets,
  Leaf,
  Recycle,
  ShieldCheck,
  Sun,
  Wind,
} from "lucide-react";
import type {
  EcoRating,
  GreenFeature,
  ListingStatus,
  TitleStatus,
} from "@/lib/types";

/* ---------------------------------------------------------------------------
   Sustainability badge — the leaf shape from the design system's "Calculated
   Organic" language. A/B read as achievement, E–G as a flag.
   ------------------------------------------------------------------------ */

const ECO_TONE: Record<EcoRating, string> = {
  A: "bg-secondary text-on-secondary",
  B: "bg-secondary-container text-on-secondary-container",
  C: "bg-tertiary-fixed text-on-tertiary-fixed",
  D: "bg-surface-container-high text-on-surface-variant",
  E: "bg-surface-container-high text-on-surface-variant",
  F: "bg-error-container text-on-error-container",
  G: "bg-error-container text-on-error-container",
};

export function EcoBadge({
  rating,
  className = "",
}: {
  rating: EcoRating;
  className?: string;
}) {
  return (
    <span
      // The ring keeps the paler D–G tones legible over photography, where a
      // low-chroma badge otherwise vanishes into a bright sky.
      className={`leaf-badge inline-flex items-center gap-1 px-3 py-1 text-label-caps font-body shadow-sm ring-1 ring-black/10 ${ECO_TONE[rating]} ${className}`}
    >
      <Leaf className="size-3.5" aria-hidden />
      Eco {rating}
    </span>
  );
}

/* ---------------------------------------------------------------------------
   Verification — the platform's core promise is that a record was checked by a
   GhIS-registered surveyor, so it gets its own mark.
   ------------------------------------------------------------------------ */

export function VerifiedBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded bg-surface/90 px-2 py-1 text-label-caps font-body text-primary backdrop-blur-sm ${className}`}
    >
      <ShieldCheck className="size-3.5 text-secondary" aria-hidden />
      Verified
    </span>
  );
}

/* ---------------------------------------------------------------------------
   Listing status — mirrors the reference tool's colour logic: sold reads hot,
   available reads green, under offer sits between.
   ------------------------------------------------------------------------ */

const STATUS_TONE: Record<ListingStatus, string> = {
  Available: "bg-secondary text-on-secondary",
  "Under Offer": "bg-tertiary-fixed text-on-tertiary-fixed",
  Sold: "bg-error text-on-error",
};

export function StatusChip({
  status,
  className = "",
}: {
  status: ListingStatus;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-data-xs font-data font-semibold ${STATUS_TONE[status]} ${className}`}
    >
      {status}
    </span>
  );
}

/* ---------------------------------------------------------------------------
   Title status — unregistered title is the single biggest risk signal in the
   Ghanaian market, so it is never rendered as neutral text.
   ------------------------------------------------------------------------ */

const TITLE_TONE: Record<TitleStatus, string> = {
  Registered: "text-secondary",
  Pending: "text-on-tertiary-fixed-variant",
  Unregistered: "text-error",
  Unknown: "text-outline",
};

export function TitleStatusText({ status }: { status: TitleStatus }) {
  return (
    <span className={`font-data text-data-sm font-semibold ${TITLE_TONE[status]}`}>
      {status}
    </span>
  );
}

/* ---------------------------------------------------------------------------
   Green feature pills
   ------------------------------------------------------------------------ */

const FEATURE_ICON = {
  sun: Sun,
  droplets: Droplets,
  wind: Wind,
  recycle: Recycle,
  leaf: Leaf,
  "battery-charging": BatteryCharging,
} as const;

export function GreenFeaturePill({ feature }: { feature: GreenFeature }) {
  const Icon = FEATURE_ICON[feature.icon];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/60 bg-surface-container-low px-3 py-1 text-data-sm text-on-surface-variant">
      <Icon className="size-3.5 text-secondary" aria-hidden />
      {feature.label}
    </span>
  );
}
