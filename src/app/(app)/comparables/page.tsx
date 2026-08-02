import type { Metadata } from "next";
import { ComparablesWorkspace } from "@/components/workbench/ComparablesWorkspace";
import type { StageId } from "@/components/workbench/WorkflowTabs";
import { getComparables, getSubjectProperty } from "@/lib/data";

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
