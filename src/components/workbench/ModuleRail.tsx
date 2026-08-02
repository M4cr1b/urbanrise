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
