import { test, expect, type Page } from "@playwright/test";

const detail = "/property/adabraka-compound-house-soundwave";
const routes = ["/", "/search", "/market", "/professionals", "/green-hub", "/comparables", detail, "/property/adenta-villa-ernestdoyi", "/about", "/help", "/legal"];
const cards = (page: Page) => page.locator('main a.group[href^="/property/"]');

async function navigate(page: Page, route: string) {
  const response = await page.goto(route);
  // Do not type into server-rendered controls before their client handlers mount.
  await page.waitForFunction(() => {
    const control = document.querySelector("main input") ?? document.querySelector("main button") ?? document.querySelector("header button");
    return !control || Object.keys(control).some(key => key.startsWith("__reactProps"));
  });
  return response;
}

async function fitsScreen(page: Page) {
  const sizes = await page.evaluate(() => {
    const main = document.querySelector("main");
    return { document: document.documentElement.scrollWidth - document.documentElement.clientWidth, main: main ? main.scrollWidth - main.clientWidth : 0 };
  });
  expect(sizes.document, page.url() + ": document overflow").toBeLessThanOrEqual(1);
  expect(sizes.main, page.url() + ": main content overflow").toBeLessThanOrEqual(1);
}

test("every main page fits the viewport and renders without exceptions", async ({ context }) => {
  for (const route of routes) {
    // Fresh pages distinguish actual rendering exceptions from WebKit's
    // cancelled-prefetch errors while rapidly replacing an existing document.
    const page = await context.newPage();
    const errors: string[] = [];
    const recordError = (error: Error) => errors.push(error.message);
    page.on("pageerror", recordError);
    const response = await navigate(page, route);
    expect(response?.status(), route).toBe(200);
    await page.evaluate(() => document.fonts.ready);
    await fitsScreen(page);
    if (["/about", "/help", "/legal"].includes(route)) {
      const headerBottom = await page.locator("header").first().evaluate(el => el.getBoundingClientRect().bottom);
      const headingTop = await page.getByRole("heading", { level: 1 }).evaluate(el => el.getBoundingClientRect().top);
      expect(headingTop).toBeGreaterThanOrEqual(headerBottom);
    }
    expect(errors, route).toEqual([]);
    page.off("pageerror", recordError);
    await page.close();
  }
});

test("filters can be selected, reset and dismissed within the viewport", async ({ page }) => {
  await navigate(page, "/search");
  await expect(cards(page)).toHaveCount(44);
  if (page.viewportSize()!.width < 768) {
    const trigger = page.getByRole("button", { name: /^Filters/ });
    await trigger.click();
    const sheet = page.getByRole("dialog", { name: "Property filters" });
    await expect(sheet).toBeVisible();
    await fitsScreen(page);
    const box = await sheet.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    await sheet.getByRole("button", { name: "Compound House", exact: true }).click();
    await expect(sheet.getByRole("button", { name: "Compound House", exact: true })).toHaveAttribute("aria-pressed", "true");
    await sheet.getByRole("button", { name: "Show 2 properties", exact: true }).click();
    await expect(sheet).not.toBeVisible();
    await expect(cards(page)).toHaveCount(2);
    await trigger.click();
    await sheet.getByRole("button", { name: "Reset filters", exact: true }).click();
    await sheet.getByRole("button", { name: "Show 44 properties", exact: true }).click();
    await trigger.click();
    for (let index = 0; index < 12; index++) {
      await page.keyboard.press("Tab");
      expect(await page.evaluate(() => !!document.activeElement?.closest("dialog"))).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(sheet).not.toBeVisible();
    await expect(trigger).toBeFocused();
  } else {
    await page.getByRole("button", { name: "Type", exact: true }).click();
    await page.getByRole("button", { name: "Compound House", exact: true }).click();
    await expect(cards(page)).toHaveCount(2);
    await page.getByRole("button", { name: /^Reset/ }).click();
    for (const name of ["Type", "Style", "Storey", "Tenure", "Eco", "Status", "Beds & price"]) {
      await page.getByRole("button", { name, exact: true }).click();
      const panel = page.getByRole("group", { name: `${name} filters`, exact: true });
      const box = await panel.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
      expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
      await page.keyboard.press("Escape");
    }
  }
  await expect(cards(page)).toHaveCount(44);
});

test("search suggestions remain readable and Enter applies the entered locality", async ({ page }) => {
  await navigate(page, "/search");
  const input = page.getByRole("combobox");
  await input.fill("Adabraka");
  await expect(page.getByRole("listbox")).toBeVisible();
  await expect(page.getByRole("listbox").getByRole("option")).toHaveCount(4);
  await fitsScreen(page);
  const widths = await page.getByRole("listbox").locator('a[role="option"] > div.min-w-0').evaluateAll(elements => elements.map(el => el.getBoundingClientRect().width));
  expect(widths.every(width => width > 100)).toBe(true);
  await input.press("Enter");
  await expect(cards(page)).toHaveCount(3);
  await expect(page.getByRole("listbox")).not.toBeVisible();
  await page.getByRole("button", { name: "Clear property search" }).click();
  await input.press("Escape");
  await expect(cards(page)).toHaveCount(44);
});

test("mobile navigation exposes the main sections and reaches the chosen page", async ({ page }) => {
  await navigate(page, "/about");
  const menu = page.getByRole("button", { name: "Open navigation menu" });
  if (page.viewportSize()!.width < 1280) {
    await menu.click();
    const dialog = page.getByRole("dialog", { name: "Explore UrbanRise" });
    await expect(dialog).toBeVisible();
    await fitsScreen(page);
    await dialog.getByRole("link", { name: "Green Building Hub", exact: true }).click();
  } else {
    await expect(menu).not.toBeVisible();
    await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Green Hub", exact: true }).click();
  }
  await expect(page.getByRole("heading", { name: "Green Building Materials", exact: true })).toBeVisible();
  await fitsScreen(page);
});

test("gallery navigation stays in place and full-screen photographs are accessible", async ({ page, browserName }) => {
  await navigate(page, detail);
  const main = page.locator("#workbench-main");
  const gallery = page.getByRole("region", { name: "11 photographs", exact: true });
  const first = gallery.locator('[data-slide="0"] img');
  await first.evaluate(async (image: HTMLImageElement) => { await image.decode(); });
  expect(await main.evaluate(el => el.scrollTop)).toBe(0);
  expect(await first.evaluate(el => getComputedStyle(el).objectFit)).toBe("contain");
  await gallery.getByRole("button", { name: "Next photograph", exact: true }).click();
  await expect(gallery.getByRole("button", { name: "Show photograph 2", exact: true })).toHaveAttribute("aria-current", "true");
  expect(await main.evaluate(el => el.scrollTop)).toBe(0);
  const expand = gallery.getByRole("button", { name: "View full size", exact: true });
  await expand.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const box = await dialog.boundingBox();
  expect(box!.height).toBeLessThanOrEqual(page.viewportSize()!.height + 1);
  expect(box!.width).toBe(page.viewportSize()!.width);
  await dialog.getByRole("button", { name: "Next photograph", exact: true }).click();
  await expect(dialog).toHaveAttribute("aria-label", /photograph 3 of 11/);
  if (browserName === "chromium" && page.viewportSize()!.width < 768) {
    const session = await page.context().newCDPSession(page);
    const w = page.viewportSize()!.width;
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: w * 0.8, y: 350 }] });
    for (let step = 1; step <= 5; step++) await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: w * (0.8 - step * 0.1), y: 350 }] });
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect(dialog).toHaveAttribute("aria-label", /photograph 4 of 11/);
    await session.detach();
  }
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(expand).toBeFocused();
  await fitsScreen(page);
  await expect(page.locator('#agent-contact a[href="tel:+233243536135"]')).toHaveAttribute("href", "tel:+233243536135");
  if (page.viewportSize()!.width < 1024) await expect(page.getByRole("link", { name: "Call agent", exact: true })).toHaveAttribute("href", "tel:+233243536135");
});

test("professional discipline selection and market search work on touch layouts", async ({ page }) => {
  await navigate(page, "/professionals");
  const professionals = page.locator("main ul.grid > li");
  await expect(professionals.first()).toBeVisible();
  const initialCount = await professionals.count();
  if (page.viewportSize()!.width < 768) await page.getByLabel("Professional discipline").selectOption("Estate Agent");
  else await page.getByRole("button", { name: "Estate Agent", exact: true }).click();
  await expect.poll(() => professionals.count()).toBeLessThan(initialCount);
  await expect(professionals.first()).toBeVisible();
  for (let index = 0; index < await professionals.count(); index++) {
    await expect(professionals.nth(index).getByText("Estate Agent", { exact: true })).toBeVisible();
  }
  await fitsScreen(page);
  await navigate(page, "/market");
  await page.getByRole("textbox", { name: "Search neighbourhoods" }).fill("Amrahia");
  await expect(page.locator("main ul.grid > li")).toHaveCount(1);
  await fitsScreen(page);
});
