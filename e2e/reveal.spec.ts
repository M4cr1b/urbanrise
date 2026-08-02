import { test, expect, type Page } from "@playwright/test";

/**
 * The landing cinematic.
 *
 * The reveal is driven by a requestAnimationFrame lerp, so every assertion
 * scrolls, waits for the easing to settle, then reads the resulting geometry.
 */

const RUNWAY = 'section[aria-label="Introduction"]';

/**
 * Load the landing page and wait for the animated layout to take over.
 *
 * The server renders the static layout and only a motion-capable client swaps
 * in the scroll runway, so the runway is not present on first paint by design.
 */
async function gotoAnimated(page: Page) {
  await page.goto("/");
  await page.waitForSelector(RUNWAY, { state: "attached" });
}

/**
 * Scroll to a fraction of the runway and wait for the scrub to settle.
 *
 * The reveal eases toward its target over successive frames, so a fixed sleep
 * is a race — especially under emulation, where frames are slower. Instead this
 * polls the clip-path until it stops changing.
 */
async function scrubTo(page: Page, progress: number) {
  await page.evaluate((p) => {
    const runway = document.querySelector(
      'section[aria-label="Introduction"]',
    ) as HTMLElement;
    window.scrollTo(0, (runway.offsetHeight - window.innerHeight) * p);
  }, progress);

  let previous = "";
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(100);
    const current = await imageClip(page);
    if (current === previous) return;
    previous = current;
  }
}

/** The image layer's clip-path, which is what the reveal actually animates. */
function imageClip(page: Page) {
  return page.evaluate(() => {
    const wrap = document.querySelector(
      'section[aria-label="Introduction"] .sticky > div:nth-child(2)',
    ) as HTMLElement;
    return getComputedStyle(wrap).clipPath;
  });
}

test.describe("portal reveal", () => {
  test("hero is readable on landing and the image starts clipped", async ({
    page,
  }) => {
    await gotoAnimated(page);
    await expect(
      page.getByRole("heading", { name: /Live well\. Build green/i }),
    ).toBeVisible();

    // Clipped to a corner of the viewport, not yet full bleed.
    const clip = await imageClip(page);
    expect(clip).toMatch(/inset\(/);
    expect(clip).not.toMatch(/inset\(0%? 0%? 0%? 0%?\)/);
  });

  test("image reaches full bleed and the portal opens the page out of it", async ({
    page,
  }) => {
    await gotoAnimated(page);

    await scrubTo(page, 0.45);
    // Every inset has eased to ~0: the photograph now fills the viewport.
    const full = await imageClip(page);
    const insets = [...full.matchAll(/([\d.]+)%/g)].map((m) => Number(m[1]));
    expect(Math.max(...insets)).toBeLessThan(2);

    // By the end the panel behind the portal is fully revealed and legible.
    await scrubTo(page, 1);
    await expect(
      page.getByRole("heading", { name: /property information, finally/i }),
    ).toBeInViewport();
    await expect(page.getByRole("link", { name: /Verified listings/i })).toBeVisible();
  });

  test("no horizontal overflow at any point of the reveal", async ({ page }) => {
    await gotoAnimated(page);
    for (const p of [0, 0.3, 0.6, 1]) {
      await scrubTo(page, p);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      expect(overflow, `horizontal overflow at progress ${p}`).toBe(false);
    }
  });
});

test.describe("reduced motion", () => {
  // Playwright 1.62 exposes this through contextOptions rather than as a
  // top-level `use` key.
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("collapses the scroll-jack and stacks the content statically", async ({
    page,
  }) => {
    await page.goto("/");

    // The 320vh runway must not exist — that is the whole point of the query.
    const runwayHeight = await page.locator(RUNWAY).count();
    expect(runwayHeight).toBe(0);

    // Both the hero and the panel it would have revealed are plainly present.
    await expect(
      page.getByRole("heading", { name: /Live well\. Build green/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /property information, finally/i }),
    ).toBeVisible();
  });
});
