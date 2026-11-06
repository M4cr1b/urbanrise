"use client";

import Image from "next/image";

import { useMemo, useState } from "react";
import { Mail, Phone, ShieldCheck } from "lucide-react";
import type { Discipline, Professional } from "@/lib/types";
import { PRIMARY_REGION } from "@/lib/regions";
import { CollectionPanel, CollectionSearch, CollectionReset } from "./CollectionPanel";
import styles from "./CollectionPanel.module.css";

/**
 * The directory of estate professionals.
 *
 * The proposal's point is that a residential transaction needs a whole chain of
 * professionals who currently sit on separate platforms — so the filter is by
 * discipline first, and registration status is surfaced on every card rather
 * than buried in a profile.
 */

const DISCIPLINES: (Discipline | "All")[] = [
  "All",
  "Estate Surveyor & Valuer",
  "Estate Agent",
  "Property Lawyer",
  "Architect",
  "Structural Engineer",
  "Quantity Surveyor",
  "Property Manager",
  "Mortgage Consultant",
];

export function ProfessionalsWorkspace({
  professionals,
}: {
  professionals: Professional[];
}) {
  const [discipline, setDiscipline] = useState<Discipline | "All">("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [q, setQ] = useState("");
  const [brokenPhotos, setBrokenPhotos] = useState<Set<string>>(new Set());

  const results = useMemo(
    () =>
      professionals.filter((p) => {
        if (discipline !== "All" && p.discipline !== discipline) return false;
        if (verifiedOnly && !p.verified) return false;
        if (q) {
          const hay =
            `${p.name} ${p.firm} ${p.specialisms.join(" ")}`.toLowerCase();
          if (!hay.includes(q.toLowerCase())) return false;
        }
        return true;
      }),
    [professionals, discipline, verifiedOnly, q],
  );

  return (
    <div className={styles.workspace}>
      <CollectionPanel eyebrow="THE URBANRISE NETWORK" title={<>Find a <em>Professional</em></>} description={<>Connect with surveyors, valuers, lawyers, architects and engineers in {PRIMARY_REGION}.</>} count={results.length} countLabel="professionals">
        <div className={styles.controls}>
          <CollectionSearch label="Search professionals" placeholder="Name, firm or specialism…" value={q} onChange={setQ} />
          <label className={styles.verified}>
            <input type="checkbox" checked={verifiedOnly} onChange={event => setVerifiedOnly(event.target.checked)} />
            <ShieldCheck className="size-4" aria-hidden />Registered only
          </label>
          <CollectionReset onClick={() => { setQ(""); setDiscipline("All"); setVerifiedOnly(false); }} />
        </div>
        <label className={styles.mobileSelect}>Discipline
          <select aria-label="Professional discipline" value={discipline} onChange={event => setDiscipline(event.target.value as Discipline | "All")}>
            {DISCIPLINES.map(option => <option key={option} value={option}>{option === "All" ? "All disciplines" : option}</option>)}
          </select>
        </label>
        <div className="hidden md:block"><FilterRow label="Discipline" options={DISCIPLINES} value={discipline} onChange={value => setDiscipline(value as Discipline | "All")} /></div>
      </CollectionPanel>

      {results.length === 0 ? (
        <p className={styles.empty}>
          No professionals match these filters.
        </p>
      ) : (
        <ul className={"grid " + styles.grid}>
          {results.map((p) => (
            <li
              key={p.id}
              className={styles.itemCard + " " + styles.professionalCard}
            >
              {/* Photograph first: engaging a valuer or lawyer is a personal
                  decision, and a wall of names tells you nothing about who you
                  would be dealing with. */}
              <div className={styles.professionalTop}>
                <div className={styles.portrait}>
                  {p.photoUrl && !brokenPhotos.has(p.id) ? (
                    <Image
                      src={p.photoUrl}
                      alt={`${p.name}, ${p.discipline}`}
                      fill
                      sizes="96px"
                      className="object-cover"
                      onError={() =>
                        setBrokenPhotos((prev) => new Set(prev).add(p.id))
                      }
                    />
                  ) : (
                    // Monogram for members who have not uploaded a photograph.
                    // Brand-toned rather than grey, so it reads as a designed
                    // state and not a broken image.
                    <span className="flex size-full items-center justify-center bg-primary-container font-headline text-headline-md text-on-primary-container">
                      {p.name
                        .split(" ")
                        .filter(Boolean)
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-col items-start">
                    <div className="min-w-0">
                      <h2 className="wrap-anywhere font-headline text-xl font-semibold text-primary sm:text-headline-md">
                        {p.name}
                      </h2>
                      <p className="wrap-anywhere font-data text-data-sm text-on-surface-variant">
                        {p.firm}
                      </p>
                    </div>
                    {p.verified && (
                      <span
                        className={"registration-badge " + styles.registration}
                        title="Registration confirmed with the professional body"
                      >
                        <ShieldCheck className="size-3.5" aria-hidden />
                        Registered
                      </span>
                    )}
                  </div>

                  <p className="mt-2 font-data text-data-sm font-medium text-on-surface">
                    {p.discipline}
                  </p>
                  <p className="wrap-anywhere font-data text-data-sm text-on-surface-variant">
                    {p.yearsExperience} years · {p.licenceNo}
                  </p>
                </div>
              </div>

              <div className={styles.professionalBody}>

              <ul className={styles.specialisms}>
                {p.specialisms.map((s) => (
                  <li
                    key={s}
                  >
                    {s}
                  </li>
                ))}
              </ul>

              <div className={styles.contactLinks}>
                <a
                  href={`tel:${p.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-1.5 text-primary hover:underline"
                >
                  <Phone className="size-3.5" aria-hidden />
                  {p.phone}
                </a>
                <a
                  href={`mailto:${p.email}`}
                  className="flex items-center gap-1.5 text-primary hover:underline"
                >
                  <Mail className="size-3.5" aria-hidden />
                  Email
                </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className={styles.filterRow}>
      <span className={styles.filterLabel}>
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            aria-pressed={value === opt}
            className={styles.chip}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
