import { expect, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const password = "AptTraCE2E!2026";
const db = new PrismaClient({ datasourceUrl: "file:./e2e.db" });

async function login(
  page: import("@playwright/test").Page,
  email = "admin@apttrac.local",
) {
  await page.goto("/login");
  await page.getByLabel("Email address", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test.afterAll(async () => {
  await db.$disconnect();
});

test("seed relations and stage history are consistent", async () => {
  expect(await db.job.count()).toBe(5);
  expect(await db.candidate.count()).toBe(30);
  expect(await db.application.count()).toBe(36);
  expect(await db.interview.count()).toBe(12);
  expect(await db.scorecard.count()).toBe(4);
  expect(await db.note.count()).toBe(8);
  expect(await db.emailTemplate.count()).toBe(4);
  const applications = await db.application.findMany({
    include: {
      stage: true,
      stageHistory: { orderBy: { applicationVersion: "asc" } },
    },
  });
  for (const application of applications) {
    expect(application.stage.jobId).toBe(application.jobId);
    expect(application.stageHistory.length).toBe(application.version + 1);
    expect(application.stageHistory[0].toStageKind).toBe("APPLIED");
    expect(application.stageHistory.at(-1)?.toStageId).toBe(
      application.stageId,
    );
  }
});

test("private pages redirect and private APIs reject guests", async ({
  page,
  request,
}) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
  expect((await request.get("/api/workspace/summary")).status()).toBe(401);
});

test("invalid credentials show an accessible generic error", async ({
  page,
}) => {
  await page.goto("/login");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("admin@apttrac.local");
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("alert", { name: "Sign-in error" }),
  ).toContainText("Email or password is incorrect");
  await expect(page).toHaveURL(/\/login/);
});

test("admin login, keyboard controls, themes and logout", async ({ page }) => {
  await login(page);
  await expect(
    page.getByRole("heading", {
      name: /Good (morning|afternoon|evening), Priya/,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Settings", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.screenshot({
    path: "test-results/dark-workspace.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  await expect(
    page.getByRole("button", { name: "Expand sidebar" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Expand sidebar" }).click();
  await page.screenshot({
    path: "test-results/desktop-workspace.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Open profile menu" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login/);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test("recruiter cannot access administrator data", async ({ page }) => {
  await login(page, "recruiter@apttrac.local");
  await expect(
    page.getByRole("link", { name: "Settings", exact: true }),
  ).toHaveCount(0);
  expect((await page.request.get("/api/admin/users")).status()).toBe(403);
  await page.goto("/settings");
  await expect(
    page.getByRole("heading", { name: "Access restricted" }),
  ).toBeVisible();
});

test("manager data is scoped to assigned jobs", async ({ page }) => {
  await login(page, "manager@apttrac.local");
  const response = await page.request.get("/api/workspace/summary");
  expect(response.status()).toBe(200);
  const summary = await response.json();
  const allowed = await db.jobMember.findMany({
    where: { userId: "seed-user-manager-1" },
  });
  expect(summary.jobs.length).toBeGreaterThan(0);
  expect(summary.jobs.length).toBeLessThan(5);
  expect(
    summary.jobs.every((job: { id: string }) =>
      allowed.some((member) => member.jobId === job.id),
    ),
  ).toBe(true);
  expect((await page.request.get("/api/admin/users")).status()).toBe(403);
  const search = await page.request.get("/api/search?q=Product");
  expect((await search.json()).jobs).toHaveLength(0);
  await page.goto("/candidates");
  await expect(page.getByText("Product Designer", { exact: true })).toHaveCount(
    0,
  );
});

test("global search opens matching candidates with the keyboard", async ({
  page,
}) => {
  await login(page);
  await page.keyboard.press("Control+k");
  await page.getByRole("combobox", { name: "Search query" }).fill("Aarav");
  await expect(page.getByRole("option", { name: /Aarav Mehta/ })).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/candidates\?highlight=seed-candidate-1$/);
  await expect(page.locator("#seed-candidate-1")).toContainText("Aarav Mehta");
});

test("revoked and disabled sessions cannot read private data", async ({
  page,
}) => {
  await login(page, "recruiter2@apttrac.local");
  await db.user.update({
    where: { email: "recruiter2@apttrac.local" },
    data: { sessionVersion: { increment: 1 } },
  });
  expect((await page.request.get("/api/workspace/summary")).status()).toBe(401);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
  await db.user.update({
    where: { email: "recruiter2@apttrac.local" },
    data: { isActive: false },
  });
  try {
    await page
      .getByLabel("Email address", { exact: true })
      .fill("recruiter2@apttrac.local");
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(
      page.getByRole("alert", { name: "Sign-in error" }),
    ).toContainText("Email or password is incorrect");
  } finally {
    await db.user.update({
      where: { email: "recruiter2@apttrac.local" },
      data: { isActive: true },
    });
  }
});

test("mobile navigation works without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("dialog", { name: "Navigation" })).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "Jobs", exact: true })
    .click();
  await expect(page).toHaveURL(/\/jobs$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/mobile-workspace.png",
    fullPage: true,
  });
});
