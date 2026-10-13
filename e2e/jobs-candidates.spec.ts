import { expect, test, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { testEnvironment } from "./environment";

const db = new PrismaClient({ datasourceUrl: testEnvironment.DATABASE_URL });
const origin = testEnvironment.NEXTAUTH_URL;
const jobInput = {
  title: "Platform Engineer Phase 3",
  department: "Engineering",
  location: "Remote",
  type: "FULL_TIME",
  status: "OPEN",
  salaryMin: "100000",
  salaryMax: "150000",
  salaryCurrency: "USD",
  salaryPeriod: "YEAR",
  description: "Build reliable services with a thoughtful engineering team.",
  requirements: "TypeScript, Node.js and clear communication.",
  matchKeywords: "TypeScript, Node.js",
  memberIds: ["seed-user-manager-1"],
};
const candidateInput = {
  name: "Jamie Phase Three",
  email: " JAMIE.PHASE3@example.com ",
  phone: "+1 555 010 1234",
  linkedinUrl: "https://www.linkedin.com/in/jamie-phase-three",
  source: "MANUAL",
  sourceDetails: "Recruiter outreach",
  summary: "Experienced platform engineer.",
  rating: "4",
  tagIds: [],
};
async function login(page: Page, email = "recruiter@apttrac.local") {
  await page.goto("/login");
  await page.getByLabel("Email address", { exact: true }).fill(email);
  await page
    .getByLabel("Password", { exact: true })
    .fill(testEnvironment.SEED_ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}
async function post(page: Page, url: string, data: unknown) {
  return page.request.post(url, { data, headers: { Origin: origin } });
}
test.afterAll(async () => {
  await db.$disconnect();
});

test("recruiter creates, edits, duplicates and reversibly archives a job", async ({
  page,
}) => {
  await login(page);
  await page.goto("/jobs");
  await page.getByRole("link", { name: "Create job", exact: true }).click();
  for (const [label, value] of [
    ["Job title", jobInput.title],
    ["Department", jobInput.department],
    ["Location", jobInput.location],
    ["Salary minimum", "100000"],
    ["Salary maximum", "150000"],
    ["Description", jobInput.description],
    ["Requirements", jobInput.requirements],
    ["Matching keywords", jobInput.matchKeywords],
  ]) {
    await page.getByLabel(label, { exact: true }).fill(value);
  }
  await page.getByLabel("Status", { exact: true }).selectOption("OPEN");
  await page.getByLabel("Salary currency", { exact: true }).fill("USD");
  await page.getByLabel("Jordan Lee", { exact: true }).check();
  await page.getByRole("button", { name: "Create job", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: jobInput.title, exact: true }),
  ).toBeVisible();
  const job = await db.job.findFirstOrThrow({
    where: { title: jobInput.title },
    include: { stages: true, members: true },
  });
  expect(job.stages).toHaveLength(7);
  expect(
    job.members.some((member) => member.userId === "seed-user-manager-1"),
  ).toBe(true);
  expect(job.publishedAt).not.toBeNull();
  expect(
    await db.activity.count({
      where: { jobId: job.id, action: "JOB_CREATED" },
    }),
  ).toBe(1);
  await page.getByRole("link", { name: "Edit job", exact: true }).click();
  await page
    .getByLabel("Requirements", { exact: true })
    .fill("TypeScript, Node.js, PostgreSQL and clear communication.");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/jobs/${job.id}$`));
  expect(
    (await db.job.findUniqueOrThrow({ where: { id: job.id } }))
      .requirementsVersion,
  ).toBe(2);
  const stale = await post(page, `/api/jobs/${job.id}`, {
    ...jobInput,
    expectedUpdatedAt: job.updatedAt.toISOString(),
  });
  expect(stale.status()).toBe(409);
  expect(
    (await db.job.findUniqueOrThrow({ where: { id: job.id } })).requirements,
  ).toContain("PostgreSQL");
  await page
    .getByRole("button", { name: "Duplicate job", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: `Copy of ${jobInput.title}`,
      exact: true,
    }),
  ).toBeVisible();
  const copy = await db.job.findFirstOrThrow({
    where: { title: `Copy of ${jobInput.title}` },
    include: { stages: true, applications: true },
  });
  expect(copy.id).not.toBe(job.id);
  expect(copy.status).toBe("DRAFT");
  expect(copy.stages).toHaveLength(7);
  expect(
    copy.stages
      .map((stage) => stage.id)
      .some((id) => job.stages.some((stage) => stage.id === id)),
  ).toBe(false);
  expect(copy.requirements).toContain("PostgreSQL");
  expect(copy.publishedAt).toBeNull();
  expect(copy.applications).toHaveLength(0);
  await page.goto(`/jobs/${job.id}`);
  await page.getByRole("button", { name: "Close job", exact: true }).click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(
    (await db.job.findUniqueOrThrow({ where: { id: job.id } })).status,
  ).toBe("OPEN");
  await page.getByRole("button", { name: "Close job", exact: true }).click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(page.getByText("Closed", { exact: true }).first()).toBeVisible();
  expect(
    (await db.job.findUniqueOrThrow({ where: { id: job.id } })).closedAt,
  ).not.toBeNull();
  await page.getByRole("button", { name: "Archive job", exact: true }).click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Restore job", exact: true }),
  ).toBeVisible();
  await page.goto(`/jobs?q=${encodeURIComponent(jobInput.title)}`);
  await expect(
    page.getByRole("link", { name: jobInput.title, exact: true }),
  ).toHaveCount(0);
  await page.goto(`/jobs/${job.id}`);
  await page.getByRole("button", { name: "Restore job", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Archive job", exact: true }),
  ).toBeVisible();
  expect(
    (await db.job.findUniqueOrThrow({ where: { id: job.id } })).archivedAt,
  ).toBeNull();
  await page.goto("/jobs");
  await page.screenshot({ path: "test-results/phase-3-jobs.png" });
});

test("invalid jobs and cross-site writes fail without changing the database", async ({
  page,
}) => {
  await login(page);
  const count = await db.job.count();
  expect(
    (await post(page, "/api/jobs", { ...jobInput, salaryMin: "-5" })).status(),
  ).toBe(400);
  expect(
    (
      await post(page, "/api/jobs", {
        ...jobInput,
        salaryMin: "200000",
        salaryMax: "100000",
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await post(page, "/api/jobs", {
        ...jobInput,
        memberIds: ["seed-user-recruiter-1"],
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await page.request.post("/api/jobs", {
        data: jobInput,
        headers: { Origin: "https://untrusted.example" },
      })
    ).status(),
  ).toBe(403);
  expect(await db.job.count()).toBe(count);
  expect(
    (
      await page.request.post("/api/jobs", {
        data: "{broken",
        headers: { Origin: origin, "Content-Type": "application/json" },
      })
    ).status(),
  ).toBe(400);
  await page.goto("/jobs/new");
  await page.getByRole("button", { name: "Create job", exact: true }).click();
  await expect(
    page.getByText("Enter a job title", { exact: true }),
  ).toBeVisible();
});

test("candidate creation, tags, edits, application history and archive are persistent", async ({
  page,
}) => {
  await login(page);
  const job = await db.job.findFirstOrThrow({
    where: { title: "Senior Frontend Engineer" },
  });
  await page.goto(`/candidates/new?jobId=${job.id}`);
  for (const [label, value] of [
    ["Full name", candidateInput.name],
    ["Email address", candidateInput.email],
    ["Phone", candidateInput.phone],
    ["LinkedIn URL", candidateInput.linkedinUrl],
    ["Summary", candidateInput.summary],
  ]) {
    await page.getByLabel(label, { exact: true }).fill(value);
  }
  await page.getByRole("radio", { name: "4 stars", exact: true }).check();
  await page
    .getByRole("button", { name: "Add candidate", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: candidateInput.name, exact: true }),
  ).toBeVisible();
  const person = await db.candidate.findUniqueOrThrow({
    where: { email: "jamie.phase3@example.com" },
    include: { applications: { include: { stage: true, stageHistory: true } } },
  });
  expect(person.rating).toBe(4);
  expect(person.applications).toHaveLength(1);
  expect(person.applications[0].stage.kind).toBe("APPLIED");
  expect(person.applications[0].stageHistory).toHaveLength(1);
  await expect(
    page.getByText("Applied to Senior Frontend Engineer", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Edit candidate", exact: true }).click();
  await page
    .getByLabel("Full name", { exact: true })
    .fill("Jamie Updated Phase Three");
  await page.getByRole("radio", { name: "5 stars", exact: true }).check();
  const tag = await db.tag.findFirstOrThrow({ orderBy: { name: "asc" } });
  await page.getByLabel(tag.name, { exact: true }).check();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "Jamie Updated Phase Three",
      exact: true,
    }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("Candidate details updated", { exact: true }),
  ).toBeVisible();
  const updated = await db.candidate.findUniqueOrThrow({
    where: { id: person.id },
    include: { tags: true },
  });
  expect(updated.rating).toBe(5);
  expect(updated.tags.some((link) => link.tagId === tag.id)).toBe(true);
  expect(
    (
      await post(page, `/api/candidates/${person.id}`, {
        ...candidateInput,
        email: person.email,
        expectedUpdatedAt: person.updatedAt.toISOString(),
      })
    ).status(),
  ).toBe(409);
  expect(
    (
      await post(page, `/api/candidates/${person.id}/applications`, {
        jobId: job.id,
      })
    ).status(),
  ).toBe(409);
  await page.screenshot({
    path: "test-results/phase-3-profile.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Archive candidate", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Restore candidate", exact: true }),
  ).toBeVisible();
  await page.goto("/candidates?q=jamie.phase3");
  await expect(
    page.getByRole("link", { name: "Jamie Updated Phase Three", exact: true }),
  ).toHaveCount(0);
  await page.goto(`/candidates/${person.id}`);
  await page
    .getByRole("button", { name: "Restore candidate", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Archive candidate", exact: true }),
  ).toBeVisible();
  expect(
    await db.application.count({ where: { candidateId: person.id } }),
  ).toBe(1);
});

test("duplicate email, unsafe URLs, bad ratings and closed-job applications are atomic failures", async ({
  page,
}) => {
  await login(page);
  const existing = await db.candidate.findUniqueOrThrow({
    where: { id: "seed-candidate-1" },
  });
  const closedResponse = await post(page, "/api/jobs", {
    ...jobInput,
    title: "Closed application fixture",
    status: "CLOSED",
  });
  expect(closedResponse.status()).toBe(201);
  const closed = await closedResponse.json();
  const count = await db.candidate.count();
  expect(
    (
      await post(page, "/api/candidates", {
        ...candidateInput,
        email: existing.email,
        jobId: "",
      })
    ).status(),
  ).toBe(409);
  expect(
    (
      await post(page, "/api/candidates", {
        ...candidateInput,
        email: "invalid-url@example.com",
        linkedinUrl: "javascript:alert(1)",
        jobId: "",
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await post(page, "/api/candidates", {
        ...candidateInput,
        email: "invalid-rating@example.com",
        rating: "6",
        jobId: "",
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await post(page, "/api/candidates", {
        ...candidateInput,
        email: "closed-job@example.com",
        jobId: closed.id,
      })
    ).status(),
  ).toBe(400);
  expect(await db.candidate.count()).toBe(count);
});

test("filters match the same application; pagination, bulk tags and CSV work", async ({
  page,
}) => {
  await login(page);
  const jobs = await db.job.findMany({
    where: { status: "OPEN", archivedAt: null },
    orderBy: { title: "asc" },
    take: 2,
  });
  const createdResponse = await post(page, "/api/candidates", {
    ...candidateInput,
    name: "=SUM(1,1)",
    email: "csv-test@example.com",
    jobId: jobs[0].id,
  });
  expect(createdResponse.status()).toBe(201);
  const created = await createdResponse.json();
  await page.goto(`/candidates/${created.id}`);
  await page
    .getByRole("button", { name: "Add application", exact: true })
    .click();
  const applicationDialog = page.getByRole("dialog");
  await applicationDialog
    .getByLabel("Job", { exact: true })
    .selectOption(jobs[1].id);
  await applicationDialog
    .getByRole("button", { name: "Add application", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: jobs[1].title, exact: true }).first(),
  ).toBeVisible();
  const application = await db.application.findUniqueOrThrow({
    where: {
      candidateId_jobId: { candidateId: created.id, jobId: jobs[1].id },
    },
    include: { stage: true },
  });
  const screening = await db.stage.findFirstOrThrow({
    where: { jobId: jobs[1].id, kind: "SCREENING" },
  });
  await db.$transaction([
    db.application.update({
      where: { id: application.id },
      data: { stageId: screening.id, version: 1 },
    }),
    db.applicationStageHistory.create({
      data: {
        applicationId: application.id,
        applicationVersion: 1,
        fromStageId: application.stageId,
        fromStageName: application.stage.name,
        fromStageKind: application.stage.kind,
        toStageId: screening.id,
        toStageName: screening.name,
        toStageKind: screening.kind,
        previousEnteredAt: application.stageEnteredAt,
      },
    }),
  ]);
  await page.goto(`/candidates?q=csv-test&jobId=${jobs[0].id}&stage=SCREENING`);
  await expect(
    page.getByRole("heading", { name: "No matching candidates" }),
  ).toBeVisible();
  await page.goto("/candidates");
  await page
    .getByLabel("Sort candidates", { exact: true })
    .selectOption("name-asc");
  await expect(page).toHaveURL(/sort=name-asc/);
  const firstPageNames = await page
    .locator("tbody a[data-candidate-link]")
    .allTextContents();
  await page.getByRole("link", { name: "Next page", exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  const secondPageNames = await page
    .locator("tbody a[data-candidate-link]")
    .allTextContents();
  expect(secondPageNames.length).toBeGreaterThan(0);
  expect(secondPageNames.some((name) => firstPageNames.includes(name))).toBe(
    false,
  );
  await page.goto("/candidates?q=csv-test");
  await page
    .getByRole("checkbox", { name: "Select =SUM(1,1)", exact: true })
    .check();
  const tag = await db.tag.findFirstOrThrow({ orderBy: { name: "desc" } });
  await page.getByLabel("Bulk tag", { exact: true }).selectOption(tag.id);
  await page.getByRole("button", { name: "Apply tag", exact: true }).click();
  await expect(
    page.getByText("Tag added to 1 candidate", { exact: true }),
  ).toBeVisible();
  expect(
    await db.candidateTag.count({
      where: { candidateId: created.id, tagId: tag.id },
    }),
  ).toBe(1);
  const before = await db.candidateTag.count();
  expect(
    (
      await post(page, "/api/candidates/bulk", {
        action: "tag",
        ids: [created.id, "missing-candidate"],
        tagId: tag.id,
      })
    ).status(),
  ).toBe(404);
  expect(await db.candidateTag.count()).toBe(before);
  const csv = await page.request.get(
    `/api/candidates/export?ids=${created.id}`,
  );
  expect(csv.status()).toBe(200);
  expect(csv.headers()["content-type"]).toContain("text/csv");
  expect(await csv.text()).toContain('"\'=SUM(1,1)"');
  expect(await csv.text()).not.toContain("jamie.phase3@example.com");
});

test("managers cannot mutate or read another job's profile history or exports", async ({
  page,
}) => {
  const shared = await db.candidate.findUniqueOrThrow({
    where: { id: "seed-candidate-1" },
  });
  const hidden = await db.application.findFirstOrThrow({
    where: { candidateId: shared.id, job: { title: "Product Designer" } },
  });
  const visible = await db.application.findFirstOrThrow({
    where: {
      candidateId: shared.id,
      job: { title: "Senior Frontend Engineer" },
    },
  });
  await db.note.create({
    data: {
      candidateId: shared.id,
      applicationId: visible.id,
      authorId: "seed-user-admin",
      body: "VISIBLE ASSIGNED NOTE SENTINEL",
    },
  });
  await db.emailLog.create({
    data: {
      candidateId: shared.id,
      applicationId: visible.id,
      toEmail: shared.email,
      subject: "VISIBLE ASSIGNED EMAIL SENTINEL",
      body: "Visible assigned message",
    },
  });
  const now = new Date();
  for (const [application, rating, comment] of [
    [visible, 5, "VISIBLE ASSIGNED FEEDBACK SENTINEL"],
    [hidden, 1, "PRIVATE UNASSIGNED FEEDBACK SENTINEL"],
  ] as const) {
    await db.interview.create({
      data: {
        applicationId: application.id,
        interviewerId: "seed-user-admin",
        createdById: "seed-user-admin",
        startsAt: now,
        endsAt: new Date(now.getTime() + 3600000),
        status: "COMPLETED",
        scorecards: {
          create: {
            authorId: "seed-user-admin",
            technicalRating: rating,
            communicationRating: rating,
            cultureFitRating: rating,
            comments: comment,
          },
        },
      },
    });
  }
  await db.note.create({
    data: {
      candidateId: shared.id,
      applicationId: hidden.id,
      authorId: "seed-user-admin",
      body: "PRIVATE UNASSIGNED NOTE SENTINEL",
    },
  });
  await db.emailLog.create({
    data: {
      candidateId: shared.id,
      applicationId: hidden.id,
      toEmail: shared.email,
      subject: "PRIVATE UNASSIGNED EMAIL SENTINEL",
      body: "Private other-job message",
    },
  });
  await login(page, "manager@apttrac.local");
  await page.goto(`/candidates/${shared.id}`);
  await expect(
    page.getByRole("heading", { name: shared.name, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Senior Frontend Engineer", { exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByText("Product Designer", { exact: true })).toHaveCount(
    0,
  );
  await expect(page.getByText(/PRIVATE UNASSIGNED/)).toHaveCount(0);
  await expect(
    page.getByText("VISIBLE ASSIGNED NOTE SENTINEL", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("VISIBLE ASSIGNED EMAIL SENTINEL", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("VISIBLE ASSIGNED FEEDBACK SENTINEL", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("5.0 / 5", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Edit candidate", exact: true }),
  ).toHaveCount(0);
  expect((await post(page, "/api/jobs", jobInput)).status()).toBe(403);
  expect(
    (
      await post(page, `/api/candidates/${shared.id}/lifecycle`, {
        action: "archive",
        expectedUpdatedAt: shared.updatedAt.toISOString(),
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await page.request.get("/api/candidates/export?ids=seed-candidate-7")
    ).status(),
  ).toBe(404);
  const csv = await page.request.get("/api/candidates/export");
  expect(csv.status()).toBe(200);
  expect(await csv.text()).not.toContain("Product Designer");
  await page.goto("/candidates/seed-candidate-7");
  await expect(
    page.getByRole("heading", { name: "Page not found", exact: true }),
  ).toBeVisible();
});

test("combined source, tag, rating and date filters also constrain exports", async ({
  page,
  request,
}) => {
  expect(
    (
      await request.post("/api/candidates", {
        data: candidateInput,
        headers: { Origin: origin },
      })
    ).status(),
  ).toBe(401);
  await login(page);
  const tag = await db.tag.findFirstOrThrow({ orderBy: { name: "asc" } });
  const createdResponse = await post(page, "/api/candidates", {
    ...candidateInput,
    name: "Filter Fixture",
    email: "filter-fixture@example.com",
    source: "REFERRAL",
    rating: "3",
    tagIds: [tag.id],
    jobId: "",
  });
  expect(createdResponse.status()).toBe(201);
  const created = await createdResponse.json();
  const date = new Date().toISOString().slice(0, 10);
  const filter = `q=filter-fixture&source=REFERRAL&rating=3&tagId=${tag.id}&dateFrom=${date}&dateTo=${date}`;
  await page.goto(`/candidates?${filter}`);
  await expect(
    page.getByRole("link", { name: "Filter Fixture", exact: true }),
  ).toBeVisible();
  const exported = await page.request.get(`/api/candidates/export?${filter}`);
  expect(exported.status()).toBe(200);
  const text = await exported.text();
  expect(text).toContain("filter-fixture@example.com");
  expect(text).not.toContain("aarav.mehta");
  for (const wrong of [
    filter.replace("REFERRAL", "AGENCY"),
    filter.replace("rating=3", "rating=2"),
    filter.replace(`dateTo=${date}`, "dateTo=2000-01-01"),
  ]) {
    await page.goto(`/candidates?${wrong}`);
    await expect(
      page.getByRole("heading", {
        name: "No matching candidates",
        exact: true,
      }),
    ).toBeVisible();
    expect(
      await (await page.request.get(`/api/candidates/export?${wrong}`)).text(),
    ).not.toContain("filter-fixture@example.com");
  }
  const before = await db.candidate.count();
  expect(
    (
      await post(page, "/api/candidates", {
        ...candidateInput,
        email: "unknown-tag@example.com",
        tagIds: ["unknown-tag"],
        jobId: "",
      })
    ).status(),
  ).toBe(400);
  expect(await db.candidate.count()).toBe(before);
  const current = await db.candidate.findUniqueOrThrow({
    where: { id: created.id },
  });
  expect(
    (
      await post(page, `/api/candidates/${created.id}/lifecycle`, {
        action: "archive",
        expectedUpdatedAt: new Date(0).toISOString(),
      })
    ).status(),
  ).toBe(409);
  expect(
    (await db.candidate.findUniqueOrThrow({ where: { id: created.id } }))
      .updatedAt,
  ).toEqual(current.updatedAt);
});

test("mobile candidate form and profile remain accessible without overflow", async ({
  page,
}) => {
  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await page.goto("/candidates");
  await page.getByRole("link", { name: "Add candidate", exact: true }).click();
  await page
    .getByLabel("Full name", { exact: true })
    .fill("Mobile Phase Three");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("mobile-phase3@example.com");
  await page
    .getByRole("button", { name: "Add candidate", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Mobile Phase Three", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/phase-3-mobile.png",
    fullPage: true,
  });
  expect(browserErrors).toEqual([]);
});
