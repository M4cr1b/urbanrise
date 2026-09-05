import type { Metadata } from "next";
import Link from "next/link";
import { TopNav } from "@/components/marketing/TopNav";
import { SiteFooter } from "@/components/marketing/Sections";
import { HelpCircle, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Help & FAQ",
};

export default function HelpPage() {
  return (
    <>
      <TopNav />
      <main className="flex-1">
        {/* Hero section */}
        <div className="border-b border-outline-variant bg-surface-container-lowest px-4 py-12 md:px-8 md:py-20">
          <div className="mx-auto max-w-2xl">
            <h1 className="mb-4 font-headline text-headline-lg text-primary">
              Help & FAQ
            </h1>
            <p className="text-body-md text-on-surface-variant">
              Answers to common questions about search, valuations, sustainability
              ratings, and verification.
            </p>
          </div>
        </div>

        {/* Content sections */}
        <div className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-12">
          {/* Search */}
          <section className="mb-10 border-b border-outline-variant/30 pb-10">
            <h2 className="mb-4 font-headline text-headline-md text-primary">
              How to Search
            </h2>
            <div className="space-y-4 text-body-sm text-on-surface-variant">
              <div>
                <h3 className="mb-2 font-semibold text-on-surface">
                  What can I search for?
                </h3>
                <p>
                  You can search by address, locality (e.g., "East Legon"),
                  district, or region. Start typing to see matching properties in
                  real time. You can also filter by property type, bedrooms, price
                  range, tenure, title status, and eco rating.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-on-surface">
                  What are featured properties?
                </h3>
                <p>
                  When you click the search bar, featured properties appear before
                  you type. These are our professionally photographed and verified
                  listings. Continue typing to narrow the results to what you're
                  looking for.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-on-surface">
                  How do I view all properties?
                </h3>
                <p>
                  Click "View all" in the search dropdown to see the full list with
                  all filters applied. You can also use the "View All" toggle on
                  the search results page to remove all filters and see every
                  property on the platform.
                </p>
              </div>
            </div>
          </section>

          {/* Comparables & valuation */}
          <section className="mb-10 border-b border-outline-variant/30 pb-10">
            <h2 className="mb-4 font-headline text-headline-md text-primary">
              Comparables & Valuation
            </h2>
            <div className="space-y-4 text-body-sm text-on-surface-variant">
              <div>
                <h3 className="mb-2 font-semibold text-on-surface">
                  What is the Comparables tool?
                </h3>
                <p>
                  The Comparables tool helps you value a property by comparing it
                  to similar properties that have sold or are on the market nearby.
                  You select evidence properties (comparables), analyze their rates
                  per square metre, and then form an indicative opinion of value
                  for the subject property.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-on-surface">
                  What are the six stages of valuation?
                </h3>
                <p className="mb-2">
                  The platform guides you through a six-stage workflow:
                </p>
                <ol className="list-inside list-decimal space-y-1">
                  <li>
                    <strong>Comparables:</strong> Review all comparable evidence
                    and shortlist the most relevant.
                  </li>
                  <li>
                    <strong>Shortlist:</strong> Confirm which comparables you want
                    to use for analysis.
                  </li>
                  <li>
                    <strong>Analysis:</strong> Review median rates and key statistics
                    across your shortlist.
                  </li>
                  <li>
                    <strong>Rationale:</strong> Document the reasoning behind your
                    analysis and any adjustments.
                  </li>
                  <li>
                    <strong>Valuation:</strong> Set your opinion of value for the
                    subject property.
                  </li>
                  <li>
                    <strong>Submit:</strong> Review and submit your final valuation
                    to the case file.
                  </li>
                </ol>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-on-surface">
                  Is this a professional appraisal?
                </h3>
                <p>
                  No. The UrbanRise valuation tool produces an{" "}
                  <strong>indicative estimate</strong> based on market comparables,
                  not a certified RICS or GhIS professional appraisal. For formal
                  lending or legal transactions, you must commission an independent
                  professional valuation from a qualified surveyor.
                </p>
              </div>
            </div>
          </section>

          {/* Eco ratings */}
          <section className="mb-10 border-b border-outline-variant/30 pb-10">
            <h2 className="mb-4 font-headline text-headline-md text-primary">
              Eco Ratings
            </h2>
            <div className="space-y-4 text-body-sm text-on-surface-variant">
              <div>
                <h3 className="mb-2 font-semibold text-on-surface">
                  What do the A–G eco ratings mean?
                </h3>
                <p>
                  Each property is rated on a whole-property sustainability scale
                  from A (most efficient) to G (least efficient). The rating
                  considers the building envelope, materials, energy systems, water
                  management, and site sustainability. An A or B property is more
                  resilient, lower-cost to operate, and more attractive to lenders
                  and tenants.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-on-surface">
                  How is the rating calculated?
                </h3>
                <p>
                  Each property is assessed by a GhIS-registered surveyor using a
                  standardized framework covering thermal performance, insulation,
                  renewable energy, water efficiency, materials sourcing, and site
                  resilience. The rating is independent of market price.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-on-surface">
                  Why does eco rating matter?
                </h3>
                <p>
                  Operating costs, climate resilience, and tenant/buyer appeal are
                  all influenced by eco performance. Green properties command higher
                  rents, lower vacancy, and often higher sale prices. The rating
                  makes this visible upfront.
                </p>
              </div>
            </div>
          </section>

          {/* Verification */}
          <section className="mb-10 border-b border-outline-variant/30 pb-10">
            <h2 className="mb-4 font-headline text-headline-md text-primary">
              Verification & Data Quality
            </h2>
            <div className="space-y-4 text-body-sm text-on-surface-variant">
              <div>
                <h3 className="mb-2 font-semibold text-on-surface">
                  What does "Verified" mean?
                </h3>
                <p>
                  A verified property has been physically inspected and assessed by
                  a GhIS (Ghana Institution of Surveyors)-registered surveyor. The
                  surveyor has confirmed title status, property condition, area
                  measurements, and sustainability features. Verified properties are
                  more reliable for valuation and lending decisions.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-on-surface">
                  What if a property is not verified?
                </h3>
                <p>
                  Unverified properties are based on public listings or data
                  imports but have not been independently inspected. Use them for
                  market research, but prefer verified properties for
                  valuation comparables and lending decisions.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-on-surface">
                  How accurate is the data?
                </h3>
                <p>
                  Verified properties are very accurate — they have been
                  professionally inspected. Listing details are current as of the
                  inspection date, but prices and availability may change. Always
                  confirm current status with the listing agent or owner.
                </p>
              </div>
            </div>
          </section>

          {/* Contact / Support */}
          <section>
            <h2 className="mb-4 font-headline text-headline-md text-primary">
              Still Need Help?
            </h2>
            <div className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-6">
              <p className="mb-4 text-body-sm text-on-surface-variant">
                If you have a question not covered here, please reach out via:
              </p>
              <div className="space-y-2 font-data text-data-sm">
                <div>
                  <strong className="text-on-surface">Email:</strong>
                  <br />
                  support@urbanrise.com
                </div>
                <div>
                  <strong className="text-on-surface">Phone:</strong>
                  <br />
                  +233 (0) 24 XXX XXXX
                </div>
              </div>
              <p className="mt-4 text-body-sm text-on-surface-variant">
                You can also browse our{" "}
                <Link href="/professionals" className="text-primary hover:underline">
                  Professionals Directory
                </Link>{" "}
                to connect with a verified agent or surveyor.
              </p>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
