"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

/**
 * Property image gallery.
 *
 * The detail page previously rendered `images[0]` and nothing else, so a
 * listing with three photographs showed one and silently discarded the rest.
 * Every uploaded image is now reachable: a scroll-snapped strip is the
 * primary view (native touch/trackpad/mouse scroll, no click required), each
 * photograph shown whole via `object-contain` rather than cropped to a fixed
 * box, plus a thumbnail strip, arrow and keyboard navigation, and an optional
 * full-screen view for anyone who wants it — never a requirement to see a
 * photo properly.
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
  const stripRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const expandButtonRef = useRef<HTMLButtonElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const swipeRef = useRef<{ x: number; y: number } | null>(null);

  const count = images.length;
  const go = useCallback(
    (next: number) => {
      const i = ((next % count) + count) % count;
      const slide = slideRefs.current[i];
      if (slide) scrollerRef.current?.scrollTo({ left: slide.offsetLeft, behavior: expanded ? "instant" : "smooth" });
      if (expanded) setIndex(i);
      // index itself is set by the IntersectionObserver below, once the
      // scroll actually lands — that keeps it correct whether it was driven
      // by this call, a thumbnail click, or the visitor free-scrolling.
    },
    [count, expanded],
  );

  // Tracks which slide is on screen as the strip is scrolled — by click,
  // keyboard, or a free touch/trackpad scroll with no click at all.
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || expanded) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const i = Number((visible.target as HTMLElement).dataset.slide);
        if (!Number.isNaN(i)) setIndex(i);
      },
      { root, threshold: [0.6] },
    );
    slideRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [images, expanded]);

  // Arrow keys work on the gallery; Escape leaves the full-screen view.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!expanded && !sectionRef.current?.contains(document.activeElement)) return;
      if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, go, expanded]);

  // Keep the active thumbnail in view when navigating by arrow or swipe.
  useEffect(() => {
    const strip = stripRef.current;
    const thumbnail = strip?.querySelector<HTMLElement>(`[data-i="${index}"]`);
    if (strip && thumbnail) strip.scrollTo({ left: thumbnail.offsetLeft - strip.clientWidth / 2 + thumbnail.offsetWidth / 2, behavior: "smooth" });
  }, [index]);

  // Body scroll would otherwise continue behind the full-screen overlay.
  useEffect(() => {
    if (!expanded) return;
    const dialog = dialogRef.current;
    const trigger = expandButtonRef.current;
    const prev = document.body.style.overflow;
    const main = document.getElementById("workbench-main");
    const mainOverflow = main?.style.overflow;
    document.body.style.overflow = "hidden";
    if (main) main.style.overflow = "hidden";
    dialog?.showModal();
    return () => {
      dialog?.close();
      document.body.style.overflow = prev;
      if (main) main.style.overflow = mainOverflow ?? "";
      trigger?.focus({ preventScroll: true });
    };
  }, [expanded]);

  if (count === 0) return null;

  return (
    <section ref={sectionRef} aria-label={`${count} photographs`} className="mb-4 min-w-0 sm:mb-6">
      <div className="relative">
        {/* The primary way to browse: a native, scroll-snapped strip, so
            every photograph is visible whole (object-contain, not cover) and
            reachable by touch/trackpad/mouse-wheel scroll with no click at
            all. "View full size" below stays an optional extra, not the only
            way to see an uncropped photo. */}
        <div
          ref={scrollerRef}
          className="scrollbar-slim relative flex max-h-[65dvh] snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-xl bg-surface-container"
        >
          {images.map((src, i) => (
            <div
              key={src}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              data-slide={i}
              className="relative aspect-4/3 w-full shrink-0 snap-center sm:aspect-video"
            >
              <Image
                src={src}
                alt={`${alt} — photograph ${i + 1} of ${count}`}
                fill
                priority={i === 0}
                quality={90}
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-contain"
              />
            </div>
          ))}
        </div>

        {count > 1 && (
          <>
            <GalleryButton side="left" onClick={() => go(index - 1)} label="Previous photograph" />
            <GalleryButton side="right" onClick={() => go(index + 1)} label="Next photograph" />
          </>
        )}

        <button
          ref={expandButtonRef}
          type="button"
          onClick={() => setExpanded(true)}
          className="absolute right-3 top-3 flex min-h-11 items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 font-data text-[12px] text-white backdrop-blur-sm transition-colors hover:bg-black/75"
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
          className="scrollbar-slim relative mt-3 flex gap-2 overflow-x-auto overscroll-x-contain pb-1"
        >
          {images.map((src, i) => (
            <button
              key={src}
              data-i={i}
              type="button"
              onClick={() => go(i)}
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
                quality={90}
                sizes="112px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {expanded && (
        <dialog
          ref={dialogRef}
          aria-modal="true"
          aria-label={`${alt} — photograph ${index + 1} of ${count}`}
          className="fixed inset-0 m-0 flex h-dvh w-full max-h-none max-w-none flex-col border-0 bg-black/95 p-0 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-white backdrop:bg-black/95"
          onCancel={(event) => { event.preventDefault(); setExpanded(false); }}
        >
          <div className="flex justify-end p-4">
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="flex min-h-11 items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-data text-data-sm text-white hover:bg-white/20"
            >
              <X className="size-4" aria-hidden />
              Close
            </button>
          </div>

          <div
            className="relative min-h-0 flex-1 [touch-action:pan-y_pinch-zoom]"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(event) => { swipeRef.current = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null; }}
            onTouchEnd={(event) => {
              const start = swipeRef.current;
              swipeRef.current = null;
              if (!start || event.touches.length || !event.changedTouches[0]) return;
              const dx = event.changedTouches[0].clientX - start.x;
              const dy = event.changedTouches[0].clientY - start.y;
              if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
            }}
          >
            <Image
              src={images[index]}
              alt={`${alt} — photograph ${index + 1} of ${count}`}
              fill
              quality={90}
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
        </dialog>
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
