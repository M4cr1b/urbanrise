import type { Metadata } from "next";
import { TopNav } from "@/components/marketing/TopNav";
import { SiteFooter } from "@/components/marketing/Sections";

export const metadata: Metadata = {
  title: "About UrbanRise",
};

export default function AboutPage() {
  return (
    <>
      <TopNav />
      <main className="flex-1">
        {/* Hero section */}
        <div className="border-b border-outline-variant bg-surface-container-lowest px-4 py-12 md:px-8 md:py-20">
          <div className="mx-auto max-w-2xl">
            <h1 className="mb-4 font-headline text-headline-lg text-primary">
              About UrbanRise
            </h1>
            <p className="text-body-md text-on-surface-variant">
              A verified, eco-rated property data platform for Ghana. We bring clarity
              to a market historically clouded by opacity and risk.
            </p>
          </div>
        </div>

        {/* Content sections */}
        <div className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-12">
          {/* Mission */}
          <section className="mb-12">
            <h2 className="mb-4 font-headline text-headline-md text-primary">
              Our Mission
            </h2>
            <p className="mb-4 text-body-md text-on-surface-variant">
              Title-status risk and price opacity are the two biggest barriers to
              efficient property markets in Ghana. Buyers, lenders, and valuers
              waste time and money vetting titles that should be routine, and
              negotiating prices with almost no market reference data. This cost
              is borne by everyone — the buyer, the seller, the formal economy,
              and the government.
            </p>
            <p className="text-body-md text-on-surface-variant">
              UrbanRise exists to fix that. Every property on this platform has
              been verified by a GhIS-registered surveyor and rated on a
              whole-property sustainability scale. We make the hidden risks and
              values visible, so transactions can move faster, fairer, and better.
            </p>
          </section>

          {/* Coverage */}
          <section className="mb-12">
            <h2 className="mb-4 font-headline text-headline-md text-primary">
              Current Coverage
            </h2>
            <p className="text-body-md text-on-surface-variant">
              UrbanRise currently covers Greater Accra, Ghana's largest and most
              dynamic property market. Every listing and every comparable evidence
              property on this platform has been verified by a GhIS-registered
              surveyor.
            </p>
          </section>

          {/* Four pillars */}
          <section>
            <h2 className="mb-6 font-headline text-headline-md text-primary">
              How It Works
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Pillar 1 */}
              <div className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-6">
                <div className="mb-3 text-headline-sm font-headline text-primary">
                  Verified Listings
                </div>
                <p className="text-body-sm text-on-surface-variant">
                  Every property verified by a GhIS-registered surveyor. Title status,
                  condition, and eco-sustainability all independently checked.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-6">
                <div className="mb-3 text-headline-sm font-headline text-primary">
                  Market Intelligence
                </div>
                <p className="text-body-sm text-on-surface-variant">
                  Locality-by-locality price trends, rental yields, and market
                  comparables so you know what a property is worth in context.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-6">
                <div className="mb-3 text-headline-sm font-headline text-primary">
                  Professionals Directory
                </div>
                <p className="text-body-sm text-on-surface-variant">
                  Connect with verified real estate agents, lawyers, and valuers who
                  speak our language and understand the market.
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-6">
                <div className="mb-3 text-headline-sm font-headline text-primary">
                  Green Building Hub
                </div>
                <p className="text-body-sm text-on-surface-variant">
                  Sustainability is not an afterthought. Every property is rated A–G
                  on a whole-property eco scale, with materials guidance built in.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
