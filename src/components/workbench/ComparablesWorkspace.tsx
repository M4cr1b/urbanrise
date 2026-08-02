"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Info, Send } from "lucide-react";
import { ComparablesGrid } from "./ComparablesGrid";
import { useShortlist } from "./shortlist-store";
import type { StageId } from "./WorkflowTabs";
import { formatCedi, formatSqm, pricePerSqm } from "@/lib/format";
import type { Comparable, Property } from "@/lib/types";

/* ---------------------------------------------------------------------------
   Derived analysis.

   The rate per square metre is the number a valuer reasons with, so the
   indicated value is the median rate across the shortlist applied to the
   subject's floor area. Median rather than mean: with a shortlist of five or
   six, one customary-title outlier would drag a mean badly.
   ------------------------------------------------------------------------ */

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

function analyse(subject: Property, picked: Comparable[]) {
  const rates = picked
    .map((c) => pricePerSqm(c.askingPrice, c.floorAreaSqm))
    .filter((r): r is number => r != null);

  const medianRate = median(rates);
  const indicated =
    medianRate != null && subject.floorAreaSqm != null
      ? Math.round((medianRate * subject.floorAreaSqm) / 1000) * 1000
      : null;

  const prices = picked.map((c) => c.askingPrice);

  return {
    rates,
    medianRate,
    indicated,
    low: prices.length ? Math.min(...prices) : null,
    high: prices.length ? Math.max(...prices) : null,
    sameTenure: picked.filter((c) => c.tenure === subject.tenure).length,
    registered: picked.filter((c) => c.titleStatus === "Registered").length,
    sold: picked.filter((c) => c.status === "Sold").length,
  };
}

/* ------------------------------------------------------------------------ */

export function ComparablesWorkspace({
  subject,
  comparables,
  stage,
}: {
  subject: Property;
  comparables: Comparable[];
  stage: StageId;
}) {
  const { ids, rationale, setRationale, opinion, setOpinion } = useShortlist();

  const picked = useMemo(
    () => comparables.filter((c) => ids.includes(c.id)),
    [comparables, ids],
  );
  const stats = useMemo(() => analyse(subject, picked), [subject, picked]);

  if (stage === "comparables") {
    return <ComparablesGrid subject={subject} comparables={comparables} />;
  }

  if (picked.length === 0 && stage !== "submit") {
    return (
      <StagePad>
        <EmptyShortlist />
      </StagePad>
    );
  }

  switch (stage) {
    case "shortlist":
      return <ComparablesGrid subject={subject} comparables={picked} />;

    case "analysis":
      return (
        <StagePad>
          <StageHeading
            title="Analysis"
            blurb={`Rate analysis across ${picked.length} shortlisted comparable${picked.length === 1 ? "" : "s"}.`}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              label="Median rate"
              value={
                stats.medianRate
                  ? `₵${stats.medianRate.toLocaleString("en-GH")}/sqm`
                  : "—"
              }
            />
            <Metric
              label="Asking range"
              value={
                stats.low && stats.high
                  ? `${formatCedi(stats.low)} – ${formatCedi(stats.high)}`
                  : "—"
              }
            />
            <Metric
              label="Subject floor area"
              value={formatSqm(subject.floorAreaSqm)}
            />
            <Metric
              label="Indicated value"
              value={stats.indicated ? formatCedi(stats.indicated) : "—"}
              emphasis
            />
          </div>

          <div className="mt-8 rounded-md border border-outline-variant/60 bg-surface-container-lowest p-5">
            <h3 className="mb-3 font-headline text-headline-md text-primary">
              Evidence quality
            </h3>
            <ul className="space-y-2 font-data text-data-sm text-on-surface-variant">
              <li>
                {/* The apostrophe lives in a JS string, not an &apos; entity:
                    a JSX text node that both starts with a space and contains
                    an entity loses that leading space in the transform. */}
                {stats.sameTenure} of {picked.length}{" "}
                {stats.sameTenure === 1 ? "shares" : "share"}{" "}
                {`the subject's tenure (${subject.tenure}).`}
              </li>
              <li>
                {stats.registered} of {picked.length}{" "}
                {stats.registered === 1 ? "carries" : "carry"} registered title
                at the Lands Commission.
              </li>
              <li>
                {stats.sold} of {picked.length}{" "}
                {stats.sold === 1 ? "is a completed sale" : "are completed sales"}{" "}
                rather than an asking price.
              </li>
            </ul>
          </div>

          <NextStage href="/comparables?stage=rationale" label="Write rationale" />
        </StagePad>
      );

    case "rationale":
      return (
        <StagePad>
          <StageHeading
            title="Rationale"
            blurb="Record the reasoning behind the adjustments made to the evidence."
          />
          <textarea
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            rows={12}
            placeholder="The subject is a 2024 four-bedroom detached house on a registered 99-year lease…"
            className="w-full rounded-md border border-outline-variant bg-surface-container-lowest p-4 text-body-md text-on-surface outline-none focus:border-tertiary-container focus:ring-2 focus:ring-tertiary-container"
          />
          <p className="mt-2 font-data text-data-sm text-on-surface-variant">
            {rationale.trim().split(/\s+/).filter(Boolean).length} words
          </p>
          <NextStage href="/comparables?stage=valuation" label="Set valuation" />
        </StagePad>
      );

    case "valuation":
      return (
        <StagePad>
          <StageHeading
            title="Valuation"
            blurb="Commit to an opinion of value for the subject property."
          />
          <div className="max-w-md">
            <label className="mb-2 block text-label-caps text-on-surface-variant">
              Opinion of value (₵)
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={opinion ?? ""}
              onChange={(e) =>
                setOpinion(e.target.value === "" ? null : Number(e.target.value))
              }
              placeholder={stats.indicated ? String(stats.indicated) : "0"}
              className="w-full rounded-md border border-outline-variant bg-surface-container-lowest px-4 py-3 font-data text-data-lg text-on-surface outline-none focus:border-tertiary-container focus:ring-2 focus:ring-tertiary-container"
            />
            {stats.indicated != null && (
              <button
                type="button"
                onClick={() => setOpinion(stats.indicated)}
                className="mt-3 flex items-center gap-2 rounded-md border border-primary px-4 py-2 font-data text-data-sm text-primary hover:bg-primary/5"
              >
                <Info className="size-4" aria-hidden />
                Use indicated {formatCedi(stats.indicated)}
              </button>
            )}
          </div>
          <NextStage href="/comparables?stage=submit" label="Review and submit" />
        </StagePad>
      );

    case "submit":
      return (
        <StagePad>
          <StageHeading
            title="Submit"
            blurb="Review the valuation before submitting it to the case file."
          />
          <dl className="max-w-2xl divide-y divide-outline-variant/40 rounded-md border border-outline-variant/60 bg-surface-container-lowest">
            <Summary label="Subject" value={subject.address} />
            <Summary label="Comparables used" value={String(picked.length)} />
            <Summary
              label="Indicated value"
              value={stats.indicated ? formatCedi(stats.indicated) : "—"}
            />
            <Summary
              label="Opinion of value"
              value={opinion != null ? formatCedi(opinion) : "Not set"}
            />
            <Summary
              label="Rationale"
              value={rationale.trim() ? `${rationale.trim().slice(0, 90)}…` : "Not written"}
            />
          </dl>
          <button
            type="button"
            disabled={opinion == null || picked.length === 0}
            className="btn-leaf mt-8 flex items-center gap-2 rounded-md bg-primary-container px-6 py-3 font-data text-data-lg text-on-primary-container hover:bg-primary hover:text-on-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="size-4" aria-hidden />
            Submit valuation
          </button>
          {(opinion == null || picked.length === 0) && (
            <p className="mt-3 font-data text-data-sm text-on-surface-variant">
              Shortlist at least one comparable and set an opinion of value to
              submit.
            </p>
          )}
        </StagePad>
      );
  }
}

/* --- Small presentational pieces ---------------------------------------- */

function StagePad({ children }: { children: React.ReactNode }) {
  return <div className="p-6 md:p-8">{children}</div>;
}

function StageHeading({ title, blurb }: { title: string; blurb: string }) {
  return (
    <header className="mb-6">
      <h2 className="font-headline text-headline-lg text-primary">{title}</h2>
      <p className="mt-1 text-body-md text-on-surface-variant">{blurb}</p>
    </header>
  );
}

function Metric({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`rounded-md border p-4 ${
        emphasis
          ? "border-secondary/40 bg-secondary-container/40"
          : "border-outline-variant/60 bg-surface-container-lowest"
      }`}
    >
      <div className="text-label-caps text-on-surface-variant">{label}</div>
      <div className="mt-1 font-data text-data-lg text-primary">{value}</div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <dt className="font-data text-data-sm text-on-surface-variant">{label}</dt>
      <dd className="text-right font-data text-data-sm font-medium text-on-surface">
        {value}
      </dd>
    </div>
  );
}

function NextStage({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="btn-leaf mt-8 inline-flex items-center gap-2 rounded-md bg-primary-container px-5 py-2.5 font-data text-data-sm text-on-primary-container hover:bg-primary hover:text-on-primary"
    >
      {label}
      <ArrowRight className="size-4" aria-hidden />
    </Link>
  );
}

function EmptyShortlist() {
  return (
    <div className="max-w-lg rounded-md border border-outline-variant/60 bg-surface-container-lowest p-8 text-center">
      <h2 className="mb-2 font-headline text-headline-md text-primary">
        No comparables shortlisted yet
      </h2>
      <p className="mb-6 text-body-md text-on-surface-variant">
        Add evidence from the Comparables matrix using the{" "}
        <span className="font-data font-semibold">+</span> button on each column,
        then return here.
      </p>
      <Link
        href="/comparables"
        className="btn-leaf inline-flex items-center gap-2 rounded-md bg-primary-container px-5 py-2.5 font-data text-data-sm text-on-primary-container hover:bg-primary hover:text-on-primary"
      >
        Back to Comparables
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}
