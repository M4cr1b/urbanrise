import { test, expect } from "@playwright/test";

/**
 * Every route must load without console errors, page exceptions or failed
 * requests. Cheap to run and catches the class of regression that screenshots
 * quietly hide — a broken image host, a hydration mismatch, a thrown effect.
 */

const ROUTES = [
  "/",
  "/search",
  "/comparables",
  "/comparables?stage=analysis",
  "/comparables?stage=valuation",
  "/market",
  "/professionals",
  "/green-hub",
  "/property/UR-1042",
];

for (const route of ROUTES) {
  test(`${route} loads clean`, async ({ page }) => {
    const problems: string[] = [];

    page.on("console", (m) => {
      if (m.type() === "error") problems.push(`console: ${m.text()}`);
    });
    page.on("pageerror", (e) => problems.push(`exception: ${e.message}`));
    page.on("requestfailed", (req) => {
      // Dev-server hot-update probes are not real failures.
      if (!/hot-update|__nextjs/.test(req.url())) {
        problems.push(`request failed: ${req.url()}`);
      }
    });

    await page.goto(route, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    expect(problems, `${route}\n${problems.join("\n")}`).toEqual([]);
  });
}
