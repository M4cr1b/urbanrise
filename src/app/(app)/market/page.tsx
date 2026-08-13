import type { Metadata } from "next";
import { MarketWorkspace } from "@/components/workbench/MarketWorkspace";
import { getLocalityMarkets } from "@/lib/data";


/**
 * Reference data changes on the order of days, not seconds, so the page is
 * rendered once and reused for five minutes rather than querying Supabase on
 * every request. Without this each visit opened a fresh connection, which the
 * database refuses under concurrency.
 */
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Market Intelligence",
};

export default async function MarketPage() {
  const markets = await getLocalityMarkets();
  return <MarketWorkspace markets={markets} />;
}
