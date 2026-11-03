import { test, expect } from "@playwright/test";

test("system appearance follows device changes and manual choices take priority", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/");
  const appearance = page.getByRole("combobox", { name: "Appearance" });
  await expect(appearance).toHaveValue("system");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(16, 24, 18)");

  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(248, 250, 244)");
  await appearance.selectOption("dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ colorScheme: "dark" });
  await appearance.selectOption("light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await appearance.selectOption("system");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("appearance persists on reload and across marketing and workspace pages", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/about");
  await page.getByRole("combobox", { name: "Appearance" }).selectOption("dark");
  await page.reload();
  await expect(page.getByRole("combobox", { name: "Appearance" })).toHaveValue("dark");
  for (const route of ["/search", "/property/adabraka-compound-house-soundwave", "/market"]) {
    await page.goto(route);
    await expect(page.getByRole("combobox", { name: "Appearance" })).toHaveValue("dark");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator("body")).toHaveCSS("color-scheme", "dark");
  }
  await page.getByRole("combobox", { name: "Appearance" }).selectOption("light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(errors).toEqual([]);
});

test("appearance remains usable without local storage", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() { throw new Error("Storage blocked"); },
    });
  });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/search");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("combobox", { name: "Appearance" }).selectOption("light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("appearance choices sync between open tabs", async ({ page, context }) => {
  await page.goto("/search");
  const other = await context.newPage();
  await other.goto("/about");
  await page.getByRole("combobox", { name: "Appearance" }).selectOption("dark");
  await expect(other.getByRole("combobox", { name: "Appearance" })).toHaveValue("dark");
  await expect(other.locator("html")).toHaveAttribute("data-theme", "dark");
  await other.close();
});

test("appearance selector fits a small phone on both navigation bars", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  for (const route of ["/", "/search", "/comparables"]) {
    await page.goto(route);
    const appearance = page.getByRole("combobox", { name: "Appearance" });
    await appearance.selectOption("dark");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    const box = await appearance.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(320);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    await expect(page.locator("header")).toBeInViewport();
  }
});
