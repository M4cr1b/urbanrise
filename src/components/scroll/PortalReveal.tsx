"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useMotionEnabled, useScrollScrub } from "./useScrollScrub";

/* ---------------------------------------------------------------------------
   Timing. Progress runs 0 → 1 across the runway.
   ------------------------------------------------------------------------ */

/** Phase 1: the image opens out of its hero pill into full bleed. */
const IMAGE_END = 0.45;
/** Phase 2: a window opens at the centre and the page grows out of it. */
const PORTAL_START = 0.45;
const PORTAL_END = 0.85;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Progress through a sub-range, normalised back to 0–1. */
const phase = (p: number, start: number, end: number) =>
  clamp01((p - start) / (end - start));

/** Ease-in-out cubic — no overshoot, so the seam into normal scroll is clean. */
const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Ease-out cubic. Used for the portal: opening fast and settling slowly keeps
 * the window from dwelling at the small sizes where the panel behind it is
 * cropped mid-word.
 */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const INK_DARK: [number, number, number] = [0, 59, 27]; // primary
const INK_LIGHT: [number, number, number] = [239, 242, 235]; // inverse-on-surface

function mixInk(t: number): string {
  const [r, g, b] = INK_DARK.map((c, i) => Math.round(lerp(c, INK_LIGHT[i], t)));
  return `rgb(${r} ${g} ${b})`;
}

interface Props {
  image: { src: string; alt: string };
  /** The hero copy and search card — fades out as the image takes over. */
  hero: ReactNode;
  /** What emerges from the portal: the start of the rest of the page. */
  children: ReactNode;
}

/**
 * Scroll-driven portal reveal.
 *
 * The hero image expands out of its left-rounded pill until it fills the
 * viewport, then a rounded window opens at its centre and the rest of the page
 * grows out of it. Scroll only drives progress — `position: sticky` does the
 * pinning, and `clip-path` runs on the compositor, so no layout is recalculated
 * per frame and no React state changes while scrubbing.
 *
 * The portal opens onto the same surface colour the document continues in, so
 * when the runway ends and the stage unsticks there is no visible seam.
 */
export function PortalReveal({ image, hero, children }: Props) {
  const runwayRef = useRef<HTMLElement | null>(null);
  const imageWrapRef = useRef<HTMLDivElement | null>(null);
  const imageInnerRef = useRef<HTMLDivElement | null>(null);
  const scrimRef = useRef<HTMLDivElement | null>(null);
  const navScrimRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);
  const portalInnerRef = useRef<HTMLDivElement | null>(null);
  const cueRef = useRef<HTMLDivElement | null>(null);

  const motion = useMotionEnabled();
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const render = useCallback(
    (p: number) => {
      const e1 = ease(phase(p, 0, IMAGE_END));
      const e2 = easeOut(phase(p, PORTAL_START, PORTAL_END));

      // --- Phase 1: the image opens out of its hero pill -------------------
      // The side-pill geometry only reads when there is a copy column beside
      // it. On a phone the copy sits above instead, so the image starts as a
      // rounded panel in the lower half rather than behind the text.
      const start = narrow
        ? { top: 44, right: 6, bottom: 6, left: 6, radius: 10 }
        : { top: 10, right: 0, bottom: 10, left: 54, radius: 50 };

      const top = lerp(start.top, 0, e1);
      const right = lerp(start.right, 0, e1);
      const bottom = lerp(start.bottom, 0, e1);
      const left = lerp(start.left, 0, e1);
      const rad = lerp(start.radius, 0, e1);

      if (imageWrapRef.current) {
        imageWrapRef.current.style.clipPath = narrow
          ? `inset(${top}% ${right}% ${bottom}% ${left}% round ${rad}%)`
          : `inset(${top}% ${right}% ${bottom}% ${left}% round ${rad}% 0% 0% ${rad}%)`;
      }

      // The image itself eases back from a slight push-in, so the clip opening
      // reads as a camera pulling out rather than a mask being wiped.
      if (imageInnerRef.current) {
        imageInnerRef.current.style.transform = `scale(${lerp(1.18, 1, e1)})`;
      }

      // --- Hero copy hands over --------------------------------------------
      // Clear well before the image reaches full bleed — a half-faded search
      // card floating over the photograph reads as a rendering fault.
      const heroOut = clamp01(p / (IMAGE_END * 0.5));
      if (heroRef.current) {
        heroRef.current.style.opacity = String(1 - heroOut);
        heroRef.current.style.transform = `translateY(${heroOut * 40}px)`;
        heroRef.current.style.pointerEvents = heroOut > 0.1 ? "none" : "auto";
      }
      if (cueRef.current) {
        cueRef.current.style.opacity = String(1 - clamp01(p / 0.12));
      }

      // --- Scrim -----------------------------------------------------------
      // Only once the image is essentially full-bleed: its job is to give the
      // opening portal something to open *against*, not to tint the hero.
      const dark = ease(phase(p, 0.3, IMAGE_END)) * (1 - e2);
      if (scrimRef.current) {
        scrimRef.current.style.opacity = String(dark * 0.5);
      }
      if (navScrimRef.current) {
        navScrimRef.current.style.opacity = String(dark);
      }

      // --- Phase 2: the portal opens ---------------------------------------
      // 49.9% is a closed window; 0% is the full viewport.
      const inset = lerp(49.9, 0, e2);
      const portalRadius = lerp(28, 0, e2);
      if (portalRef.current) {
        portalRef.current.style.clipPath = `inset(${inset}% round ${portalRadius}px)`;
        portalRef.current.style.visibility = e2 <= 0 ? "hidden" : "visible";
      }
      if (portalInnerRef.current) {
        // A modest push-in: enough to read as arriving, not so much that the
        // panel's copy is cropped past recognition on the way.
        portalInnerRef.current.style.transform = `scale(${lerp(1.08, 1, e2)})`;
        portalInnerRef.current.style.opacity = String(clamp01(e2 * 3));
      }

      // --- Nav has to stay legible across a dark full-bleed image ----------
      const root = document.documentElement;
      root.style.setProperty("--ur-nav-ink", mixInk(dark));
      root.style.setProperty(
        "--ur-nav-bg",
        `rgb(248 250 244 / ${(1 - dark) * 0.8})`,
      );
    },
    [narrow],
  );

  useScrollScrub(runwayRef, render, { disabled: !motion });

  // Leave the nav as the rest of the site expects it.
  useEffect(() => {
    return () => {
      const root = document.documentElement;
      root.style.removeProperty("--ur-nav-ink");
      root.style.removeProperty("--ur-nav-bg");
    };
  }, []);

  /* --- Static layout: the server render, and the permanent one for anyone
         who asked for reduced motion. No runway, no scrub, no clipping. --- */
  if (!motion) {
    return (
      <>
        <section className="relative min-h-[80vh] overflow-hidden pt-24">
          <div className="mx-auto grid max-w-container-max items-center gap-gutter px-margin-mobile py-section-gap md:grid-cols-12 md:px-margin-desktop">
            <div className="md:col-span-7">{hero}</div>
            <div className="relative aspect-4/3 overflow-hidden rounded-xl md:col-span-5">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>
        {children}
      </>
    );
  }

  return (
    <>
      <section
        ref={runwayRef}
        className={narrow ? "relative h-[200vh]" : "relative h-[320vh]"}
        aria-label="Introduction"
      >
        <div className="sticky top-0 h-screen overflow-hidden bg-surface">
          {/* Hero copy — present on load, hands over to the image */}
          <div
            ref={heroRef}
            className="absolute inset-0 z-20 flex items-start pt-24 will-change-[opacity,transform] md:items-center md:pt-0"
          >
            <div className="mx-auto grid w-full max-w-container-max gap-gutter px-margin-mobile md:grid-cols-12 md:px-margin-desktop md:pt-16">
              <div className="md:col-span-7">{hero}</div>
            </div>
          </div>

          {/* The image that becomes the whole page */}
          <div
            ref={imageWrapRef}
            className="absolute inset-0 z-10 will-change-[clip-path]"
            style={{ clipPath: "inset(10% 0% 10% 54% round 50% 0% 0% 50%)" }}
          >
            <div
              ref={imageInnerRef}
              className="relative size-full will-change-transform"
              style={{ transform: "scale(1.18)" }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </div>
            <div
              ref={scrimRef}
              aria-hidden
              className="absolute inset-0 bg-primary"
              style={{ opacity: 0 }}
            />
          </div>

          {/* Keeps the fixed nav legible once a photograph is behind it */}
          <div
            ref={navScrimRef}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-20 h-32 bg-gradient-to-b from-primary/80 to-transparent"
            style={{ opacity: 0 }}
          />

          {/* What emerges: the start of the rest of the page */}
          <div
            ref={portalRef}
            className="absolute inset-0 z-30 bg-surface will-change-[clip-path]"
            style={{
              clipPath: "inset(49.9% round 28px)",
              visibility: "hidden",
            }}
          >
            <div
              ref={portalInnerRef}
              className="size-full will-change-transform"
              style={{ transform: "scale(1.15)", opacity: 0 }}
            >
              {children}
            </div>
          </div>

          {/* Scroll affordance — a long runway needs to announce itself.
              Hidden on phones, where it would land on top of the image panel. */}
          <div
            ref={cueRef}
            aria-hidden
            className="absolute inset-x-0 bottom-8 z-40 hidden flex-col items-center gap-2 text-primary md:flex"
          >
            <span className="text-label-caps opacity-70">Scroll to explore</span>
            <span className="block h-10 w-px animate-pulse bg-primary/40" />
          </div>
        </div>
      </section>
    </>
  );
}
