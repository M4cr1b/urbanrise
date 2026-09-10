import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Phone } from "lucide-react";
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
    rate && market ? Math.round(((rate - market.avgPricePerSqm) / market.avgPricePerSqm) * 100) : null;

  return (
    <div className="mx-auto max-w-5xl p-6 md:p-8">
      <Link
        href="/search"
        className="mb-6 inline-flex items-center gap-2 font-data text-data-sm text-on-surface-variant hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to search
      </Link>

      <div className="relative">
        <Gallery
          images={property.images}
          alt={`${property.type} at ${property.address}`}
        />
        <EcoBadge
          rating={property.ecoRating}
          className="pointer-events-none absolute left-4 top-4 z-10"
        />
      </div>

      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-headline text-headline-lg text-primary">
            {property.address}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 font-data text-data-sm text-on-surface-variant">
            <MapPin className="size-4" aria-hidden />
            {[
              property.district,
              IS_SINGLE_REGION ? null : property.region,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <div className="text-right">
          <div className="font-data text-headline-lg text-primary">
            {formatCedi(property.askingPrice)}
          </div>
          {rate && (
            <div className="font-data text-data-sm text-on-surface-variant">
              ₵{rate.toLocaleString("en-GH")}/sqm
              {/* Deliberately neutral ink: a rate above the locality average is
                  good news to a seller and bad news to a buyer, so the figure
                  states the direction and leaves the judgement to the reader. */}
              {vsLocality != null && (
                <span>
                  {" "}
                  ({vsLocality >= 0 ? "▲" : "▼"} {Math.abs(vsLocality)}% vs
                  locality)
                </span>
              )}
            </div>
          )}
          <div className="mt-2 flex justify-end">
            <StatusChip status={property.status} />
          </div>
        </div>
      </header>

      <p className="mb-8 max-w-3xl text-body-lg text-on-surface-variant">
        {property.summary}
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Panel title="Specs">
          <Field label="Property type" value={property.type} />
          <Field label="Property style" value={property.style} />
          {property.storey && <Field label="Storey" value={property.storey} />}
          <Field label="Property size" value={formatSqm(property.floorAreaSqm)} />
          {property.condition && <Field label="Condition" value={property.condition} />}
          <Field label="Furnishing" value={property.furnishing ?? "Not specified"} />
          {property.selfContained && <Field label="Self-contained" value="Yes" />}
          <Field label="Bedrooms" value={String(property.bedrooms)} />
          <Field label="Bathrooms" value={String(property.bathrooms)} />
          {property.toilets != null && <Field label="Toilets" value={String(property.toilets)} />}
        </Panel>

        <Panel title="Location">
          <Field label="Address" value={property.address} />
          <Field label="District" value={property.district} />
          {!IS_SINGLE_REGION && <Field label="Region" value={property.region} />}
        </Panel>

        <Panel title="Tenure & Status">
          <Field label="Tenure" value={property.tenure} />
          {property.remainingLeaseTerm && (
            <Field label="Remaining lease term" value={property.remainingLeaseTerm} />
          )}
          <Field label="Status" value={property.status} />
        </Panel>

        <Panel title="Agent & Contact">
          <Field label="Agent" value={property.agent.name} />
          <Field
            label="Telephone"
            value={
              <a
                href={`tel:${property.agent.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-1.5 text-primary hover:underline"
              >
                <Phone className="size-3.5" aria-hidden />
                {property.agent.phone}
              </a>
            }
          />
          {property.agent.secondaryPhone && (
            <Field
              label="Alternative telephone"
              value={
                <a
                  href={`tel:${property.agent.secondaryPhone.replace(/\s/g, "")}`}
                  className="flex items-center gap-1.5 text-primary hover:underline"
                >
                  <Phone className="size-3.5" aria-hidden />
                  {property.agent.secondaryPhone}
                </a>
              }
            />
          )}
        </Panel>
      </div>

      {property.facilities && property.facilities.length > 0 && (
        <section className="mt-6 rounded-md border border-outline-variant/60 bg-surface-container-lowest p-5">
          <h2 className="mb-4 font-headline text-headline-md text-primary">
            Facilities
          </h2>
          <div className="flex flex-wrap gap-2">
            {property.facilities.map((facility) => (
              <span
                key={facility}
                className="rounded-full bg-surface-container-high px-3 py-1 font-data text-data-sm text-on-surface"
              >
                {facility}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6 rounded-md border border-outline-variant/60 bg-surface-container-lowest p-5">
        <h2 className="mb-4 font-headline text-headline-md text-primary">
          Sustainability
        </h2>
        <div className="mb-4 flex items-center gap-3">
          <EcoBadge rating={property.ecoRating} />
          <span className="font-data text-data-sm text-on-surface-variant">
            Energy and resource efficiency band
          </span>
        </div>
        {property.greenFeatures.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {property.greenFeatures.map((feature) => (
              <GreenFeaturePill key={feature.label} feature={feature} />
            ))}
          </div>
        )}
      </section>

      <SafetyNotice />
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-outline-variant/60 bg-surface-container-lowest p-5">
      <h2 className="mb-3 font-headline text-headline-md text-primary">
        {title}
      </h2>
      <dl className="divide-y divide-outline-variant/40">{children}</dl>
    </section>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 font-data text-data-sm">
      <dt className="text-on-surface-variant">{label}</dt>
      <dd className="text-right font-medium text-on-surface">{value}</dd>
    </div>
  );
}
