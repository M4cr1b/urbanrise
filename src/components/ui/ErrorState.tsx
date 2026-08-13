"use client";

import Link from "next/link";
import { AlertTriangle, RotateCw } from "lucide-react";

/**
 * What the user sees when a screen fails to load.
 *
 * The platform's whole claim is reliable information, so a failure has to be
 * legible rather than a blank page: say what broke, offer the retry (these are
 * nearly always transient database hiccups), and give a way out that does not
 * depend on the broken thing.
 *
 * The raw message is available but folded away — useful when someone reports a
 * problem, not shoved at a homebuyer.
 */
export function ErrorState({
  error,
  reset,
  scope = "this page",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  scope?: string;
}) {
  return (
    <div
      role="alert"
      className="mx-auto flex max-w-lg flex-col items-center px-6 py-20 text-center"
    >
      <AlertTriangle className="mb-4 size-10 text-error" aria-hidden />
      <h1 className="mb-2 font-headline text-headline-md text-primary">
        We couldn&apos;t load {scope}
      </h1>
      <p className="mb-6 text-body-md text-on-surface-variant">
        This is usually a brief interruption reaching our data. Trying again
        will often be enough.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="btn-leaf inline-flex items-center gap-2 rounded-md bg-primary-container px-5 py-2.5 text-body-md text-on-primary-container hover:bg-primary hover:text-on-primary"
        >
          <RotateCw className="size-4" aria-hidden />
          Try again
        </button>
        <Link
          href="/"
          className="rounded-md border border-outline-variant px-5 py-2.5 text-body-md text-on-surface-variant hover:border-primary hover:text-primary"
        >
          Back to home
        </Link>
      </div>

      <details className="mt-8 w-full text-left">
        <summary className="cursor-pointer font-data text-data-sm text-outline hover:text-on-surface-variant">
          Technical detail
        </summary>
        <pre className="mt-2 overflow-x-auto rounded-md bg-surface-container p-3 font-data text-[11px] text-on-surface-variant">
          {error.message}
          {error.digest ? `\n\ndigest: ${error.digest}` : ""}
        </pre>
      </details>
    </div>
  );
}
