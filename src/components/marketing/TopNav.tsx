"use client";

import Link from "next/link";
import { Leaf, Menu, ArrowUpRight } from "lucide-react";
import { useRef, useState } from "react";
import { MobileSheet } from "@/components/ui/MobileSheet";
import { ThemeSelect } from "@/components/ui/ThemeSelect";

const LINKS = [
  { href: "/search", label: "Buy", shortLabel: "Buy" },
  { href: "/search?intent=rent", label: "Rent", shortLabel: "Rent" },
  { href: "/search?intent=new", label: "New Developments", shortLabel: "New homes" },
  { href: "/market", label: "Market Intelligence", shortLabel: "Market insights" },
  { href: "/professionals", label: "Find a Professional", shortLabel: "Professionals" },
  { href: "/green-hub", label: "Green Building Hub", shortLabel: "Green Hub" },
];

/**
 * Marketing nav.
 *
 * Ink and backdrop read from CSS variables that `PortalReveal` drives during
 * the landing cinematic (the bar has to survive a full-bleed dark image passing
 * underneath it). Both fall back to the static light treatment, so every other
 * page gets the design-system default without opting in.
 */
export function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  return (
    <>
    <header
      className="fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] backdrop-blur-md transition-colors"
      style={{
        backgroundColor: "var(--ur-nav-bg, color-mix(in srgb, var(--color-surface) 80%, transparent))",
        color: "var(--ur-nav-ink, var(--color-primary))",
      }}
    >
      <nav aria-label="Main navigation" className="mx-auto flex min-h-16 max-w-container-max items-center justify-between gap-3 px-4 py-2 md:px-margin-desktop md:py-4">
        <Link
          href="/"
          className="flex min-h-11 shrink-0 items-center gap-2 font-headline text-headline-md font-bold"
        >
          <Leaf className="size-6" aria-hidden />
          UrbanRise
        </Link>

        <ul className="hidden items-center gap-4 xl:flex">
          {LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-sm opacity-70 transition-opacity hover:opacity-100"
              >
                {link.shortLabel}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex shrink-0 items-center gap-3">
          <ThemeSelect />
          <Link
            href="/comparables"
            className="hidden text-sm opacity-70 transition-opacity hover:opacity-100 2xl:block"
          >
            Sign in
          </Link>
          <Link
            href="/search"
            className="btn-leaf hidden min-h-11 items-center rounded-md bg-primary-container px-4 py-2 text-sm text-on-primary-container hover:bg-primary hover:text-on-primary sm:inline-flex"
          >
            List a property
          </Link>
          <button ref={menuButtonRef} type="button" aria-label="Open navigation menu" aria-haspopup="dialog" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)} className="flex size-11 items-center justify-center rounded-full border border-current/20 xl:hidden">
            <Menu className="size-6" aria-hidden />
          </button>
        </div>
      </nav>
    </header>
    <MobileSheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Explore UrbanRise" returnFocusRef={menuButtonRef}>
      <nav aria-label="Mobile navigation" className="space-y-1">
        {[...LINKS, { href: "/comparables", label: "Comparables & valuation" }, { href: "/about", label: "About UrbanRise" }, { href: "/help", label: "Help" }, { href: "/legal", label: "Legal" }].map(link => <Link key={link.label} href={link.href} onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center justify-between gap-3 rounded-lg px-3 py-3 text-base font-medium text-primary hover:bg-surface-container">
          {link.label}<ArrowUpRight className="size-4 shrink-0" aria-hidden />
        </Link>)}
      </nav>
    </MobileSheet>
    </>
  );
}
