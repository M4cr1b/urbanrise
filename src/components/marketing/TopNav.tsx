import Link from "next/link";
import { Leaf } from "lucide-react";

const LINKS = [
  { href: "/search", label: "Buy" },
  { href: "/search?intent=rent", label: "Rent" },
  { href: "/search?intent=new", label: "New Developments" },
  { href: "/market", label: "Market Intelligence" },
  { href: "/professionals", label: "Find a Professional" },
  { href: "/green-hub", label: "Green Building Hub" },
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
  return (
    <header
      className="fixed inset-x-0 top-0 z-50 backdrop-blur-md transition-colors"
      style={{
        backgroundColor: "var(--ur-nav-bg, color-mix(in srgb, #f8faf4 80%, transparent))",
        color: "var(--ur-nav-ink, var(--color-primary))",
      }}
    >
      <nav className="mx-auto flex max-w-container-max items-center justify-between px-margin-mobile py-4 md:px-margin-desktop">
        <Link
          href="/"
          className="flex items-center gap-2 font-headline text-headline-md font-bold"
        >
          <Leaf className="size-6" aria-hidden />
          UrbanRise
        </Link>

        <ul className="hidden items-center gap-gutter lg:flex">
          {LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-body-md opacity-70 transition-opacity hover:opacity-100"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          <Link
            href="/comparables"
            className="hidden text-body-md opacity-70 transition-opacity hover:opacity-100 sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/search"
            className="btn-leaf rounded-md bg-primary-container px-4 py-2 text-body-md text-on-primary-container hover:bg-primary hover:text-on-primary"
          >
            List a property
          </Link>
        </div>
      </nav>
    </header>
  );
}
