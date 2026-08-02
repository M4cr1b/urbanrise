import { test, expect } from "@playwright/test";

/**
 * The workbench: the comparables matrix and the valuation workflow it feeds.
 */

test.describe("comparables matrix", () => {
  test("subject column stays frozen while comparables scroll horizontally", async ({
    page,
  }) => {
    await page.goto("/comparables");

    const scroller = page.locator("main .overflow-auto").first();
    await expect(scroller).toBeVisible();

    const before = await scroller.evaluate((el) => {
      const cell = [...el.querySelectorAll("div")].find(
        (d) =>
          d.className.includes("sticky left-0") &&
          d.textContent?.startsWith("Property type"),
      );
      return cell!.getBoundingClientRect().left - el.getBoundingClientRect().left;
    });

    await scroller.evaluate((el) => {
      el.scrollLeft = 900;
      el.scrollTop = 260;
    });
    await page.waitForTimeout(300);

    const after = await scroller.evaluate((el) => {
      const cell = [...el.querySelectorAll("div")].find(
        (d) =>
          d.className.includes("sticky left-0") &&
          d.textContent?.startsWith("Property type"),
      );
      const band = el.querySelector(".sticky.left-0.top-0")!;
      const box = el.getBoundingClientRect();
      return {
        subjectLeft: cell!.getBoundingClientRect().left - box.left,
        addressTop: band.getBoundingClientRect().top - box.top,
        scrolled: el.scrollLeft,
      };
    });

    expect(after.scrolled).toBeGreaterThan(500);
    expect(after.subjectLeft).toBeCloseTo(before, 0); // still pinned left
    expect(after.addressTop).toBeCloseTo(0, 0); // header still pinned top
  });

  test("rows stay aligned across every column", async ({ page }) => {
    await page.goto("/comparables");

    // Every cell labelled "Tenure" must share a top edge, whatever the
    // content heights above it — this is what the single-grid layout buys.
    const tops = await page.evaluate(() => {
      const cells = [...document.querySelectorAll("main div")].filter((d) =>
        d.textContent?.startsWith("Tenure"),
      );
      return cells.map((c) => Math.round(c.getBoundingClientRect().top));
    });

    expect(tops.length).toBeGreaterThan(3);
    expect(new Set(tops).size).toBe(1);
  });
});

test.describe("valuation workflow", () => {
  test("shortlisting drives the badge, the analysis and the submit gate", async ({
    page,
  }) => {
    await page.goto("/comparables");

    // Empty shortlist blocks the later stages.
    await page.goto("/comparables?stage=analysis");
    await expect(
      page.getByRole("heading", { name: /No comparables shortlisted/i }),
    ).toBeVisible();

    // Add three comparables.
    await page.goto("/comparables");
    const adders = page.locator('button[aria-label^="Add "]');
    for (let i = 0; i < 3; i++) await adders.nth(i).click();

    await expect(
      page.getByRole("link", { name: /Shortlist/i }).locator("span"),
    ).toHaveText("3");

    // Analysis derives an indicated value from the shortlist.
    await page.goto("/comparables?stage=analysis");
    const tile = page
      .locator("div")
      .filter({ hasText: /^Indicated value₵/ })
      .last();
    await expect(tile).toBeVisible();
    expect(await tile.textContent()).toMatch(/₵[\d,]+/);

    // Submit stays disabled until an opinion of value is committed.
    await page.goto("/comparables?stage=submit");
    const submit = page.getByRole("button", { name: /Submit valuation/i });
    await expect(submit).toBeDisabled();

    await page.goto("/comparables?stage=valuation");
    await page.getByRole("button", { name: /Use indicated/i }).click();

    await page.goto("/comparables?stage=submit");
    await expect(page.getByRole("button", { name: /Submit valuation/i })).toBeEnabled();
  });
});

test.describe("search", () => {
  test("filters narrow the result set", async ({ page }) => {
    await page.goto("/search");

    const count = page.locator("main").getByText(/properties$|property$/).first();
    const initial = await count.textContent();

    // Unregistered title is the risk filter a valuer reaches for.
    await page.getByRole("button", { name: "Unregistered", exact: true }).click();
    await page.waitForTimeout(200);

    const filtered = await count.textContent();
    expect(filtered).not.toBe(initial);

    // Only unregistered-title stock survives, and it is flagged as such in the
    // results rather than being presented as equivalent evidence.
    const results = page.locator("main ul > li");
    await expect(results).toHaveCount(1);
    await expect(results.first().getByText("Unregistered")).toBeVisible();
  });
});
