import type { Metadata } from "next";
import { ComparablesWorkspace } from "@/components/workbench/ComparablesWorkspace";
import type { StageId } from "@/components/workbench/WorkflowTabs";
import { getComparables, getSubjectProperty } from "@/lib/data";


/**
 * Reference data changes on the order of days, not seconds, so the page is
 * rendered once and reused for five minutes rather than querying Supabase on
 * every request. Without this each visit opened a fresh connection, which the
 * database refuses under concurrency.
 */
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Comparables & Valuation",
};

const VALID_STAGES: StageId[] = [
  "comparables",
  "shortlist",
  "analysis",
  "rationale",
  "valuation",
  "submit",
];

export default async function ComparablesPage({
  searchParams,
}: {
  // Next 16: request-time APIs are async.
  searchParams: Promise<{ stage?: string }>;
}) {
  const { stage } = await searchParams;
  const [subject, comparables] = await Promise.all([
    getSubjectProperty(),
    getComparables(),
  ]);

  const active: StageId = VALID_STAGES.includes(stage as StageId)
    ? (stage as StageId)
    : "comparables";

  return (
    <ComparablesWorkspace
      subject={subject}
      comparables={comparables}
      stage={active}
    />
  );
}
