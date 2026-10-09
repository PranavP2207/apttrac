import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";
import { testEnvironment } from "./e2e/environment";
Object.assign(process.env, testEnvironment);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  globalSetup: "./e2e/global-setup.ts",
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["json", { outputFile: "test-results/results.json" }],
  ],
  use: {
    baseURL: testEnvironment.NEXTAUTH_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: existsSync(
          "C:/Program Files/Google/Chrome/Application/chrome.exe",
        )
          ? "chrome"
          : undefined,
      },
    },
  ],
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3100",
    url: `${testEnvironment.NEXTAUTH_URL}/login`,
    timeout: 180_000,
    reuseExistingServer: false,
    env: testEnvironment,
  },
});
