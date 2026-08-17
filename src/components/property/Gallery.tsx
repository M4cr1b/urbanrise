"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

/**
 * Property image gallery.
 *
 * The detail page previously rendered `images[0]` and nothing else, so a
 * listing with three photographs showed one and silently discarded the rest.
 * Every uploaded image is now reachable: a main frame, a thumbnail strip, arrow
 * and keyboard navigation, swipe on touch, and a full-screen view.
 *
 * The strip is the important part — a carousel with no thumbnails hides how
 * many images exist, which is the failure being fixed rather than restyled.
 */
export function Gallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);

  const count = images.length;
  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  // Arrow keys work on the gallery; Escape leaves the full-screen view.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(index + 1);
      else if (e.key === "ArrowLeft") go(index - 1);
      else if (e.key === "Escape" && expanded) setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, go, expanded]);

  // Keep the active thumbnail in view when navigating by arrow or swipe.
  useEffect(() => {
    stripRef.current
      ?.querySelector<HTMLElement>(`[data-i="${index}"]`)
      ?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [index]);

  // Body scroll would otherwise continue behind the full-screen overlay.
  useEffect(() => {
    if (!expanded) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [expanded]);

  if (count === 0) return null;

  return (
    <section aria-label={`${count} photographs`} className="mb-6">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-surface-container">
        <Image
          key={images[index]}
          src={images[index]}
          alt={`${alt} — photograph ${index + 1} of ${count}`}
          fill
          priority={index === 0}
          sizes="(max-width: 1024px) 100vw, 900px"
          className="object-cover"
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            const start = touchStartX.current;
            if (start == null) return;
            const dx = e.changedTouches[0].clientX - start;
            // 40px is past an accidental drag but well short of a deliberate scroll.
            if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
            touchStartX.current = null;
          }}
        />

        {count > 1 && (
          <>
            <GalleryButton side="left" onClick={() => go(index - 1)} label="Previous photograph" />
            <GalleryButton side="right" onClick={() => go(index + 1)} label="Next photograph" />
          </>
        )}

        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 font-data text-[12px] text-white backdrop-blur-sm transition-colors hover:bg-black/75"
        >
          <Expand className="size-3.5" aria-hidden />
          View full size
        </button>

        {/* States the total, so nothing looks like the only photograph. */}
        <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-3 py-1 font-data text-[12px] text-white backdrop-blur-sm">
          {index + 1} / {count}
        </span>
      </div>

      {count > 1 && (
        <div
          ref={stripRef}
          className="scrollbar-slim mt-3 flex gap-2 overflow-x-auto pb-1"
        >
          {images.map((src, i) => (
            <button
              key={src}
              data-i={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show photograph ${i + 1}`}
              aria-current={i === index}
              className={`relative aspect-4/3 w-24 shrink-0 overflow-hidden rounded-md transition-all sm:w-28 ${
                i === index
                  ? "ring-2 ring-primary"
                  : "opacity-65 hover:opacity-100"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="112px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {expanded && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} — photograph ${index + 1} of ${count}`}
          className="fixed inset-0 z-[100] flex flex-col bg-black/95"
          onClick={() => setExpanded(false)}
        >
          <div className="flex justify-end p-4">
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-data text-data-sm text-white hover:bg-white/20"
            >
              <X className="size-4" aria-hidden />
              Close
            </button>
          </div>

          <div
            className="relative flex-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[index]}
              alt={`${alt} — photograph ${index + 1} of ${count}`}
              fill
              sizes="100vw"
              // contain, not cover: at full size the point is to see the whole
              // photograph, not to fill the frame with a crop of it.
              className="object-contain"
            />
            {count > 1 && (
              <>
                <GalleryButton side="left" onClick={() => go(index - 1)} label="Previous photograph" />
                <GalleryButton side="right" onClick={() => go(index + 1)} label="Next photograph" />
              </>
            )}
          </div>

          <p className="p-4 text-center font-data text-data-sm text-white/80">
            {index + 1} / {count}
          </p>
        </div>
      )}
    </section>
  );
}

function GalleryButton({
  side,
  onClick,
  label,
}: {
  side: "left" | "right";
  onClick: () => void;
  label: string;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`absolute top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/75 ${
        side === "left" ? "left-3" : "right-3"
      }`}
    >
      <Icon className="size-5" aria-hidden />
    </button>
  );
}
