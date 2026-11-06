import { test, expect, type Page } from "@playwright/test";

const appearanceButton = (page: Page) => page.getByRole("button", { name: /^Appearance:/ });

async function chooseAppearance(page: Page, mode: "light" | "dark" | "system") {
  const panel = page.getByRole("dialog", { name: "Appearance settings" });
  if (!await panel.isVisible()) await appearanceButton(page).click();
  const choice = panel.getByRole("radio", { name: mode[0].toUpperCase() + mode.slice(1), exact: true });
  // The view-transition callback commits controlled radio state asynchronously.
  await choice.click();
  await expect(choice).toBeChecked();
  await expect(appearanceButton(page)).toHaveAttribute("aria-label", "Appearance: " + mode);
}

test("system appearance follows device changes and manual choices take priority", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/");
  const appearance = appearanceButton(page);
  await expect(appearance).toHaveAttribute("aria-label", "Appearance: system");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(16, 24, 18)");

  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(248, 250, 244)");
  await chooseAppearance(page, "dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ colorScheme: "dark" });
  await chooseAppearance(page, "light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await chooseAppearance(page, "system");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("appearance persists on reload and across marketing and workspace pages", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/about");
  await chooseAppearance(page, "dark");
  await page.reload();
  await expect(appearanceButton(page)).toHaveAttribute("aria-label", "Appearance: dark");
  for (const route of ["/search", "/property/adabraka-compound-house-soundwave", "/market"]) {
    await page.goto(route);
    await expect(appearanceButton(page)).toHaveAttribute("aria-label", "Appearance: dark");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator("body")).toHaveCSS("color-scheme", "dark");
  }
  await chooseAppearance(page, "light");
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
  await chooseAppearance(page, "light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("appearance choices sync between open tabs", async ({ page, context }) => {
  await page.goto("/search");
  const other = await context.newPage();
  await other.goto("/about");
  await chooseAppearance(page, "dark");
  await expect(appearanceButton(other)).toHaveAttribute("aria-label", "Appearance: dark");
  await expect(other.locator("html")).toHaveAttribute("data-theme", "dark");
  await other.close();
});

test("appearance selector fits a small phone on both navigation bars", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  for (const route of ["/", "/search", "/comparables"]) {
    await page.goto(route);
    await chooseAppearance(page, "dark");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    const panel = page.getByRole("dialog", { name: "Appearance settings" });
    const box = await panel.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(320);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(740);
    await page.keyboard.press("Escape");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    await expect(page.locator("header")).toBeInViewport();
  }
});


test("appearance panel supports keyboard selection, Escape and outside dismissal", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.goto("/about");
  const trigger = appearanceButton(page);
  await trigger.focus();
  await page.keyboard.press("Enter");
  const panel = page.getByRole("dialog", { name: "Appearance settings" });
  await expect(panel.getByRole("radio", { name: "System", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(panel.getByRole("radio", { name: "Dark", exact: true })).toBeChecked();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).not.toHaveAttribute("data-theme-transition", "true");
  await page.keyboard.press("Escape");
  await expect(panel).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  // This corner stays outside the panel on phones as well as desktop.
  await page.mouse.click(4, 4);
  await expect(panel).not.toBeVisible();
});

test("animated switches finish cleanly and unsupported browsers still change theme", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "no-preference" });
  await page.goto("/about");
  await chooseAppearance(page, "dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).not.toHaveAttribute("data-theme-transition", "true");
  await chooseAppearance(page, "light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("html")).not.toHaveAttribute("data-theme-transition", "true");
  await page.evaluate(() => Object.defineProperty(document, "startViewTransition", { value: undefined }));
  await chooseAppearance(page, "dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(errors).toEqual([]);
});
