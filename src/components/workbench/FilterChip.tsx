"use client";

import { useRef, useEffect, useLayoutEffect, useState, useId } from "react";
import { ChevronDown } from "lucide-react";

interface FilterChipProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function FilterChip({
  label,
  icon: Icon,
  value,
  isOpen,
  onToggle,
  children,
}: FilterChipProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const [position, setPosition] = useState({ left: 0, top: 0 });

  useLayoutEffect(() => {
    if (!isOpen) return;
    const place = () => {
      const anchor = wrapperRef.current?.getBoundingClientRect();
      const panel = panelRef.current;
      if (!anchor || !panel) return;
      const viewport = window.visualViewport;
      const bottom = (viewport?.offsetTop ?? 0) + (viewport?.height ?? window.innerHeight);
      setPosition({ left: Math.max(12, Math.min(anchor.left, window.innerWidth - panel.offsetWidth - 12)), top: Math.max(12, Math.min(anchor.bottom + 8, bottom - panel.offsetHeight - 12)) });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    window.visualViewport?.addEventListener("resize", place);
    return () => { window.removeEventListener("resize", place); window.removeEventListener("scroll", place, true); window.visualViewport?.removeEventListener("resize", place); };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (e: PointerEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        onToggle();
      }
    };

    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { onToggle(); wrapperRef.current?.querySelector("button")?.focus(); } };
    document.addEventListener("pointerdown", handleMouseDown);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", handleMouseDown); document.removeEventListener("keydown", escape); };
  }, [isOpen, onToggle]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        className={`filter-trigger flex items-center gap-2 border px-3 py-2 transition-all ${
          isOpen
            ? "border-primary bg-primary/10 text-primary"
            : "border-outline-variant bg-surface text-on-surface-variant hover:border-primary/50 hover:text-primary"
        }`}
      >
        <Icon className="size-4" aria-hidden />
        <span>{label}</span>
        {value && value !== "All" && <span className="text-on-surface-variant">{value}</span>}
        <ChevronDown
          className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {isOpen && (
        <div
          ref={panelRef} id={panelId} role="group" aria-label={`${label} filters`}
          className="filter-panel fixed z-50 max-h-[calc(100dvh-24px)] w-[min(300px,calc(100vw-24px))] overflow-y-auto overscroll-contain border border-outline-variant bg-surface-container-lowest p-4"
          style={position}
        >
          {children}
        </div>
      )}
    </div>
  );
}
