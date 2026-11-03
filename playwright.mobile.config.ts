import { defineConfig } from "@playwright/test";

const port = Number(process.env.E2E_PORT ?? 3418);

export default defineConfig({
  testDir: "./e2e",
  testMatch: "mobile-responsive.spec.ts",
  outputDir: "test-results/mobile",
  workers: 2,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: "list",
  use: { baseURL: `http://127.0.0.1:${port}`, trace: "retain-on-failure", screenshot: "only-on-failure", reducedMotion: "reduce" },
  projects: [
    { name: "small-phone", use: { browserName: "chromium", viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true } },
    { name: "android-phone", use: { browserName: "chromium", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: "large-phone", use: { browserName: "chromium", viewport: { width: 430, height: 932 }, isMobile: true, hasTouch: true } },
    { name: "phone-landscape", use: { browserName: "chromium", viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true } },
    { name: "tablet", use: { browserName: "chromium", viewport: { width: 768, height: 1024 }, hasTouch: true } },
    { name: "desktop", use: { browserName: "chromium", viewport: { width: 1440, height: 1000 } } },
    { name: "safari-phone", use: { browserName: "webkit", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: { command: `npm run start -- --hostname 127.0.0.1 --port ${port}`, url: `http://127.0.0.1:${port}`, reuseExistingServer: false, timeout: 30_000 },
});
