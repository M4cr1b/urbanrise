"use client";

import Image from "next/image";
import { ArrowDown, Leaf } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useMotionEnabled, useScrollScrub } from "./useScrollScrub";
import landing from "@/components/marketing/Landing.module.css";

/* ---------------------------------------------------------------------------
   Timing. Progress runs 0 → 1 across the runway.
   ------------------------------------------------------------------------ */

/** Phase 1: the architectural image frame opens into full bleed. */
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
 * The hero image expands out of its rounded frame until it fills the
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
  const captionRef = useRef<HTMLDivElement | null>(null);

  const motion = useMotionEnabled();
  const [staticLayout, setStaticLayout] = useState(true);

  useEffect(() => {
    // Search controls need room below the fixed navigation. Short windows,
    // tablets and phones use a normal-flow layout with no pinned content.
    const mq = window.matchMedia("(min-width: 1024px) and (min-height: 800px)");
    const apply = () => setStaticLayout(!mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const render = useCallback(
    (p: number) => {
      const e1 = ease(phase(p, 0, IMAGE_END));
      const e2 = easeOut(phase(p, PORTAL_START, PORTAL_END));

      // The architectural frame opens into the full photograph.
      const start = { top: 12, right: 4, bottom: 10, left: 55, radius: 14 };

      const top = lerp(start.top, 0, e1);
      const right = lerp(start.right, 0, e1);
      const bottom = lerp(start.bottom, 0, e1);
      const left = lerp(start.left, 0, e1);
      const rad = lerp(start.radius, 0, e1);

      if (imageWrapRef.current) {
        const smallRad = lerp(1.8, 0, e1);
        imageWrapRef.current.style.clipPath = `inset(${top}% ${right}% ${bottom}% ${left}% round ${rad}% ${smallRad}% ${smallRad}% ${smallRad}%)`;
      }

      // The image itself eases back from a slight push-in, so the clip opening
      // reads as a camera pulling out rather than a mask being wiped.
      if (imageInnerRef.current) {
        imageInnerRef.current.style.transform = `scale(${lerp(1.08, 1, e1)})`;
      }

      // --- Hero copy hands over --------------------------------------------
      // Clear well before the image reaches full bleed — a half-faded search
      // card floating over the photograph reads as a rendering fault.
      const heroOut = clamp01(p / (IMAGE_END * 0.5));
      if (heroRef.current) {
        heroRef.current.style.opacity = String(1 - heroOut);
        heroRef.current.style.transform = `translateY(${heroOut * 40}px)`;
        heroRef.current.style.pointerEvents = heroOut > 0.1 ? "none" : "auto";
        heroRef.current.inert = heroOut > 0.1;
      }
      if (cueRef.current) {
        cueRef.current.style.opacity = String(1 - clamp01(p / 0.12));
      }
      if (captionRef.current) captionRef.current.style.opacity = String(1 - e1);

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
        portalRef.current.inert = e2 < 0.9;
      }
      if (portalInnerRef.current) {
        // A modest push-in: enough to read as arriving, not so much that the
        // panel's copy is cropped past recognition on the way.
        portalInnerRef.current.style.transform = `scale(${lerp(1.08, 1, e2)})`;
        portalInnerRef.current.style.opacity = String(clamp01(e2 * 3));
      }

      // --- Nav has to stay legible across a dark full-bleed image ----------
      const root = document.documentElement;
      root.style.setProperty("--ur-nav-ink", `color-mix(in srgb, var(--color-primary), #eff2eb ${dark * 100}%)`);
      root.style.setProperty(
        "--ur-nav-bg",
        `color-mix(in srgb, var(--color-surface) ${(1 - dark) * 80}%, transparent)`,
      );
    },
    [],
  );

  useScrollScrub(runwayRef, render, { disabled: !motion || staticLayout });

  // Leave the nav as the rest of the site expects it.
  useEffect(() => {
    if (staticLayout || !motion) {
      document.documentElement.style.removeProperty("--ur-nav-ink");
      document.documentElement.style.removeProperty("--ur-nav-bg");
    }
    return () => {
      const root = document.documentElement;
      root.style.removeProperty("--ur-nav-ink");
      root.style.removeProperty("--ur-nav-bg");
    };
  }, [staticLayout, motion]);

  /* --- Static layout: the server render, and the permanent one for anyone
         who asked for reduced motion. No runway, no scrub, no clipping. --- */
  if (!motion || staticLayout) {
    return (
      <>
        <section className={`hero-stage ${landing.staticStage}`}>
          <div className={landing.staticGrid}>
            <div>{hero}</div>
            <div className={landing.staticImage}>
              <Image
                src={image.src}
                alt={image.alt}
                fill
                preload
                quality={90}
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
              <div className={landing.imageCaption}>
                <div><p>The art of living well</p><span>A little closer to home.</span></div>
                <Leaf aria-hidden />
              </div>
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
        className="relative h-[320vh]"
        aria-label="Introduction"
      >
        <div className="hero-stage sticky top-0 h-screen overflow-hidden bg-surface">
          {/* Hero copy — present on load, hands over to the image */}
          <div
            ref={heroRef}
            data-hero-copy
            className={landing.cinematicCopy}
          >
            <div className={landing.cinematicGrid}>
              <div>{hero}</div>
            </div>
          </div>

          {/* The image that becomes the whole page */}
          <div
            ref={imageWrapRef}
            data-hero-image
            className="absolute inset-0 z-10 will-change-[clip-path]"
            style={{ clipPath: "inset(12% 4% 10% 55% round 14% 1.8% 1.8% 1.8%)" }}
          >
            <div
              ref={imageInnerRef}
              className="relative size-full will-change-transform"
              style={{ transform: "scale(1.08)" }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                preload
                quality={90}
                sizes="100vw"
                className="object-cover"
              />
            </div>
            <div ref={captionRef} className={`${landing.imageCaption} ${landing.cinematicCaption}`}>
              <div><p>The art of living well</p><span>A little closer to home.</span></div>
              <Leaf aria-hidden />
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
            className={landing.cue}
          >
            <ArrowDown /><span>Scroll to discover UrbanRise</span>
          </div>
        </div>
      </section>
    </>
  );
}
