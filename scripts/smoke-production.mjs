import "dotenv/config";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { chromium, expect } from "@playwright/test";

// Run against the local production server with a separate browser profile.
const baseURL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
assert(
  ["localhost", "127.0.0.1", "[::1]"].includes(new URL(baseURL).hostname),
  "Smoke checks must target a local server.",
);
mkdirSync("test-results", { recursive: true });
const browser = await chromium.launch({
  channel: existsSync("C:/Program Files/Google/Chrome/Application/chrome.exe")
    ? "chrome"
    : undefined,
});
try {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 1440, height: 960 },
  });
  const page = await context.newPage();
  const browserErrors = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error")
      browserErrors.push(`${message.text()} ${message.location().url}`);
  });
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
  assert.equal(
    (await context.request.get("/api/workspace/summary")).status(),
    401,
  );
  await page.screenshot({ path: "test-results/production-login.png" });

  await page
    .getByLabel("Email address", { exact: true })
    .fill(process.env.SEED_ADMIN_EMAIL ?? "admin@apttrac.local");
  await page
    .getByLabel("Password", { exact: true })
    .fill(process.env.SEED_ADMIN_PASSWORD ?? "");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(
    page.getByRole("heading", { name: /Good (morning|afternoon|evening),/ }),
  ).toBeVisible();
  const summary = await page.request.get("/api/workspace/summary");
  assert.equal(summary.status(), 200);
  const { counts } = await summary.json();
  assert.equal(typeof counts.candidates, "number");
  await page.screenshot({ path: "test-results/production-desktop.png" });

  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.screenshot({ path: "test-results/production-dark.png" });
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await page.goto("/jobs/new");
  await expect(
    page.getByRole("heading", { name: "Create a job", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Create job", exact: true }).click();
  await expect(
    page.getByText("Enter a job title", { exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: "test-results/production-job-form.png" });
  await page.goto("/candidates");
  await page.locator("tbody a[data-candidate-link]").first().click();
  await expect(
    page.getByRole("heading", { name: "Timeline", exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: "test-results/production-candidate.png" });
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await page.screenshot({ path: "test-results/production-candidate-dark.png" });
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.screenshot({
    path: "test-results/production-candidate-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("dialog", { name: "Navigation" })
    .getByRole("link", { name: "Jobs", exact: true })
    .click();
  await expect(page).toHaveURL(/\/jobs$/);
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.screenshot({ path: "test-results/production-mobile.png" });

  await page.getByRole("button", { name: "Open profile menu" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login/);
  assert.equal(
    (await page.request.get("/api/workspace/summary")).status(),
    401,
  );
  assert.deepEqual(
    browserErrors,
    [],
    "Production browser must not log rendering or runtime errors.",
  );
  writeFileSync(
    "test-results/production-smoke.json",
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        status: "passed",
        baseURL,
        flows: [
          "guest guards",
          "admin login",
          "scoped summary",
          "desktop",
          "dark theme",
          "job form validation",
          "candidate profile and timeline",
          "candidate light/dark/mobile layouts",
          "mobile navigation",
          "logout",
        ],
      },
      null,
      2,
    ),
  );
  console.log(
    "Production smoke passed: guards, login, summary, themes, job form, candidate profile, mobile navigation and logout.",
  );
} finally {
  await browser.close();
}
