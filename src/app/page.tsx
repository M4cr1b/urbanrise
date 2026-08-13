import Link from "next/link";
import { Search } from "lucide-react";
import { TopNav } from "@/components/marketing/TopNav";
import { SearchCard } from "@/components/marketing/SearchCard";
import {
  FeaturedHomes,
  GreenHubTeaser,
  HeroCopy,
  PortalPanel,
  SiteFooter,
  StatsBand,
} from "@/components/marketing/Sections";
import { PortalReveal } from "@/components/scroll/PortalReveal";
import { getFeaturedProperties, getNationalStats } from "@/lib/data";


/**
 * Reference data changes on the order of days, not seconds, so the page is
 * rendered once and reused for five minutes rather than querying Supabase on
 * every request. Without this each visit opened a fresh connection, which the
 * database refuses under concurrency.
 */
export const revalidate = 300;

const HERO_IMAGE = {
  // Served from public/ rather than Google's CDN: the aida-public URLs are
  // generated assets with no durability guarantee, and this is the first thing
  // every visitor sees.
  src: "/hero-eco-home.webp",
  alt: "A sustainable eco-home in Ghana with lush green walls, rooftop solar panels and large glass windows, overlooking the Accra skyline.",
};

export default async function LandingPage() {
  const [featured, stats] = await Promise.all([
    getFeaturedProperties(),
    getNationalStats(),
  ]);

  return (
    <>
      <TopNav />

      <main>
        {/* The hero image expands to full bleed, then the page opens out of it */}
        <PortalReveal
          image={HERO_IMAGE}
          hero={
            <HeroCopy>
              {/* The full search card only fits beside the expanding image on
                  wider screens; phones get a direct link and the card itself
                  immediately after the reveal. */}
              <div className="hidden max-w-2xl md:block">
                <SearchCard />
              </div>
              <Link
                href="/search"
                className="btn-leaf inline-flex items-center gap-2 rounded-md bg-primary-container px-6 py-3 text-body-md text-on-primary-container md:hidden"
              >
                <Search className="size-4" aria-hidden />
                Search properties
              </Link>
            </HeroCopy>
          }
        >
          <PortalPanel />
        </PortalReveal>

        <div className="px-margin-mobile py-10 md:hidden">
          <SearchCard />
        </div>

        <StatsBand stats={stats} />
        <FeaturedHomes properties={featured} />
        <GreenHubTeaser />
      </main>

      <SiteFooter />
    </>
  );
}
