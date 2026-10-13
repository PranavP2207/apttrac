import "server-only";
import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { assertRole } from "@/lib/auth/permissions";
import type { CurrentUser } from "@/lib/auth/session";
import { DomainError } from "@/lib/errors";
import { checkRevision, nextRevision } from "@/lib/mutations";
import {
  jobSchema,
  jobEditSchema,
  jobLifecycleSchema,
  keywords,
  type JobInput,
} from "./validation";

function slug(title: string) {
  return `${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 80)}-${randomUUID().slice(0, 8)}`;
}
function fields(input: JobInput) {
  return {
    title: input.title,
    department: input.department,
    location: input.location,
    type: input.type,
    status: input.status,
    salaryCurrency: input.salaryCurrency,
    salaryPeriod: input.salaryPeriod,
    description: input.description,
    requirements: input.requirements,
    salaryMin: input.salaryMin ? Number(input.salaryMin) : null,
    salaryMax: input.salaryMax ? Number(input.salaryMax) : null,
    matchKeywords: keywords(input.matchKeywords),
  };
}
async function checkMembers(tx: Prisma.TransactionClient, ids: string[]) {
  if (
    new Set(ids).size !== ids.length ||
    (await tx.user.count({
      where: { id: { in: ids }, role: "HIRING_MANAGER", isActive: true },
    })) !== ids.length
  )
    throw new DomainError(400, "Choose active hiring managers from the list.");
}
export async function createJob(raw: unknown, user: CurrentUser) {
  assertRole(user, ["ADMIN", "RECRUITER"]);
  const input = jobSchema.parse(raw);
  return db.$transaction(async (tx) => {
    await checkMembers(tx, input.memberIds);
    const stages = await tx.pipelineStageTemplate.findMany({
      where: { companyId: "singleton" },
      orderBy: { position: "asc" },
    });
    if (!stages.some((s) => s.kind === "APPLIED"))
      throw new DomainError(
        400,
        "The company pipeline needs an Applied stage.",
      );
    const job = await tx.job.create({
      data: {
        ...fields(input),
        slug: slug(input.title),
        createdById: user.id,
        publishedAt: input.status === "OPEN" ? new Date() : null,
        closedAt: input.status === "CLOSED" ? new Date() : null,
        members: { create: input.memberIds.map((userId) => ({ userId })) },
        stages: {
          create: stages.map(({ name, kind, color, position }) => ({
            name,
            kind,
            color,
            position,
          })),
        },
      },
    });
    await tx.activity.create({
      data: {
        actorId: user.id,
        jobId: job.id,
        entityType: "JOB",
        entityId: job.id,
        action: "JOB_CREATED",
        description: `Created job ${job.title}`,
      },
    });
    return { id: job.id };
  });
}
export async function editJob(id: string, raw: unknown, user: CurrentUser) {
  assertRole(user, ["ADMIN", "RECRUITER"]);
  const { expectedUpdatedAt, ...input } = jobEditSchema.parse(raw);
  return db.$transaction(async (tx) => {
    const job = await tx.job.findUnique({ where: { id } });
    if (!job) throw new DomainError(404, "Job not found.");
    if (job.archivedAt)
      throw new DomainError(400, "Restore this job before editing.");
    checkRevision(job.updatedAt, expectedUpdatedAt);
    await checkMembers(tx, input.memberIds);
    const data = fields(input);
    const changed =
      job.requirements !== data.requirements ||
      JSON.stringify(job.matchKeywords) !== JSON.stringify(data.matchKeywords);
    const updated = await tx.job.updateMany({
      where: { id, updatedAt: job.updatedAt },
      data: {
        ...data,
        updatedAt: nextRevision(job.updatedAt),
        requirementsVersion: { increment: changed ? 1 : 0 },
        publishedAt:
          input.status === "OPEN"
            ? job.publishedAt || new Date()
            : job.publishedAt,
        closedAt: input.status === "CLOSED" ? job.closedAt || new Date() : null,
      },
    });
    if (!updated.count)
      throw new DomainError(409, "This job changed. Refresh before saving.");
    await tx.jobMember.deleteMany({ where: { jobId: id } });
    for (const userId of input.memberIds)
      await tx.jobMember.create({ data: { jobId: id, userId } });
    await tx.activity.create({
      data: {
        actorId: user.id,
        jobId: id,
        entityType: "JOB",
        entityId: id,
        action: "JOB_UPDATED",
        description: `Updated job ${input.title}`,
      },
    });
    return { id };
  });
}
export async function jobLifecycle(
  id: string,
  raw: unknown,
  user: CurrentUser,
) {
  assertRole(user, ["ADMIN", "RECRUITER"]);
  const input = jobLifecycleSchema.parse(raw);
  return db.$transaction(async (tx) => {
    const job = await tx.job.findUnique({
      where: { id },
      include: {
        stages: { where: { archivedAt: null } },
        members: {
          where: { user: { isActive: true, role: "HIRING_MANAGER" } },
        },
      },
    });
    if (!job) throw new DomainError(404, "Job not found.");
    checkRevision(job.updatedAt, input.expectedUpdatedAt);
    if (input.action === "duplicate") {
      const copy = await tx.job.create({
        data: {
          title: `Copy of ${job.title}`.slice(0, 150),
          slug: slug(job.title),
          department: job.department,
          location: job.location,
          type: job.type,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          salaryCurrency: job.salaryCurrency,
          salaryPeriod: job.salaryPeriod,
          description: job.description,
          requirements: job.requirements,
          matchKeywords: job.matchKeywords ?? [],
          status: "DRAFT",
          createdById: user.id,
          stages: {
            create: job.stages.map(({ name, kind, position, color }) => ({
              name,
              kind,
              position,
              color,
            })),
          },
          members: { create: job.members.map(({ userId }) => ({ userId })) },
        },
      });
      await tx.activity.create({
        data: {
          actorId: user.id,
          jobId: copy.id,
          entityType: "JOB",
          entityId: copy.id,
          action: "JOB_DUPLICATED",
          description: `Duplicated ${job.title} as a draft`,
          metadata: { originalJobId: id },
        },
      });
      return { id: copy.id };
    }
    if (input.action === "close" && job.archivedAt)
      throw new DomainError(400, "Restore this job first.");
    const data =
      input.action === "close"
        ? { status: "CLOSED" as const, closedAt: job.closedAt || new Date() }
        : { archivedAt: input.action === "archive" ? new Date() : null };
    const updated = await tx.job.updateMany({
      where: { id, updatedAt: job.updatedAt },
      data: { ...data, updatedAt: nextRevision(job.updatedAt) },
    });
    if (!updated.count)
      throw new DomainError(
        409,
        "This job changed. Refresh before trying again.",
      );
    const action =
      input.action === "close"
        ? "CLOSED"
        : input.action === "archive"
          ? "ARCHIVED"
          : "RESTORED";
    await tx.activity.create({
      data: {
        actorId: user.id,
        jobId: id,
        entityType: "JOB",
        entityId: id,
        action: `JOB_${action}`,
        description: `${action[0]}${action.slice(1).toLowerCase()} job ${job.title}`,
      },
    });
    return { id };
  });
}
