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

  if (!subject) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="max-w-lg rounded-md border border-outline-variant/60 bg-surface-container-lowest p-8 text-center">
          <h2 className="mb-2 font-headline text-headline-md text-primary">
            No comparables have been added yet
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Comparables are a separate dataset that will be uploaded separately.
          </p>
        </div>
      </div>
    );
  }

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
