import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PORT ?? 4173);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;
const useProductionServer =
  process.env.CI === "true" || process.env.PLAYWRIGHT_PRODUCTION === "true";
const authStubPort = Number(process.env.JOBTRACK_AUTH_STUB_PORT ?? 54329);
const useExistingBuild = process.env.PLAYWRIGHT_SKIP_BUILD === "true";
const webServerEnv = {
  NEXT_TELEMETRY_DISABLED: "1",
  NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${authStubPort}`,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "jobtrack-e2e",
  JOBTRACK_AUTH_STUB_PORT: String(authStubPort),
};

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 90_000,
  expect: { timeout: 20_000 },
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "list",
  outputDir: "test-results",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      testIgnore: /mobile\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      testMatch: /mobile\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 375, height: 812 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : [
        {
          command: "node tests/support/supabase-stub.mjs",
          url: `http://127.0.0.1:${authStubPort}/health`,
          reuseExistingServer: false,
          timeout: 30_000,
          env: webServerEnv,
        },
        {
          command: useProductionServer
            ? `${useExistingBuild ? "" : "npm run build && "}npm run start -- --hostname 127.0.0.1 --port ${port}`
            : `npm run dev -- --hostname 127.0.0.1 --port ${port}`,
          url: baseURL,
          reuseExistingServer: false,
          timeout: useProductionServer ? 180_000 : 120_000,
          env: webServerEnv,
        },
      ],
});
