import { expect, test, type Page } from "@playwright/test";

const cards = (page: Page) => page.locator('main a.group[href^="/property/"]');
const panel = (page: Page) => page.getByRole("region", { name: "Find a property", exact: true });
const search = (page: Page) => page.getByRole("combobox", { name: "Search by address or district", exact: true });

async function openSearch(page: Page) {
  await page.goto("/search");
  await expect(panel(page).getByRole("heading", { level: 1 })).toBeVisible();
  await page.waitForFunction(() => {
    const input = document.querySelector('main input[role="combobox"]');
    return input && Object.keys(input).some(key => key.startsWith("__reactProps"));
  });
}

test("selected property filters can be removed directly from the search panel", async ({ page }) => {
  await openSearch(page);
  const total = await cards(page).count();
  expect(total).toBeGreaterThan(0);
  if (page.viewportSize()!.width < 768) {
    await page.getByRole("button", { name: /^Filters/ }).click();
    const sheet = page.getByRole("dialog", { name: "Property filters" });
    await sheet.getByRole("button", { name: "Apartment", exact: true }).click();
    await sheet.getByRole("button", { name: /^Show \d+ propert/ }).click();
  } else {
    await page.getByRole("button", { name: "Type", exact: true }).click();
    await page.getByRole("group", { name: "Type filters", exact: true }).getByRole("button", { name: "Apartment", exact: true }).click();
  }
  expect(await cards(page).count()).toBeLessThan(total);
  await expect(page.getByRole("group", { name: "Applied filters", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Remove Type filter: Apartment", exact: true }).click();
  await expect(cards(page)).toHaveCount(total);
  await expect(page.getByRole("group", { name: "Applied filters", exact: true })).not.toBeVisible();
});

test("neighbourhood shortcuts, View All, search and reset stay in sync", async ({ page }) => {
  await openSearch(page);
  const total = await cards(page).count();
  const location = page.getByLabel("Quick browse locations").getByRole("button").first();
  const address = (await location.innerText()).trim();
  await location.click();
  await expect(search(page)).toHaveValue(address);
  await expect(location).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: `Remove Location filter: ${address}`, exact: true }).click();
  await expect(cards(page)).toHaveCount(total);
  await page.getByRole("button", { name: "View All", exact: true }).click();
  await expect(page.getByRole("button", { name: "Filtered", exact: true })).toHaveAttribute("aria-pressed", "true");
  await search(page).fill("Adabraka");
  await page.getByRole("button", { name: "Search properties", exact: true }).click();
  await expect(page.getByRole("listbox")).not.toBeVisible();
  expect(await cards(page).count()).toBeLessThan(total);
  await expect(page.getByRole("button", { name: "View All", exact: true })).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: /^Reset/ }).click();
  await expect(search(page)).toHaveValue("");
  await expect(cards(page)).toHaveCount(total);
  await expect(panel(page).getByRole("status")).toContainText(String(total));
});

test("search panel and filter popovers fit phones, tablets and short screens in both themes", async ({ page }) => {
  test.setTimeout(90_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openSearch(page);
  for (const mode of ["light", "dark"] as const) {
    await page.getByRole("button", { name: /^Appearance:/ }).click();
    await page.getByRole("radio", { name: mode === "light" ? "Light" : "Dark", exact: true }).check();
    await page.keyboard.press("Escape");
    for (const viewport of [{ width: 320, height: 740 }, { width: 768, height: 1024 }, { width: 844, height: 390 }, { width: 1440, height: 1000 }]) {
      await page.setViewportSize(viewport);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
      expect(await page.locator("main").evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
      await expect(search(page)).toBeVisible();
      if (viewport.width >= 768) {
        // The range panel is the tallest popover and exercises the tightest fit.
        for (const name of ["Beds & price"]) {
          await page.getByRole("button", { name, exact: true }).click();
          const filter = page.getByRole("group", { name: `${name} filters`, exact: true });
          const bounds = await filter.boundingBox();
          expect(bounds!.x).toBeGreaterThanOrEqual(0);
          expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width);
          expect(bounds!.y).toBeGreaterThanOrEqual(0);
          expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport.height);
          await page.keyboard.press("Escape");
        }
      }
      await cards(page).first().scrollIntoViewIfNeeded();
      await expect(cards(page).first()).toBeInViewport();
      await panel(page).scrollIntoViewIfNeeded();
    }
  }
});

test("every desktop filter opens and Escape returns focus to its trigger", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openSearch(page);
  for (const name of ["Type", "Style", "Storey", "Tenure", "Eco", "Status", "Beds & price"]) {
    const trigger = page.getByRole("button", { name, exact: true });
    await trigger.click();
    await expect(page.getByRole("group", { name: `${name} filters`, exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  }
});
