import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { SearchX } from "lucide-react";

/* ---------------------------------------------------------------------------
   Shared states.

   Three things a data-backed screen owes the person using it: something to look
   at while it loads, a way forward when there is nothing to show, and a way out
   when it breaks. Each is a distinct message — "loading", "empty" and "failed"
   must never look alike, or the user cannot tell waiting from broken.
   ------------------------------------------------------------------------ */

/** Grey block standing in for content that is on its way. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-md ${className}`} aria-hidden />;
}

/**
 * Card-grid placeholder. Announced politely so a screen reader hears that work
 * is in progress rather than sitting in silence.
 */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-3"
    >
      <span className="sr-only">Loading results…</span>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-primary/10 bg-surface-container-lowest"
        >
          <Skeleton className="h-48 rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-5 w-2/5" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Full-page placeholder for the workbench modules. */
export function PageSkeleton() {
  return (
    <div className="p-6 md:p-8">
      <div role="status" aria-live="polite" aria-busy="true">
        <span className="sr-only">Loading…</span>
        <Skeleton className="mb-3 h-8 w-64" />
        <Skeleton className="mb-8 h-4 w-96 max-w-full" />
      </div>
      <CardGridSkeleton count={6} />
    </div>
  );
}

/**
 * Nothing to show. Always says what was searched and offers a concrete way to
 * widen it — a dead end with no exit is the most common empty-state failure.
 */
export function EmptyState({
  icon: Icon = SearchX,
  title,
  body,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  body: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest px-6 py-16 text-center">
      <Icon className="mb-4 size-10 text-outline" aria-hidden />
      <h2 className="mb-2 font-headline text-headline-md text-primary">
        {title}
      </h2>
      <p className="mb-6 max-w-md text-body-md text-on-surface-variant">{body}</p>
      {action && (
        <Link
          href={action.href}
          className="btn-leaf rounded-md bg-primary-container px-5 py-2.5 text-body-md text-on-primary-container hover:bg-primary hover:text-on-primary"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
