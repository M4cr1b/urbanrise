import { expect, test, type Page } from "@playwright/test";

const RUNWAY = 'section[aria-label="Introduction"]';
const searchButton = (page: Page) => page.getByRole("button", { name: "Search properties", exact: true });
const ecoSwitch = (page: Page) => page.getByRole("checkbox", { name: "Show eco-rated homes", exact: true });

async function openLanding(page: Page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: /Live well\. Build green\. Buy smart\./ })).toBeVisible();
  // Wait for client handlers before selecting values from server-rendered fields.
  await page.waitForFunction(() => {
    const input = Array.from(document.querySelectorAll<HTMLInputElement>('main input[role="combobox"]'))
      .find(element => element.getClientRects().length > 0);
    return input && Object.keys(input).some(key => key.startsWith("__reactProps"));
  });
}

async function fitsScreen(page: Page) {
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
  expect(await page.locator("main").evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
}

test("a short desktop viewport presents a static hero with a reachable search action", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openLanding(page);
  await expect(page.locator(RUNWAY)).toHaveCount(0);
  const submit = searchButton(page);
  await expect(submit).toHaveCount(1);
  await submit.scrollIntoViewIfNeeded();
  await expect(submit).toBeInViewport({ ratio: 1 });
  const bounds = await submit.boundingBox();
  const headerBottom = await page.locator("header").first().evaluate(element => element.getBoundingClientRect().bottom);
  expect(bounds!.y).toBeGreaterThanOrEqual(headerBottom);
  await fitsScreen(page);
});

for (const ecoOnly of [true, false]) {
  test(`landing search carries intent, location and filters with eco ${ecoOnly ? "on" : "off"}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openLanding(page);

    const intent = ecoOnly ? "Rent" : "New Developments";
    await page.getByRole("button", { name: intent, exact: true }).click();
    await expect(page.getByRole("button", { name: intent, exact: true })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("combobox", { name: "Property Type", exact: true }).selectOption("Apartment");
    await page.getByRole("combobox", { name: "Minimum bedrooms", exact: true }).selectOption("3");
    await page.getByRole("combobox", { name: "Maximum price", exact: true }).selectOption("3000000");
    if (await ecoSwitch(page).isChecked() !== ecoOnly) {
      await ecoSwitch(page).focus();
      await page.keyboard.press("Space");
    }
    const location = page.getByRole("combobox", { name: "Search by address or district", exact: true });
    await location.fill("East Legon");
    await location.press("Escape");
    await searchButton(page).click();

    await expect(page).toHaveURL(/\/search\?/);
    const url = new URL(page.url());
    expect(url.searchParams.get("intent")).toBe(ecoOnly ? "rent" : "new");
    expect(url.searchParams.get("q")).toBe("East Legon");
    expect(url.searchParams.get("type")).toBe("Apartment");
    expect(url.searchParams.get("minBeds")).toBe("3");
    expect(url.searchParams.get("maxPrice")).toBe("3000000");
    expect(url.searchParams.get("eco")).toBe(ecoOnly ? "B" : null);
  });
}

test("the landing composition fits phones, tablets and desktops in both appearances", async ({ page }) => {
  test.setTimeout(90_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openLanding(page);
  for (const mode of ["light", "dark"] as const) {
    await page.getByRole("button", { name: /^Appearance:/ }).click();
    await page.getByRole("radio", { name: mode === "light" ? "Light" : "Dark", exact: true }).check();
    await expect(page.locator("html")).toHaveAttribute("data-theme", mode);
    await page.keyboard.press("Escape");
    for (const viewport of [{ width: 320, height: 740 }, { width: 768, height: 1024 }, { width: 844, height: 390 }, { width: 1440, height: 1000 }]) {
      await page.setViewportSize(viewport);
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(searchButton(page)).toHaveCount(1);
      await fitsScreen(page);
      await searchButton(page).scrollIntoViewIfNeeded();
      await expect(searchButton(page)).toBeInViewport();
      await fitsScreen(page);
    }
  }
});

test("the eco switch is reachable and operable from the keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openLanding(page);
  const checkbox = ecoSwitch(page);
  const initiallyChecked = await checkbox.isChecked();
  await page.getByRole("combobox", { name: "Maximum price", exact: true }).focus();
  // The submit and eco control may be arranged either side of the same footer.
  for (let step = 0; step < 5 && !await checkbox.evaluate(element => element === document.activeElement); step++) {
    await page.keyboard.press("Tab");
  }
  await expect(checkbox).toBeFocused();
  await page.keyboard.press("Space");
  await expect(checkbox).toBeChecked({ checked: !initiallyChecked });
  await page.keyboard.press("Space");
  await expect(checkbox).toBeChecked({ checked: initiallyChecked });
});
