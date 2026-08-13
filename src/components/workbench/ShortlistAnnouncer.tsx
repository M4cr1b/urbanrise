"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { useShortlist } from "./shortlist-store";

/**
 * Confirms shortlist changes.
 *
 * Adding a comparable used to change only a small count badge in the top bar —
 * on a phone that badge is often off-screen entirely, so the tap appeared to do
 * nothing. This gives the action a visible result and an audible one:
 *
 *  - a brief toast, so sighted users see the change acknowledged
 *  - an `aria-live` region, so screen reader users hear it without moving focus
 *
 * Deliberately `polite` rather than `assertive`: adding evidence is routine and
 * should not interrupt whatever is being read.
 */
export function ShortlistAnnouncer() {
  const { count } = useShortlist();
  const previous = useRef<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // The first run establishes the baseline — restoring a saved shortlist on
    // page load is not a change the user just made, so it is not announced.
    if (previous.current === null) {
      previous.current = count;
      return;
    }
    if (count === previous.current) return;

    const added = count > previous.current;
    previous.current = count;
    setMessage(
      added
        ? `Added to shortlist. ${count} ${count === 1 ? "comparable" : "comparables"} selected.`
        : `Removed from shortlist. ${count} ${count === 1 ? "comparable" : "comparables"} selected.`,
    );

    const t = setTimeout(() => setMessage(""), 3200);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <>
      {/* Always mounted: a live region added to the DOM at the same moment its
          text appears is frequently missed by screen readers. */}
      <p aria-live="polite" className="sr-only">
        {message}
      </p>

      <div
        aria-hidden
        className={`pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 transition-all duration-200 md:bottom-6 ${
          message
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        {message && (
          <span className="flex items-center gap-2 rounded-full bg-inverse-surface px-4 py-2.5 font-data text-data-sm text-inverse-on-surface shadow-lg">
            <Check className="size-4 text-secondary-fixed-dim" aria-hidden />
            {message}
          </span>
        )}
      </div>
    </>
  );
}
