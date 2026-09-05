import type { Metadata } from "next";
import { TopNav } from "@/components/marketing/TopNav";
import { SiteFooter } from "@/components/marketing/Sections";

export const metadata: Metadata = {
  title: "Legal & Terms",
};

export default function LegalPage() {
  return (
    <>
      <TopNav />
      <main className="flex-1">
        {/* Hero section */}
        <div className="border-b border-outline-variant bg-surface-container-lowest px-4 py-12 md:px-8 md:py-20">
          <div className="mx-auto max-w-2xl">
            <h1 className="mb-4 font-headline text-headline-lg text-primary">
              Legal & Terms
            </h1>
            <p className="text-body-md text-on-surface-variant">
              Important disclaimers and terms governing the use of UrbanRise.
            </p>
          </div>
        </div>

        {/* Content sections */}
        <div className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-12 space-y-8 text-body-sm text-on-surface-variant">
          {/* Valuation disclaimer */}
          <section>
            <h2 className="mb-4 font-headline text-headline-md text-primary">
              Valuation Disclaimer
            </h2>
            <p className="mb-3">
              Valuations produced in the UrbanRise platform are{" "}
              <strong>indicative estimates only</strong>. They are not:
            </p>
            <ul className="list-inside list-disc space-y-2 mb-3">
              <li>
                Certified professional appraisals under RICS or GhIS standards
              </li>
              <li>
                Legal, financial, or investment advice
              </li>
              <li>
                Suitable for formal lending, mortgage approval, or legal transactions
              </li>
            </ul>
            <p>
              For any formal transaction, lending decision, or legal matter, you must
              commission an independent professional valuation from a qualified,
              licensed surveyor. UrbanRise valuations are for general reference and
              due diligence only.
            </p>
          </section>

          {/* Data accuracy */}
          <section>
            <h2 className="mb-4 font-headline text-headline-md text-primary">
              Data Accuracy & Liability
            </h2>
            <p className="mb-3">
              UrbanRise makes reasonable efforts to ensure data accuracy:
            </p>
            <ul className="list-inside list-disc space-y-2 mb-3">
              <li>
                Verified properties have been physically inspected by GhIS-registered
                surveyors
              </li>
              <li>
                Data is current as of the inspection or listing date, but may change
              </li>
              <li>
                Users must independently confirm property details, title status, and
                current market prices with agents, owners, or professionals
              </li>
            </ul>
            <p className="mb-3">
              <strong>
                UrbanRise provides no warranty, express or implied, regarding data
                accuracy, completeness, or fitness for any purpose.
              </strong>{" "}
              To the fullest extent permitted by law, UrbanRise shall not be liable for
              any direct, indirect, incidental, special, or consequential damages
              arising out of the use or inability to use the platform or its data.
            </p>
          </section>

          {/* Title status */}
          <section>
            <h2 className="mb-4 font-headline text-headline-md text-primary">
              Title Status
            </h2>
            <p className="mb-3">
              Title status information reflects the property's registration status at
              the time of verification:
            </p>
            <ul className="list-inside list-disc space-y-2 mb-3">
              <li>
                <strong>Registered:</strong> Registered at the Lands Commission and
                verified at inspection
              </li>
              <li>
                <strong>Pending:</strong> Title application in progress with Lands
                Commission
              </li>
              <li>
                <strong>Unregistered:</strong> No current registration; carries higher
                risk
              </li>
              <li>
                <strong>Unknown:</strong> Status not confirmed at time of listing
              </li>
            </ul>
            <p>
              Always independently verify title with the Lands Commission or a
              qualified lawyer before purchase or investment.
            </p>
          </section>

          {/* Eco ratings */}
          <section>
            <h2 className="mb-4 font-headline text-headline-md text-primary">
              Eco Ratings
            </h2>
            <p>
              Eco ratings are assessments of whole-property sustainability and climate
              resilience, performed by GhIS-registered surveyors at inspection. Ratings
              reflect the property's condition at that time and may change with
              maintenance, renovation, or damage. Ratings are informational only and
              do not constitute environmental certification or guarantee of energy
              performance.
            </p>
          </section>

          {/* User conduct */}
          <section>
            <h2 className="mb-4 font-headline text-headline-md text-primary">
              Acceptable Use
            </h2>
            <p className="mb-3">
              You agree not to use UrbanRise to:
            </p>
            <ul className="list-inside list-disc space-y-2 mb-3">
              <li>
                Violate any applicable law or regulation
              </li>
              <li>
                Scrape, automate access, or copy data without permission
              </li>
              <li>
                Harass, threaten, or harm any individual or entity
              </li>
              <li>
                Misrepresent identity or impersonate any person or organization
              </li>
              <li>
                Interfere with or disrupt the platform or its users
              </li>
            </ul>
            <p>
              UrbanRise reserves the right to suspend or terminate access for
              violations.
            </p>
          </section>

          {/* Data sourcing */}
          <section>
            <h2 className="mb-4 font-headline text-headline-md text-primary">
              Data Sourcing
            </h2>
            <p>
              UrbanRise combines professionally verified property data with publicly
              available listings and market intelligence. Verified properties are
              sourced through independent inspections by GhIS-registered surveyors.
              Market data is aggregated from public sources and licensed data
              providers. All data is provided as-is for informational purposes.
            </p>
          </section>

          {/* Changes to terms */}
          <section>
            <h2 className="mb-4 font-headline text-headline-md text-primary">
              Changes to These Terms
            </h2>
            <p>
              UrbanRise reserves the right to modify these terms and disclaimers at
              any time. Your continued use of the platform constitutes acceptance of
              any changes. Please review this page periodically for updates.
            </p>
          </section>

          {/* Contact */}
          <section className="border-t border-outline-variant/30 pt-8">
            <h2 className="mb-4 font-headline text-headline-md text-primary">
              Questions?
            </h2>
            <p>
              For questions about these terms or to report a concern, contact us at
              support@urbanrise.com or +233 (0) 24 XXX XXXX.
            </p>
          </section>

          {/* Last updated */}
          <div className="rounded-lg bg-surface-container-lowest p-4 text-data-xs text-on-surface-variant">
            Last updated: September 2024
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
