"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Scroll-scrub: maps how far a tall "runway" element has been scrolled through
 * onto a smoothed progress value in [0, 1].
 *
 * The callback fires inside a requestAnimationFrame loop, never during React
 * render, so callers write straight to the DOM (CSS custom properties) instead
 * of setting state sixty times a second.
 *
 * Smoothing is what separates this from a raw scroll handler: lerping toward
 * the target each frame gives the reveal the weight of a camera easing into
 * position rather than a value yanked around by the scroll wheel.
 */

interface Options {
  /** 0–1. Lower is heavier. 0.12 reads as a smooth camera; 1 disables easing. */
  ease?: number;
  /** Skip the loop entirely (used for `prefers-reduced-motion`). */
  disabled?: boolean;
}

export function useScrollScrub(
  runwayRef: RefObject<HTMLElement | null>,
  onProgress: (progress: number) => void,
  { ease = 0.12, disabled = false }: Options = {},
) {
  // Keep the latest callback without restarting the loop when it changes.
  // Assigning during render would be a mutation in the render phase, so the
  // sync happens in its own effect.
  const cbRef = useRef(onProgress);
  useEffect(() => {
    cbRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    const runway = runwayRef.current;
    if (!runway) return;

    if (disabled) {
      cbRef.current(0);
      return;
    }

    let frame = 0;
    let current = 0;
    let target = 0;
    let running = true;

    const measure = () => {
      const rect = runway.getBoundingClientRect();
      // Distance the runway can travel while its sticky stage stays pinned.
      const travel = rect.height - window.innerHeight;
      if (travel <= 0) {
        target = 0;
        return;
      }
      target = Math.min(Math.max(-rect.top / travel, 0), 1);
    };

    const tick = () => {
      if (!running) return;

      const delta = target - current;
      // Snap when the remaining distance is invisible, so the loop settles.
      current = Math.abs(delta) < 0.0002 ? target : current + delta * ease;

      cbRef.current(current);
      frame = requestAnimationFrame(tick);
    };

    const onScroll = () => measure();
    const onResize = () => {
      measure();
      current = target; // Re-entering after a resize should not animate.
    };

    measure();
    current = target;
    frame = requestAnimationFrame(tick);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [runwayRef, ease, disabled]);
}

/**
 * False until motion is confirmed to be welcome.
 *
 * Deliberately pessimistic: the server cannot know the visitor's motion
 * preference, so it renders the static layout and a motion-capable client
 * upgrades after mount. The opposite default would render a 320vh scroll-jack
 * for someone who asked for reduced motion and only collapse it once hydration
 * caught up — a layout jump served to exactly the people the query protects.
 *
 * The trade is one frame of static hero for motion users, and at progress 0 the
 * two layouts are near-identical anyway.
 */
export function useMotionEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setEnabled(!mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return enabled;
}
