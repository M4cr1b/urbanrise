import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bath,
  BedDouble,
  Compass,
  Leaf,
  LineChart,
  Ruler,
  ShieldCheck,
  Sun,
  Users,
} from "lucide-react";
import { EcoBadge, VerifiedBadge } from "@/components/ui/Badges";
import { formatCedi, formatCediCompact, formatSqm, formatPct } from "@/lib/format";
import type { Property } from "@/lib/types";

/* ---------------------------------------------------------------------------
   Hero copy — the left column of the landing stage.
   ------------------------------------------------------------------------ */

export function HeroCopy({ children }: { children?: React.ReactNode }) {
  return (
    <div>
      <h1 className="mb-4 font-headline text-headline-lg text-primary md:mb-6 md:text-headline-xl">
        Live well. Build green. Buy smart.
      </h1>
      <p className="mb-5 max-w-2xl text-body-md text-on-surface-variant md:mb-8 md:text-body-lg">
        Discover Ghana&apos;s most trusted, verified, and eco-rated homes.
        Sustainable living starts with better data.
      </p>
      <div className="mb-6 flex items-center gap-2 font-data text-data-sm text-on-surface-variant md:mb-8">
        <ShieldCheck className="size-4 shrink-0 text-secondary" aria-hidden />
        Every listing verified by GhIS-registered surveyors.
      </div>
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   The panel that grows out of the portal.

   It sits on the same surface colour the document continues in, so when the
   runway ends and the stage unsticks the join is invisible.
   ------------------------------------------------------------------------ */

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Verified listings",
    body: "Every record checked against Lands Commission title and signed off by a GhIS-registered surveyor.",
    href: "/search",
  },
  {
    icon: LineChart,
    title: "Market intelligence",
    body: "Median prices, cedi per square metre and year-on-year movement for every locality.",
    href: "/market",
  },
  {
    icon: Users,
    title: "Estate professionals",
    body: "Valuers, lawyers, architects and engineers — the whole transaction chain in one directory.",
    href: "/professionals",
  },
  {
    icon: Leaf,
    title: "Green building hub",
    body: "Certified sustainable materials and suppliers, with the carbon saving against conventional stated.",
    href: "/green-hub",
  },
];

/**
 * Sizing note: this panel is pinned inside a 100vh stage during the reveal, so
 * it has to fit a phone viewport without scrolling — hence the two-column
 * pillar grid and tighter type below `md`, rather than the single column the
 * cards would otherwise fall into.
 */
export function PortalPanel() {
  return (
    <section className="topo-bg flex h-full items-center overflow-hidden bg-surface">
      <div className="mx-auto w-full max-w-container-max px-margin-mobile py-8 md:px-margin-desktop md:py-12">
        <p className="mb-2 text-label-caps text-secondary md:mb-3">
          One platform, the whole market
        </p>
        <h2 className="mb-3 max-w-3xl font-headline text-headline-lg text-primary md:mb-4 md:text-headline-xl">
          Ghana&apos;s property information, finally in one place.
        </h2>
        <p className="mb-6 max-w-2xl text-body-md text-on-surface-variant md:mb-10 md:text-body-lg">
          Listings, comparable evidence, professional services and sustainable
          building resources — consolidated, verified and open.
        </p>

        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {PILLARS.map(({ icon: Icon, title, body, href }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-xl border border-primary/10 bg-surface-container-lowest p-4 transition-shadow hover:shadow-[var(--shadow-level-2)] md:p-6"
            >
              <Icon
                className="mb-2 size-6 text-secondary md:mb-4 md:size-7"
                aria-hidden
              />
              <h3 className="mb-1.5 font-headline text-body-md font-semibold text-primary md:mb-2 md:text-headline-md">
                {title}
              </h3>
              <p className="font-data text-[11px] leading-snug text-on-surface-variant md:text-data-sm">
                {body}
              </p>
              <span className="mt-4 hidden items-center gap-1 text-label-caps text-secondary opacity-0 transition-opacity group-hover:opacity-100 md:inline-flex">
                Explore <ArrowRight className="size-3.5" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Stats band
   ------------------------------------------------------------------------ */

export interface NationalStats {
  verifiedListings: number;
  medianGreaterAccra: number;
  medianGreaterAccraYoy: number;
  avgPerSqmEastLegon: number;
}

export function StatsBand({ stats }: { stats: NationalStats }) {
  return (
    <section className="border-y border-outline-variant/30 bg-surface-bright py-4">
      <div className="mx-auto flex max-w-container-max flex-wrap items-center justify-between gap-4 px-margin-mobile font-data text-data-sm text-on-surface md:px-margin-desktop">
        <div className="flex items-center gap-2">
          <Compass className="size-4 text-primary" aria-hidden />
          {stats.verifiedListings.toLocaleString("en-GH")} verified listings
        </div>
        <div className="flex items-center gap-2">
          <span className="text-on-surface-variant">Median · Greater Accra</span>
          <span className="font-semibold">
            {formatCediCompact(stats.medianGreaterAccra)}
          </span>
          <span
            className={
              stats.medianGreaterAccraYoy >= 0 ? "text-secondary" : "text-error"
            }
          >
            {formatPct(stats.medianGreaterAccraYoy)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-on-surface-variant">Avg ₵/sqm · East Legon</span>
          <span className="font-semibold">
            ₵{stats.avgPerSqmEastLegon.toLocaleString("en-GH")}
          </span>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Featured homes
   ------------------------------------------------------------------------ */

export function PropertyCard({
  property,
  priority = false,
}: {
  property: Property;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/property/${property.id}`}
      className="group overflow-hidden rounded-xl border border-primary/10 bg-surface-container-lowest transition-shadow hover:shadow-[var(--shadow-level-2)]"
    >
      <div className="relative h-64 overflow-hidden">
        <Image
          src={property.images[0]}
          alt={`${property.type} at ${property.address}`}
          fill
          // On phones the search card moves below the reveal, which pulls the
          // first featured card up into the LCP slot.
          priority={priority}
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <EcoBadge rating={property.ecoRating} className="absolute left-4 top-4" />
        {property.verifiedBy && (
          <VerifiedBadge className="absolute bottom-4 left-4" />
        )}
      </div>
      <div className="relative p-6">
        <div className="topo-bg pointer-events-none absolute bottom-0 right-0 size-24 opacity-30" />
        <div className="mb-1 font-data text-data-lg text-primary">
          {formatCedi(property.askingPrice)}
        </div>
        <div className="mb-4 text-body-md text-on-surface">
          {property.bedrooms}-Bed {property.style}, {property.locality}
        </div>
        <div className="flex items-center gap-4 border-t border-outline-variant/30 pt-4 font-data text-data-sm text-on-surface-variant">
          <span className="flex items-center gap-1">
            <BedDouble className="size-4" aria-hidden /> {property.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="size-4" aria-hidden /> {property.bathrooms}
          </span>
          <span className="flex items-center gap-1">
            <Ruler className="size-4" aria-hidden />{" "}
            {formatSqm(property.floorAreaSqm)}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function FeaturedHomes({ properties }: { properties: Property[] }) {
  return (
    <section className="mx-auto max-w-container-max px-margin-mobile py-section-gap md:px-margin-desktop">
      <div className="mb-10 flex items-end justify-between">
        <h2 className="font-headline text-headline-lg text-primary">
          Featured homes
        </h2>
        <Link
          href="/search"
          className="flex items-center gap-1 font-data text-data-sm text-secondary hover:underline"
        >
          View all <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
      <div className="grid gap-gutter md:grid-cols-3">
        {properties.map((p, i) => (
          <PropertyCard key={p.id} property={p} priority={i === 0} />
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Green Building Hub teaser
   ------------------------------------------------------------------------ */

export function GreenHubTeaser() {
  return (
    <section className="relative overflow-hidden bg-surface-container-low py-section-gap">
      <div className="topo-bg absolute inset-0 opacity-40" />
      <div className="relative mx-auto grid max-w-container-max items-center gap-gutter px-margin-mobile md:grid-cols-2 md:px-margin-desktop">
        <div>
          <h2 className="mb-4 font-headline text-headline-lg text-primary">
            Green Building Hub
          </h2>
          <p className="mb-8 text-body-lg text-on-surface-variant">
            Access our directory of certified sustainable materials, local
            suppliers, and green construction professionals. Build smarter,
            reduce your carbon footprint, and increase your property&apos;s
            long-term value.
          </p>
          <Link
            href="/green-hub"
            className="btn-leaf flex w-fit items-center gap-2 rounded-md border border-primary px-6 py-3 text-body-md text-primary hover:bg-primary/5"
          >
            Explore the Green Hub
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-primary/10 bg-surface-container-lowest p-6 shadow-[var(--shadow-level-2)]">
            <Compass className="mb-4 size-8 text-tertiary-container" aria-hidden />
            <h3 className="mb-2 font-headline text-headline-md text-primary">
              Architects
            </h3>
            <p className="font-data text-data-sm text-on-surface-variant">
              Find EDGE-certified design professionals.
            </p>
          </div>
          <div className="mt-8 rounded-xl border border-primary/10 bg-surface-container-lowest p-6 shadow-[var(--shadow-level-2)]">
            <Sun className="mb-4 size-8 text-secondary" aria-hidden />
            <h3 className="mb-2 font-headline text-headline-md text-primary">
              Energy
            </h3>
            <p className="font-data text-data-sm text-on-surface-variant">
              Solar and renewable power suppliers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Footer
   ------------------------------------------------------------------------ */

const FOOTER_COLUMNS = [
  {
    heading: "Property",
    links: [
      { href: "/search", label: "Buy" },
      { href: "/search?intent=rent", label: "Rent" },
      { href: "/search?intent=new", label: "New Developments" },
    ],
  },
  {
    heading: "Insights",
    links: [
      { href: "/market", label: "Market Intelligence" },
      { href: "/comparables", label: "Comparables & Valuation" },
      { href: "/green-hub", label: "Green Building Hub" },
    ],
  },
  {
    heading: "Connect",
    links: [
      { href: "/professionals", label: "Find a Professional" },
      { href: "/professionals", label: "Contact Us" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-outline-variant/30 bg-surface-container-low">
      <div className="mx-auto grid max-w-container-max grid-cols-6 gap-gutter px-margin-mobile py-section-gap md:px-margin-desktop">
        <div className="col-span-6 flex flex-col gap-4 md:col-span-2">
          <div className="flex items-center gap-2 font-headline text-headline-md font-bold text-primary">
            <Leaf className="size-6" aria-hidden />
            UrbanRise
          </div>
          <p className="mt-4 max-w-sm text-body-md text-on-surface-variant">
            Sustainable Urban Development.
            <br />
            Empowering smarter property decisions in Ghana.
          </p>
          <p className="mt-8 font-data text-data-sm text-on-surface-variant">
            © 2026 UrbanRise Ghana. Sustainable Urban Development.
          </p>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <div key={col.heading} className="col-span-3 md:col-span-1">
            <h4 className="mb-4 font-data text-data-sm font-semibold uppercase tracking-wider text-primary">
              {col.heading}
            </h4>
            <ul className="flex flex-col gap-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-body-md text-on-surface-variant transition-colors hover:text-primary hover:underline hover:decoration-secondary"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
