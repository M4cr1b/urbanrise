"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, X } from "lucide-react";
import type { Property } from "@/lib/types";
import { EcoBadge } from "@/components/ui/Badges";
import { formatCedi } from "@/lib/format";
import { FEATURED_PROPERTY_IDS } from "@/lib/data/properties";

interface PropertySearchFieldProps {
  properties: Property[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputClassName?: string;
  wrapperClassName?: string;
  maxResults?: number;
  featuredIds?: string[];
  onSubmit?: (v: string) => void;
  onViewAll?: (query: string) => void;
  viewAllHref?: (query: string) => string;
  icon?: React.ReactNode;
}

/**
 * Reusable search field with a live-filtering dropdown panel.
 *
 * On focus, shows featured properties (empty state) or filtered matches (typing state).
 * Keyboard-navigable (arrow keys, enter to select, escape to close).
 * Accessibility: combobox pattern with proper ARIA roles.
 */
export function PropertySearchField({
  properties,
  value,
  onChange,
  placeholder = "Search by address or district…",
  inputClassName = "",
  wrapperClassName = "",
  maxResults = 5,
  featuredIds = FEATURED_PROPERTY_IDS,
  onSubmit,
  onViewAll,
  viewAllHref = (q) =>
    q ? `/search?q=${encodeURIComponent(q)}` : "/search",
  icon,
}: PropertySearchFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = `property-search-list-${useId()}`;

  // Filter logic: exact same haystack as SearchWorkspace.tsx:161-164
  const getFilteredProperties = (query: string): Property[] => {
    if (!query.trim()) {
      // Empty state: resolve featured IDs, backfill with price-desc order
      const featured = featuredIds
        .map((id) => properties.find((p) => p.id === id))
        .filter((p): p is Property => p != null);

      if (featured.length >= maxResults) {
        return featured.slice(0, maxResults);
      }

      const backfill = properties
        .filter((p) => !featuredIds.includes(p.id))
        .sort((a, b) => b.askingPrice - a.askingPrice)
        .slice(0, maxResults - featured.length);

      return [...featured, ...backfill];
    }

    // Typing state: substring match
    const q = query.toLowerCase();
    return properties
      .filter((p) => {
        const hay = `${p.address} ${p.district} ${p.region}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => b.askingPrice - a.askingPrice)
      .slice(0, maxResults);
  };

  const filtered = getFilteredProperties(value);
  const hasResults = filtered.length > 0;
  const resultCount = value.trim() ? properties.filter(property => `${property.address} ${property.district} ${property.region}`.toLowerCase().includes(value.toLowerCase())).length : properties.length;

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: PointerEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("pointerdown", handleClickOutside);
      return () =>
        document.removeEventListener("pointerdown", handleClickOutside);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && e.key !== "Enter") {
      return;
    }

    const totalItems = hasResults ? filtered.length + 1 : 1; // rows + footer

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev === null ? 0 : Math.min(prev + 1, totalItems - 1)
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev === null ? totalItems - 1 : Math.max(prev - 1, 0)
        );
        break;

      case "Enter":
        e.preventDefault();
        if (highlightedIndex !== null && highlightedIndex < filtered.length) {
          // Property row — navigate to detail page
          const prop = filtered[highlightedIndex];
          window.location.href = `/property/${prop.id}`;
        } else if (onSubmit) onSubmit(value);
        else if (onViewAll) onViewAll(value);
        else window.location.href = viewAllHref(value);
        setIsOpen(false);
        inputRef.current?.blur();
        break;

      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative min-w-0 ${wrapperClassName}`}
      role="presentation"
    >
      {/* Input wrapper for layout with icon */}
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            {icon}
          </div>
        )}

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setHighlightedIndex(null); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search by address or district"
          enterKeyHint="search"
          className={inputClassName}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={isOpen ? listId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={
            isOpen && highlightedIndex !== null
              ? `${listId}-${
                  highlightedIndex < filtered.length
                    ? filtered[highlightedIndex].id
                    : "footer"
                }`
              : undefined
          }
        />
        {value && <button type="button" aria-label="Clear property search" onClick={() => { onChange(""); setHighlightedIndex(null); inputRef.current?.focus(); }} className="absolute right-0 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center text-on-surface-variant"><X className="size-4" aria-hidden /></button>}
      </div>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          role="listbox"
          id={listId}
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[min(24rem,50dvh)] overflow-y-auto overscroll-contain rounded-xl border border-primary/10 bg-surface-container-lowest shadow-[var(--shadow-level-2)]"
          onMouseDown={(e) => e.preventDefault()} // Preserve focus through click
        >
          {/* Results or featured section */}
          {hasResults ? (
            <>
              {/* Section header */}
              <div className="sticky top-0 border-b border-outline-variant/30 bg-surface-container-lowest px-4 py-2">
                <span className="text-data-xs text-on-surface-variant font-semibold uppercase tracking-wide">
                  {value.trim()
                    ? `Matches for "${value}"`
                    : "Featured properties"}
                </span>
              </div>

              {/* Property rows */}
              {filtered.map((p, i) => (
                <ResultRow
                  key={p.id}
                  property={p}
                  isHighlighted={highlightedIndex === i}
                  listId={listId}
                />
              ))}
            </>
          ) : (
            /* No matches state */
            <>
              <div className="sticky top-0 border-b border-outline-variant/30 bg-surface-container-lowest px-4 py-2">
                <span className="text-data-xs text-on-surface-variant font-semibold uppercase tracking-wide">
                  No matches
                </span>
              </div>
              <div className="px-4 py-3">
                <p className="text-body-sm text-on-surface-variant">
                  No properties match &quot;{value}&quot;. Try widening the search.
                </p>
              </div>
            </>
          )}

          {/* Footer row — always present */}
          <FooterRow
            query={value}
            allCount={properties.length}
            resultCount={resultCount}
            isHighlighted={highlightedIndex === filtered.length}
            listId={listId}
            onViewAll={onViewAll}
            viewAllHref={viewAllHref}
          />
        </div>
      )}
    </div>
  );
}

/**
 * A single property result row in the dropdown.
 */
function ResultRow({
  property: p,
  isHighlighted,
  listId,
}: {
  property: Property;
  isHighlighted: boolean;
  listId: string;
}) {
  return (
    <Link
      href={`/property/${p.id}`}
      role="option"
      id={`${listId}-${p.id}`}
      aria-selected={isHighlighted}
      className={`grid grid-cols-[3rem_minmax(0,1fr)] items-center gap-x-3 gap-y-1 border-b border-outline-variant/20 px-3 py-3 transition-colors sm:flex ${
        isHighlighted ? "bg-primary/5" : "hover:bg-primary/5"
      }`}
    >
      {/* Thumbnail */}
      <div className="relative row-span-2 size-12 shrink-0 overflow-hidden rounded-md sm:size-14">
        <Image
          src={p.images[0]}
          alt={`${p.type} at ${p.address}`}
          fill
          quality={90}
          sizes="56px"
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="text-body-md font-medium text-on-surface truncate">
          {p.address}
        </div>
        <div className="text-data-sm text-on-surface-variant">
          {p.district}
        </div>
      </div>

      {/* Right side: badges + price */}
      <div className="col-start-2 flex min-w-0 flex-wrap items-center gap-2 sm:shrink-0 sm:flex-nowrap">
        {/* Eco badge (compact, no padding/shadow) */}
        <EcoBadge rating={p.ecoRating} className="text-data-xs px-2 py-0.5" />

        {/* Price */}
        <div className="text-right font-data text-data-sm font-semibold text-primary whitespace-nowrap">
          {formatCedi(p.askingPrice)}
        </div>
      </div>
    </Link>
  );
}

/**
 * The "View all" footer row.
 */
function FooterRow({
  query,
  allCount,
  resultCount,
  isHighlighted,
  listId,
  onViewAll,
  viewAllHref,
}: {
  query: string;
  allCount: number;
  resultCount: number;
  isHighlighted: boolean;
  listId: string;
  onViewAll?: (q: string) => void;
  viewAllHref: (q: string) => string;
}) {
  const label = query.trim()
    ? `View all ${resultCount} matches for "${query}"`
    : `View all ${allCount} properties`;

  const element = (
    <div
      role="option"
      id={`${listId}-footer`}
      aria-selected={isHighlighted}
      className={`flex items-center justify-between border-t border-outline-variant/30 px-4 py-3 transition-colors ${
        isHighlighted ? "bg-primary/5" : "hover:bg-primary/5"
      }`}
    >
      <span className="text-data-sm font-semibold text-primary">{label}</span>
      <ChevronDown className="size-4 text-primary opacity-50" aria-hidden />
    </div>
  );

  if (onViewAll) {
    return (
      <button
        type="button"
        onClick={() => onViewAll(query)}
        className="w-full text-left"
      >
        {element}
      </button>
    );
  }

  return (
    <Link href={viewAllHref(query)} className="block">
      {element}
    </Link>
  );
}
