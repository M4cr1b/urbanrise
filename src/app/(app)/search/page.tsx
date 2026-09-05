import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchWorkspace } from "@/components/workbench/SearchWorkspace";
import { getProperties } from "@/lib/data";


/**
 * Reference data changes on the order of days, not seconds, so the page is
 * rendered once and reused for five minutes rather than querying Supabase on
 * every request. Without this each visit opened a fresh connection, which the
 * database refuses under concurrency.
 */
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Search",
};

export default async function SearchPage() {
  const properties = await getProperties();
  return (
    <Suspense fallback={<div className="p-8">Loading search…</div>}>
      <SearchWorkspace properties={properties} />
    </Suspense>
  );
}
