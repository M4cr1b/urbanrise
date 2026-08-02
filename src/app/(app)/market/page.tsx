import type { Metadata } from "next";
import { MarketWorkspace } from "@/components/workbench/MarketWorkspace";
import { getLocalityMarkets } from "@/lib/data";

export const metadata: Metadata = {
  title: "Market Intelligence",
};

export default async function MarketPage() {
  const markets = await getLocalityMarkets();
  return <MarketWorkspace markets={markets} />;
}
