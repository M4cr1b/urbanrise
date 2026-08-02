import { Suspense } from "react";
import { ModuleRail } from "@/components/workbench/ModuleRail";
import {
  WorkbenchBrand,
  WorkflowTabs,
} from "@/components/workbench/WorkflowTabs";
import { ShortlistProvider } from "@/components/workbench/shortlist-store";

/**
 * The workbench shell.
 *
 * Everything behind the landing page wears this: dark evergreen chrome, a
 * module rail down the left, and the linear valuation workflow across the top —
 * the structure of a professional tool rather than a marketing site.
 *
 * The chrome uses `primary` and `primary-container` rather than the reference
 * tool's charcoal, so the density is the same but the product still reads as
 * UrbanRise.
 */
export default function WorkbenchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ShortlistProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-surface-container-low">
        <header className="topo-bg-invert flex shrink-0 items-center gap-2 border-b border-white/10 bg-primary px-3">
          <WorkbenchBrand />
          {/* useSearchParams needs a Suspense boundary during prerender */}
          <Suspense fallback={<div className="h-12" />}>
            <WorkflowTabs />
          </Suspense>
        </header>

        <div className="flex min-h-0 flex-1">
          <ModuleRail />
          <main className="min-w-0 flex-1 overflow-auto scrollbar-slim">
            {children}
          </main>
        </div>
      </div>
    </ShortlistProvider>
  );
}
