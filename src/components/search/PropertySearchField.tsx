"use client";

import { useEffect, useLayoutEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, BedDouble, Home, MapPin, Search, X } from "lucide-react";
import type { Property } from "@/lib/types";
import { EcoBadge } from "@/components/ui/Badges";
import { formatCedi } from "@/lib/format";
import { FEATURED_PROPERTY_IDS } from "@/lib/data/properties";
import styles from "./PropertySearchField.module.css";

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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 440, maxHeight: 520 });
  const listId = `property-search-list-${useId()}`;

  // Use the same address, district and region matching as the results page.
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
        !wrapperRef.current.contains(e.target as Node) &&
        !dropdownRef.current?.contains(e.target as Node)
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

  useLayoutEffect(() => {
    if (!isOpen) return;
    const place = () => {
      const anchor = inputRef.current?.getBoundingClientRect();
      const dropdown = dropdownRef.current;
      if (!anchor || !dropdown) return;
      const viewport = window.visualViewport;
      const viewportTop = viewport?.offsetTop ?? 0;
      const viewportBottom = viewportTop + (viewport?.height ?? window.innerHeight);
      const below = viewportBottom - anchor.bottom - 22;
      const above = anchor.top - viewportTop - 22;
      const openBelow = below >= 200 || below >= above;
      const maxHeight = Math.max(80, Math.min(520, openBelow ? below : above));
      const width = Math.min(640, Math.max(anchor.width, 440), window.innerWidth - 24);
      const next = {
        top: Math.max(viewportTop + 8, openBelow ? anchor.bottom + 10 : anchor.top - Math.min(dropdown.offsetHeight, maxHeight) - 10),
        left: Math.max(12, Math.min(anchor.left, window.innerWidth - width - 12)),
        width, maxHeight,
      };
      setPosition(previous => Object.keys(next).every(key => previous[key as keyof typeof next] === next[key as keyof typeof next]) ? previous : next);
    };
    place();
    const observer = new ResizeObserver(place);
    if (dropdownRef.current) observer.observe(dropdownRef.current);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    window.visualViewport?.addEventListener("resize", place);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      window.visualViewport?.removeEventListener("resize", place);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || highlightedIndex === null) return;
    const id = highlightedIndex < filtered.length ? filtered[highlightedIndex].id : "footer";
    document.getElementById(`${listId}-${id}`)?.scrollIntoView({ block: "nearest" });
  }, [isOpen, highlightedIndex, filtered.length, listId]);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnFocusOutside = (event: FocusEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node) && !dropdownRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("focusin", closeOnFocusOutside);
    return () => document.removeEventListener("focusin", closeOnFocusOutside);
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex(e.key === "ArrowDown" ? 0 : Math.max(0, filtered.length - 1));
      return;
    }
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
        } else if (highlightedIndex === filtered.length && onViewAll) onViewAll(value);
        else if (onSubmit) onSubmit(value);
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
          onClick={() => setIsOpen(true)}
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
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          role="listbox"
          aria-label="Property suggestions"
          id={listId}
          className={styles.dropdown}
          style={position}
          onMouseDown={(e) => e.preventDefault()} // Preserve focus through click
        >
          <div className={styles.heading}>
            <span className={styles.headingIcon} aria-hidden="true"><Home size={18} /></span>
            <div className={styles.headingCopy}><p>THE URBANRISE COLLECTION</p><h2>{value.trim() ? `Matches for “${value}”` : "Featured properties"}</h2></div>
            <span className={styles.matchCount}>{value.trim() ? resultCount : filtered.length}<span>{value.trim() ? (resultCount === 1 ? " match" : " matches") : (filtered.length === 1 ? " pick" : " picks")}</span></span>
          </div>
          <div className={styles.rows} role="presentation">
          {hasResults ? (
            <>
              {filtered.map((p, i) => (
                <ResultRow
                  key={p.id}
                  property={p}
                  isHighlighted={highlightedIndex === i}
                  listId={listId}
                  onSelect={() => setIsOpen(false)}
                />
              ))}
            </>
          ) : (
            <div className={styles.empty}><Search size={22} aria-hidden="true" /><strong>A little further afield?</strong><p>No properties match &quot;{value}&quot;. Try another neighbourhood or a broader search.</p></div>
          )}
          </div>
          {/* Footer row — always present */}
          <FooterRow
            query={value}
            allCount={properties.length}
            resultCount={resultCount}
            isHighlighted={highlightedIndex === filtered.length}
            listId={listId}
            onViewAll={onViewAll ? query => { onViewAll(query); setIsOpen(false); inputRef.current?.blur(); } : undefined}
            viewAllHref={viewAllHref}
            onSelect={() => setIsOpen(false)}
          />
          <div className={styles.keyboardHint} aria-hidden="true"><span><kbd>↑</kbd><kbd>↓</kbd> to explore</span><span><kbd>↵</kbd> to select</span><span><kbd>esc</kbd> to close</span></div>
        </div>
      , document.body)}
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
  onSelect,
}: {
  property: Property;
  isHighlighted: boolean;
  listId: string;
  onSelect: () => void;
}) {
  return (
    <Link
      href={`/property/${p.id}`}
      role="option"
      id={`${listId}-${p.id}`}
      aria-selected={isHighlighted}
      className={styles.result}
      onClick={onSelect}
    >
      {/* Thumbnail */}
      <div className={styles.thumbnail}>
        <Image
          src={p.images[0]}
          alt={`${p.type} at ${p.address}`}
          fill
          quality={90}
          sizes="(max-width: 520px) 64px, 80px"
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div className={`min-w-0 ${styles.resultCopy}`}>
        <div className={styles.address}>
          {p.address}
        </div>
        <div className={styles.district}>
          <MapPin size={11} aria-hidden="true" />{p.district}
        </div>
        <div className={styles.metadata}><span>{p.type}</span><span><BedDouble size={12} aria-hidden="true" />{p.bedrooms} beds</span></div>
      </div>

      {/* Right side: badges + price */}
      <div className={styles.resultAside}>
        <div className={styles.price}>
          {formatCedi(p.askingPrice)}
        </div>
        <EcoBadge rating={p.ecoRating} className={styles.eco} />
      </div>
      <ArrowUpRight size={16} className={styles.resultArrow} aria-hidden="true" />
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
  onSelect,
}: {
  query: string;
  allCount: number;
  resultCount: number;
  isHighlighted: boolean;
  listId: string;
  onViewAll?: (q: string) => void;
  viewAllHref: (q: string) => string;
  onSelect: () => void;
}) {
  const label = query.trim()
    ? `View all ${resultCount} matches for "${query}"`
    : `View all ${allCount} properties`;

  const element = <><span>{label}</span><ArrowRight size={17} aria-hidden="true" /></>;

  if (onViewAll) {
    return (
      <button
        type="button"
        onClick={() => onViewAll(query)}
        role="option" id={`${listId}-footer`} aria-selected={isHighlighted}
        className={styles.footer}
      >
        {element}
      </button>
    );
  }

  return (
    <Link href={viewAllHref(query)} role="option" id={`${listId}-footer`} aria-selected={isHighlighted} className={styles.footer} onClick={onSelect}>
      {element}
    </Link>
  );
}
