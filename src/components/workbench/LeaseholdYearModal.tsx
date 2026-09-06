"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface LeaseholdYearModalProps {
  open: boolean;
  initialYear: number | null;
  onApply: (year: number | null) => void;
  onClose: () => void;
}

export function LeaseholdYearModal({
  open,
  initialYear,
  onApply,
  onClose,
}: LeaseholdYearModalProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(initialYear);

  useEffect(() => {
    setSelectedYear(initialYear);
  }, [initialYear]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Select leasehold term remaining"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-96 max-w-[92vw] rounded-xl border border-outline-variant bg-surface-container-lowest p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-xl bg-gradient-to-r from-primary via-tertiary to-primary" />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-on-surface-variant hover:text-on-surface"
          aria-label="Close"
        >
          <X className="size-5" aria-hidden />
        </button>

        <h3 className="text-headline-sm font-headline text-primary">
          Leasehold term remaining
        </h3>
        <p className="mt-1 text-data-sm text-on-surface-variant">
          Select the number of years left on the lease (1–99).
        </p>

        <div className="mt-6 grid grid-cols-9 gap-2">
          {Array.from({ length: 99 }, (_, i) => i + 1).map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => setSelectedYear(year)}
              className={`aspect-square rounded-md border text-data-xs font-semibold transition-colors ${
                selectedYear === year
                  ? "border-primary bg-primary text-on-primary"
                  : "border-outline-variant bg-surface text-on-surface hover:border-primary/50"
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-outline-variant pt-4">
          <span className="text-data-sm font-semibold text-primary">
            {selectedYear ? `${selectedYear} years remaining` : "No term selected"}
          </span>
          <button
            type="button"
            onClick={() => {
              onApply(selectedYear);
              onClose();
            }}
            className="rounded-md bg-primary px-4 py-2 text-data-sm font-semibold text-on-primary hover:bg-primary/90"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
