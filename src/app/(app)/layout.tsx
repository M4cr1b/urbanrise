import { Suspense } from "react";
import { ModuleRail, ModuleTabBar } from "@/components/workbench/ModuleRail";
import {
  WorkbenchBrand,
  WorkflowTabs,
} from "@/components/workbench/WorkflowTabs";
import { ShortlistProvider } from "@/components/workbench/shortlist-store";
import { ShortlistAnnouncer } from "@/components/workbench/ShortlistAnnouncer";

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
 *
 * On phones the vertical rail becomes a bottom tab bar. A 84px rail eats a
 * quarter of a small screen's width and puts navigation at the top-left, which
 * is the hardest place to reach one-handed; a bottom bar costs no width and
 * sits under the thumb. The workflow tabs stay at the top but scroll
 * horizontally rather than compressing.
 */
export default function WorkbenchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ShortlistProvider>
      {/* Keyboard users should not have to tab through the whole chrome. */}
      <a href="#workbench-main" className="sr-only-focusable">
        Skip to main content
      </a>

      {/* dvh, not vh: mobile browsers' collapsing URL bar makes vh overflow. */}
      <div className="flex h-dvh flex-col overflow-hidden bg-surface-container-low">
        <header className="topo-bg-invert flex shrink-0 items-center gap-2 border-b border-white/10 bg-primary px-3">
          <WorkbenchBrand />
          {/* useSearchParams needs a Suspense boundary during prerender */}
          <Suspense fallback={<div className="h-12" />}>
            <WorkflowTabs />
          </Suspense>
        </header>

        <div className="flex min-h-0 flex-1">
          {/* Vertical rail from md up */}
          <div className="hidden md:flex">
            <ModuleRail />
          </div>

          <main
            id="workbench-main"
            tabIndex={-1}
            className="min-w-0 flex-1 overflow-auto scrollbar-slim"
          >
            {children}
          </main>
        </div>

        {/* Bottom tab bar below md, clearing the home indicator */}
        <div className="md:hidden">
          <ModuleTabBar />
        </div>
      </div>

      {/* Confirms shortlist changes visibly and to screen readers */}
      <ShortlistAnnouncer />
    </ShortlistProvider>
  );
}
