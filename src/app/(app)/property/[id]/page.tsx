import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Phone, Bed, Bath, Ruler, Home, Leaf, Building2, CheckCircle, Shield, Sparkles, Users } from "lucide-react";
import {
  EcoBadge,
  GreenFeaturePill,
  StatusChip,
} from "@/components/ui/Badges";
import { Gallery } from "@/components/property/Gallery";
import { SafetyNotice } from "@/components/property/SafetyNotice";
import { formatCedi, formatSqm, pricePerSqm } from "@/lib/format";
import { getLocalityMarket, getPropertyIds, getPropertyById } from "@/lib/data";
import { IS_SINGLE_REGION } from "@/lib/regions";


/**
 * Reference data changes on the order of days, not seconds, so the page is
 * rendered once and reused for five minutes rather than querying Supabase on
 * every request. Without this each visit opened a fresh connection, which the
 * database refuses under concurrency.
 */
export const revalidate = 300;

// Next 16: params is a Promise.
type Params = Promise<{ id: string }>;

export async function generateStaticParams() {
  // getPropertyIds uses a cookie-free client — this runs at build time, where
  // there is no request and `cookies()` would throw.
  try {
    const ids = await getPropertyIds();
    return ids.map((id) => ({ id }));
  } catch (error) {
    // Prerendering listings is an optimisation, not a requirement: without this
    // list the pages simply render on first request instead. Failing the whole
    // deployment because the database was briefly unreachable during the build
    // trades a small performance win for an outage, which is the wrong way
    // round. Logged loudly so a persistent misconfiguration is still visible.
    console.error(
      "[property] Could not prerender listing pages; they will render on demand.",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property) return { title: "Property not found" };
  return {
    title: property.address,
    description: property.summary,
  };
}

export default async function PropertyPage({ params }: { params: Params }) {
  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property) notFound();

  const market = await getLocalityMarket(property.address);
  const rate = pricePerSqm(property.askingPrice, property.floorAreaSqm);

  // How this property's rate sits against its locality — the comparison a
  // buyer and a valuer both reach for first.
  const vsLocality =
    rate && market && market.avgPricePerSqm != null
      ? Math.round(((rate - market.avgPricePerSqm) / market.avgPricePerSqm) * 100)
      : null;

  return (
    <div className="min-h-full min-w-0 bg-gradient-to-br from-surface via-surface-container to-surface">
      <div className="mx-auto w-full min-w-0 max-w-6xl p-4 sm:p-6 md:p-10">
        {/* Navigation */}
        <Link
          href="/search"
          className="mb-4 inline-flex min-h-11 items-center gap-2 font-data text-data-sm text-on-surface-variant hover:text-primary transition-colors group sm:mb-8"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" aria-hidden />
          Back to search
        </Link>

        {/* Gallery Section with Enhanced Styling */}
        <div className="relative mb-6 min-w-0 overflow-hidden rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] ring-1 ring-primary/10 sm:mb-10">
          <Gallery
            images={property.images}
            alt={`${property.type} at ${property.address}`}
          />
          <div className="absolute left-3 top-3 z-20 sm:left-6 sm:top-6">
            <EcoBadge rating={property.ecoRating} />
          </div>
        </div>

        {/* Header Section with Premium Layout */}
        <div className="mb-6 min-w-0 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/2 to-transparent p-5 ring-1 ring-primary/10 sm:mb-10 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="mb-3 wrap-anywhere font-headline text-3xl font-bold text-primary sm:text-5xl">
                {property.address}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex min-w-0 items-start gap-1.5 font-data text-data-sm text-on-surface-variant bg-white/50 dark:bg-white/5 rounded-lg px-3 py-1.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-secondary" aria-hidden />
                  <span className="min-w-0 wrap-anywhere font-medium">
                    {[
                      property.district,
                      IS_SINGLE_REGION ? null : property.region,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </div>
                {property.status && (
                  <StatusChip status={property.status} />
                )}
              </div>
            </div>

            {/* Price Section */}
            <div className="flex min-w-0 flex-col items-start gap-3 sm:items-end">
              <div className="max-w-full wrap-anywhere text-3xl font-bold text-primary sm:text-5xl">
                {formatCedi(property.askingPrice)}
              </div>
              {rate && (
                <div className="flex flex-col items-start gap-2 sm:items-end text-data-sm">
                  <div className="text-on-surface-variant">
                    <span className="font-semibold">₵{rate.toLocaleString("en-GH")}</span>/sqm
                  </div>
                  {vsLocality != null && (
                    <div className={`px-3 py-1.5 rounded-lg font-medium ${
                      vsLocality >= 0
                        ? 'bg-secondary/10 text-secondary'
                        : 'bg-tertiary/10 text-tertiary'
                    }`}>
                      {vsLocality >= 0 ? '📈' : '📉'} {Math.abs(vsLocality)}% vs locality avg
                    </div>
                  )}
                </div>
              )}
              {property.agent.phone && <a href={`tel:${property.agent.phone.replace(/\s/g, "")}`} className="mt-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-on-primary lg:hidden"><Phone className="size-4" aria-hidden />Call agent</a>}
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="mb-6 rounded-xl bg-white/50 dark:bg-white/5 backdrop-blur-sm p-4 ring-1 ring-primary/10 sm:mb-10 sm:p-6">
          <p className="text-body-md leading-relaxed text-on-surface-variant sm:text-body-lg">
            {property.summary}
          </p>
        </div>

      {/* Quick Stats Row */}
      <div className="mb-6 grid min-w-0 grid-cols-2 gap-3 sm:mb-10 sm:grid-cols-4">
        <StatCard icon={<Bed className="size-5" />} label="Bedrooms" value={property.bedrooms} />
        <StatCard icon={<Bath className="size-5" />} label="Bathrooms" value={property.bathrooms} />
        <StatCard icon={<Ruler className="size-5" />} label="Size" value={formatSqm(property.floorAreaSqm)} />
        <StatCard icon={<Building2 className="size-5" />} label="Type" value={property.type} />
      </div>

      {/* Main Details Grid */}
      <div className="mb-6 grid min-w-0 gap-4 sm:mb-10 sm:gap-6 lg:grid-cols-3">
        {/* Left Column: Specs & Location */}
        <div className="min-w-0 space-y-4 sm:space-y-6 lg:col-span-2">
          <Panel icon={<Home className="size-5" />} title="Property Specifications">
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <Field icon={<Home className="size-4" />} label="Property type" value={property.type} />
              <Field icon={<Sparkles className="size-4" />} label="Style" value={property.style} />
              {property.storey && (
                <Field icon={<Building2 className="size-4" />} label="Storey" value={property.storey} />
              )}
              <Field icon={<Ruler className="size-4" />} label="Size" value={formatSqm(property.floorAreaSqm)} />
              {property.condition && (
                <Field icon={<Shield className="size-4" />} label="Condition" value={property.condition} />
              )}
              <Field icon={<CheckCircle className="size-4" />} label="Furnishing" value={property.furnishing ?? "Not specified"} />
              {property.selfContained && (
                <Field icon={<Home className="size-4" />} label="Self-contained" value="Yes" />
              )}
              {property.toilets != null && (
                <Field icon={<Bath className="size-4" />} label="Toilets" value={String(property.toilets)} />
              )}
            </div>
          </Panel>

          <Panel icon={<MapPin className="size-5" />} title="Location Details">
            <Field icon={<MapPin className="size-4" />} label="Address" value={property.address} />
            <Field icon={<MapPin className="size-4" />} label="District" value={property.district} />
            {!IS_SINGLE_REGION && (
              <Field icon={<MapPin className="size-4" />} label="Region" value={property.region} />
            )}
          </Panel>

          <Panel icon={<Shield className="size-5" />} title="Tenure & Status">
            <Field icon={<Shield className="size-4" />} label="Tenure" value={property.tenure} />
            {property.remainingLeaseTerm && (
              <Field icon={<Shield className="size-4" />} label="Remaining lease term" value={property.remainingLeaseTerm} />
            )}
            <Field icon={<CheckCircle className="size-4" />} label="Status" value={property.status} />
          </Panel>
        </div>

        {/* Right Column: Agent Contact Card */}
        <div id="agent-contact" className="min-w-0 scroll-mt-4">
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 ring-1 ring-primary/20 backdrop-blur-sm sm:p-6 lg:sticky lg:top-6">
            <div className="flex items-center gap-3 mb-6">
              <Users className="size-6 text-primary" aria-hidden />
              <h3 className="font-headline text-headline-md text-primary">Agent Contact</h3>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg bg-white/70 dark:bg-white/5 p-4">
                <p className="text-data-xs text-on-surface-variant uppercase tracking-wide font-semibold mb-1">Agent</p>
                <p className={`text-body-md font-semibold ${
                  property.agent.name === "Unknown" ? "text-on-surface-variant" : "text-on-surface"
                }`}>
                  {property.agent.name}
                </p>
              </div>

              {property.agent.phone && (
                <a
                  href={`tel:${property.agent.phone.replace(/\s/g, "")}`}
                  className="block rounded-lg bg-gradient-to-r from-primary/80 to-primary/60 hover:from-primary hover:to-primary/80 text-white p-4 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
                >
                  <p className="text-data-xs text-white/80 uppercase tracking-wide font-semibold mb-2">Primary Phone</p>
                  <div className="flex items-center gap-2">
                    <Phone className="size-5" aria-hidden />
                    <span className="text-body-md font-semibold">{property.agent.phone}</span>
                  </div>
                </a>
              )}

              {property.agent.secondaryPhone && (
                <a
                  href={`tel:${property.agent.secondaryPhone.replace(/\s/g, "")}`}
                  className="block rounded-lg bg-secondary/60 hover:bg-secondary text-white p-4 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/30"
                >
                  <p className="text-data-xs text-white/80 uppercase tracking-wide font-semibold mb-2">Alternative Phone</p>
                  <div className="flex items-center gap-2">
                    <Phone className="size-5" aria-hidden />
                    <span className="text-body-md font-semibold">{property.agent.secondaryPhone}</span>
                  </div>
                </a>
              )}
            </div>

            <div className="mt-6 p-4 bg-tertiary/10 rounded-lg border border-tertiary/20">
              <p className="text-data-xs text-tertiary font-semibold mb-1">💡 Pro Tip</p>
              <p className="text-data-sm text-on-surface-variant">Contact the agent to schedule a viewing or get more information about this property.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Facilities Section */}
      {property.facilities && property.facilities.length > 0 && (
        <section className="mb-6 min-w-0 rounded-2xl bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent p-4 ring-1 ring-secondary/20 sm:mb-10 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="size-6 text-secondary" aria-hidden />
            <h2 className="min-w-0 font-headline text-xl font-semibold text-primary sm:text-headline-lg">
              Facilities & Amenities
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {property.facilities.map((facility) => (
              <span
                key={facility}
                className="max-w-full wrap-anywhere rounded-full bg-white/70 dark:bg-white/10 px-3 py-2 font-data text-data-sm font-medium text-secondary hover:bg-white/90 dark:hover:bg-white/20 transition-colors border border-secondary/20 sm:px-4"
              >
                ✓ {facility}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Sustainability Section */}
      <section className="mb-6 min-w-0 rounded-2xl bg-gradient-to-br from-tertiary/10 via-tertiary/5 to-transparent p-4 ring-1 ring-tertiary/20 sm:mb-10 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Leaf className="size-6 text-tertiary" aria-hidden />
          <h2 className="min-w-0 font-headline text-xl font-semibold text-primary sm:text-headline-lg">
            Sustainability & Green Features
          </h2>
        </div>

        <div className="rounded-xl bg-white/70 dark:bg-white/5 p-4 mb-6 border border-tertiary/20 sm:p-6">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <EcoBadge rating={property.ecoRating} />
            <div>
              <p className="font-data text-data-sm text-on-surface-variant mb-1">
                Energy & Resource Efficiency Rating
              </p>
              <p className="font-headline text-headline-sm text-primary font-semibold">
                Band {property.ecoRating}
              </p>
            </div>
          </div>
        </div>

        {property.greenFeatures.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {property.greenFeatures.map((feature) => (
              <div key={feature.label} className="rounded-lg bg-white/70 dark:bg-white/5 p-4 border border-tertiary/20 hover:border-tertiary/50 transition-colors">
                <GreenFeaturePill feature={feature} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Safety Notice */}
      <div className="mb-10">
        <SafetyNotice />
      </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-outline-variant/40 bg-gradient-to-br from-surface-container-lowest to-surface-container-lowest/50 p-4 hover:border-primary/30 hover:shadow-lg transition-all duration-300 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        {icon && (
          <div className="shrink-0 text-primary">{icon}</div>
        )}
        <h2 className="min-w-0 font-headline text-xl font-semibold text-primary sm:text-headline-md">
          {title}
        </h2>
      </div>
      <dl className="space-y-3">{children}</dl>
    </section>
  );
}

function Field({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-1.5 rounded-lg bg-white/30 px-3 py-3 font-data text-data-sm transition-colors hover:bg-white/50 dark:bg-white/5 dark:hover:bg-white/10 sm:grid-cols-2 sm:gap-3">
      <div className="flex min-w-0 items-start gap-2">
        {icon && (
          <span className="text-secondary mt-0.5 shrink-0">{icon}</span>
        )}
        <dt className="text-on-surface-variant font-medium">{label}</dt>
      </div>
      <dd className="min-w-0 wrap-anywhere pl-6 font-semibold text-on-surface sm:pl-0 sm:text-right">{value}</dd>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-3 ring-1 ring-primary/20 hover:ring-primary/40 hover:shadow-lg transition-all duration-300 cursor-default sm:p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-primary">{icon}</div>
        <p className="text-data-xs text-on-surface-variant font-semibold uppercase tracking-wide">{label}</p>
      </div>
      <p className="wrap-anywhere text-lg font-bold text-primary">{value}</p>
    </div>
  );
}
