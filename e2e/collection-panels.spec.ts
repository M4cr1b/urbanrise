import { test, expect, type Page } from "@playwright/test";

const cards = (page: Page) => page.locator("main ul.grid > li");

async function open(page: Page, route: string) {
  await page.goto(route);
  await page.getByRole("heading", { level: 1 }).waitFor();
  await page.waitForFunction(() => {
    const input = document.querySelector("main input");
    return input && Object.keys(input).some(key => key.startsWith("__reactProps"));
  });
}

test("professionals search, discipline and registration filters reset together", async ({ page }) => {
  await open(page, "/professionals");
  const total = await cards(page).count();
  expect(total).toBeGreaterThan(0);
  if (page.viewportSize()!.width < 768) await page.getByLabel("Professional discipline").selectOption("Estate Agent");
  else await page.getByRole("button", { name: "Estate Agent", exact: true }).click();
  expect(await cards(page).count()).toBeLessThan(total);
  await page.getByRole("checkbox", { name: "Registered only" }).check();
  for (const card of await cards(page).all()) await expect(card.getByText("Registered", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(cards(page)).toHaveCount(total);
  await expect(page.getByRole("checkbox", { name: "Registered only" })).not.toBeChecked();
  await page.getByRole("textbox", { name: "Search professionals", exact: true }).fill("no-such-professional-999");
  await expect(cards(page)).toHaveCount(0);
  await expect(page.getByText("No professionals match these filters.")).toBeVisible();
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(cards(page)).toHaveCount(total);
});

test("market search and ordering work with the new controls", async ({ page }) => {
  await open(page, "/market");
  const total = await cards(page).count();
  const locality = (await cards(page).first().getByRole("heading", { level: 2 }).innerText()).trim();
  await page.getByRole("textbox", { name: "Search neighbourhoods", exact: true }).fill(locality);
  expect(await cards(page).count()).toBeLessThanOrEqual(total);
  for (const heading of await cards(page).getByRole("heading", { level: 2 }).allTextContents()) expect(heading.toLowerCase()).toContain(locality.toLowerCase());
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(cards(page)).toHaveCount(total);
  if (page.viewportSize()!.width < 640) {
    await page.getByLabel("Sort neighbourhoods").selectOption("price-desc");
    await expect(page.getByLabel("Sort neighbourhoods")).toHaveValue("price-desc");
  } else {
    await page.getByRole("button", { name: "Most expensive", exact: true }).click();
    await expect(page.getByRole("button", { name: "Most expensive", exact: true })).toHaveAttribute("aria-pressed", "true");
  }
});

test("green hub category and material searches retain their results and reset", async ({ page }) => {
  await open(page, "/green-hub");
  const total = await cards(page).count();
  await page.getByRole("button", { name: "Energy", exact: true }).click();
  await expect(page.getByRole("button", { name: "Energy", exact: true })).toHaveAttribute("aria-pressed", "true");
  expect(await cards(page).count()).toBeLessThan(total);
  await page.getByRole("textbox", { name: "Search materials", exact: true }).fill("no-such-material-999");
  await expect(cards(page)).toHaveCount(0);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(cards(page)).toHaveCount(total);
  await expect(page.getByRole("button", { name: "Everything", exact: true })).toHaveAttribute("aria-pressed", "true");
});

for (const route of ["/professionals", "/market", "/green-hub"]) {
  test(`${route} panels fit narrow screens in both themes`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page, route);
    for (const mode of ["light", "dark"] as const) {
      await page.getByRole("button", { name: /^Appearance:/ }).click();
      await page.getByRole("radio", { name: mode === "dark" ? "Dark" : "Light", exact: true }).check();
      await page.keyboard.press("Escape");
      for (const width of [320, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
        expect(await page.locator("main").evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await cards(page).first().scrollIntoViewIfNeeded();
        await expect(cards(page).first()).toBeInViewport();
      }
    }
  });
}

test("property suggestions stay readable and keyboard accessible in search and the homepage", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of ["/search", "/"]) {
    await page.goto(route);
    const input = page.getByRole("combobox", { name: "Search by address or district", exact: true });
    await input.click();
    const dropdown = page.getByRole("listbox", { name: "Property suggestions" });
    await expect(dropdown).toBeVisible();
    await input.press("ArrowDown");
    await expect(dropdown.getByRole("option").first()).toHaveAttribute("aria-selected", "true");
    const thumbnail = await dropdown.locator("img").first().boundingBox();
    expect(thumbnail!.width / thumbnail!.height).toBeCloseTo(4 / 3, 1);
    await input.press("Escape");
    await expect(dropdown).not.toBeVisible();
    await input.press("ArrowDown");
    await expect(dropdown).toBeVisible();
    await input.fill("no-such-location-999");
    await expect(dropdown.getByText(/No properties match/)).toBeVisible();
    await input.fill("");
    await expect(dropdown.getByRole("option").first()).toBeVisible();
    const bounds = await dropdown.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
    await dropdown.getByRole("option", { name: /^View all \d+ properties/ }).click();
    await expect(dropdown).not.toBeVisible();
  }
});
