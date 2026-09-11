"use client";

import { useRef, useEffect } from "react";
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

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        onToggle();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen, onToggle]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-2 rounded-md border px-3 py-2 font-data text-data-sm transition-all ${
          isOpen
            ? "border-primary bg-primary/10 text-primary"
            : "border-outline-variant bg-surface text-on-surface-variant hover:border-primary/50 hover:text-primary"
        }`}
      >
        <Icon className="size-4" aria-hidden />
        <span>{label}</span>
        {value !== "All" && <span className="text-on-surface-variant">{value}</span>}
        <ChevronDown
          className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 top-full z-50 mt-2 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-[var(--shadow-level-2)]"
          style={{ minWidth: "260px" }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
