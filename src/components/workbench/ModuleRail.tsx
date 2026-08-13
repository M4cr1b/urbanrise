"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Columns3,
  HelpCircle,
  Info,
  Leaf,
  LineChart,
  ScrollText,
  Search,
  Users,
} from "lucide-react";

/**
 * The far-left module rail.
 *
 * Mirrors the reference tool's context switcher (Sales / Rental / Company
 * Sales / Company Rental): a narrow dark strip of icons with small stacked
 * labels beneath them, and utility links pinned at the bottom.
 */

const MODULES = [
  { href: "/search", label: "Search", icon: Search },
  { href: "/comparables", label: "Comparables", icon: Columns3 },
  { href: "/market", label: "Market", icon: LineChart },
  { href: "/professionals", label: "Professionals", icon: Users },
  { href: "/green-hub", label: "Green Hub", icon: Leaf },
];

const UTILITIES = [
  { href: "/green-hub", label: "Help", icon: HelpCircle },
  { href: "/market", label: "About", icon: Info },
  { href: "/professionals", label: "Legal", icon: ScrollText },
];

/** Shared by both layouts so "which module am I in" cannot drift between them. */
function useIsActive() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Bottom tab bar for phones.
 *
 * Replaces the vertical rail below `md`. Five destinations is the practical
 * ceiling for a thumb-reachable bar, which is exactly the number of modules —
 * the utility links live in the footer of each page instead, since Help and
 * Legal are not things you navigate to mid-task.
 *
 * `safe-area-inset-bottom` keeps the row clear of the iOS home indicator.
 */
export function ModuleTabBar() {
  const isActive = useIsActive();

  return (
    <nav
      aria-label="Modules"
      className="border-t border-white/10 bg-primary pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex">
        {MODULES.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <li key={label} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-2 text-center transition-colors ${
                  active
                    ? "text-on-primary-container"
                    : "text-primary-fixed-dim active:bg-white/10"
                }`}
              >
                <Icon className="size-5 shrink-0" aria-hidden />
                <span className="text-[10px] font-semibold leading-none tracking-tight">
                  {label}
                </span>
                {/* An underline rather than a filled block: at this size a
                    filled active state swamps the four inactive tabs. */}
                <span
                  aria-hidden
                  className={`h-0.5 w-6 rounded-full ${active ? "bg-on-primary-container" : "bg-transparent"}`}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function ModuleRail() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Modules"
      className="flex w-[84px] shrink-0 flex-col justify-between border-r border-white/10 bg-primary py-2"
    >
      <ul className="flex flex-col">
        {MODULES.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={label}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 px-1.5 py-3 text-center transition-colors ${
                  active
                    ? "bg-primary-container text-on-primary-container"
                    : "text-primary-fixed-dim hover:bg-white/5"
                }`}
              >
                <Icon className="size-5 shrink-0" aria-hidden />
                <span className="text-[10px] font-semibold leading-[1.15] tracking-tight">
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <ul className="flex flex-col">
        {UTILITIES.map(({ href, label, icon: Icon }) => (
          <li key={label}>
            <Link
              href={href}
              className="flex flex-col items-center gap-1 px-1 py-2.5 text-center text-primary-fixed-dim/70 transition-colors hover:bg-white/5 hover:text-primary-fixed-dim"
            >
              <Icon className="size-4" aria-hidden />
              <span className="text-[10px] leading-tight">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
