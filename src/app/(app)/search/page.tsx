import type { Metadata } from "next";
import { SearchWorkspace } from "@/components/workbench/SearchWorkspace";
import { getProperties } from "@/lib/data";

export const metadata: Metadata = {
  title: "Search",
};

export default async function SearchPage() {
  const properties = await getProperties();
  return <SearchWorkspace properties={properties} />;
}
