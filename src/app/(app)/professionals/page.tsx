import type { Metadata } from "next";
import { ProfessionalsWorkspace } from "@/components/workbench/ProfessionalsWorkspace";
import { getProfessionals } from "@/lib/data";


/**
 * Reference data changes on the order of days, not seconds, so the page is
 * rendered once and reused for five minutes rather than querying Supabase on
 * every request. Without this each visit opened a fresh connection, which the
 * database refuses under concurrency.
 */
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Find a Professional",
};

export default async function ProfessionalsPage() {
  const professionals = await getProfessionals();
  return <ProfessionalsWorkspace professionals={professionals} />;
}
