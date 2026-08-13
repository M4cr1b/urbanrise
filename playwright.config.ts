import { defineConfig, devices } from "@playwright/test";

/**
 * Port is configurable because `reuseExistingServer` cannot tell *our* dev
 * server from any other process already listening on 3000 — it just connects
 * and runs the suite against whatever answers. That failure is loud but deeply
 * misleading: every test fails on missing selectors rather than on "wrong app".
 *
 *   E2E_PORT=3100 npm run e2e
 */
const PORT = Number(process.env.E2E_PORT ?? 3000);
const BASE = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: [["list"]],
  // The suite runs against `next dev`, which compiles routes on first request
  // and optimises the listing photography on demand. Saturating it with one
  // worker per core makes individual navigations take tens of seconds, which
  // surfaces as assertion timeouts that look like product bugs but are not.
  workers: 4,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: BASE,
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: BASE,
    // Only adopt an already-running server on the default port, where it is
    // most likely the developer's own. On an explicit E2E_PORT, start a fresh
    // one so the run is known to be testing this checkout.
    reuseExistingServer: !process.env.E2E_PORT,
    timeout: 120_000,
  },
});
