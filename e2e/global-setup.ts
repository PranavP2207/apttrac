import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { testEnvironment } from "./environment";

export default async function globalSetup() {
  const env = { ...process.env, ...testEnvironment };
  // Precreate an empty SQLite file for reliable first-run engine startup on Windows.
  if (!existsSync("prisma/e2e.db"))
    writeFileSync("prisma/e2e.db", Buffer.alloc(0), { flag: "wx" });
  // Direct Node entry points avoid shell quoting differences on Windows.
  execFileSync(
    process.execPath,
    ["node_modules/prisma/build/index.js", "migrate", "deploy"],
    { env, stdio: "inherit" },
  );
  const db = new PrismaClient({ datasourceUrl: testEnvironment.DATABASE_URL });
  try {
    // Reset only the isolated test database, in FK dependency order.
    await db.$transaction([
      db.notification.deleteMany(),
      db.activity.deleteMany(),
      db.emailLog.deleteMany(),
      db.noteMention.deleteMany(),
      db.scorecard.deleteMany(),
      db.interview.deleteMany(),
      db.candidate.updateMany({ data: { resumeId: null } }),
      db.application.updateMany({
        data: { resumeId: null, matchResumeId: null },
      }),
      db.attachment.deleteMany(),
      db.note.deleteMany(),
      db.applicationStageHistory.deleteMany(),
      db.application.deleteMany(),
      db.candidateTag.deleteMany(),
      db.candidate.deleteMany(),
      db.jobMember.deleteMany(),
      db.stage.deleteMany(),
      db.job.deleteMany(),
      db.tag.deleteMany(),
      db.emailTemplate.deleteMany(),
      db.pipelineStageTemplate.deleteMany(),
      db.company.deleteMany(),
      db.user.deleteMany(),
    ]);
  } finally {
    await db.$disconnect();
  }
  execFileSync(
    process.execPath,
    ["node_modules/tsx/dist/cli.mjs", "prisma/seed.ts"],
    { env, stdio: "inherit" },
  );
}
