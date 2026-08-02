"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Measures a container so charts can render at real pixel sizes.
 *
 * Rendering into a scaled viewBox would shrink or stretch the type along with
 * the geometry; measuring keeps labels at their intended size at every width.
 */
export function useElementWidth<T extends HTMLElement>(
  fallback = 720,
): [RefObject<T | null>, number] {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setWidth(w);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
}
