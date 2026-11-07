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
import { getFeaturedProperties, getNationalStats, getProperties } from "@/lib/data";
import landing from "@/components/marketing/Landing.module.css";


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
  alt: "A contemporary home framed by trees, with warm timber cladding and floor-to-ceiling windows.",
};

export default async function LandingPage() {
  const [featured, stats, properties] = await Promise.all([
    getFeaturedProperties(),
    getNationalStats(),
    getProperties(),
  ]);

  return (
    <div className={landing.page}>
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
                <SearchCard properties={properties} />
              </div>
              <Link
                href="/search"
                className="action-primary inline-flex min-h-12 items-center gap-2 px-6 py-3 md:hidden"
              >
                <Search className="size-4" aria-hidden />
                Search properties
              </Link>
            </HeroCopy>
          }
        >
          <div className={landing.mobileSearch}>
            <SearchCard properties={properties} />
          </div>
          <PortalPanel />
        </PortalReveal>

        <StatsBand stats={stats} />
        <FeaturedHomes properties={featured} />
        <GreenHubTeaser />
      </main>

      <SiteFooter />
    </div>
  );
}
