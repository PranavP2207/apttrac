import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { assertRole } from "@/lib/auth/permissions";
import type { CurrentUser } from "@/lib/auth/session";
import { DomainError } from "@/lib/errors";
import { checkRevision, nextRevision } from "@/lib/mutations";
import {
  candidateCreateSchema,
  candidateEditSchema,
  candidateLifecycleSchema,
  applicationSchema,
  bulkTagSchema,
  type CandidateInput,
} from "./validation";

function fields(input: Omit<CandidateInput, "jobId">) {
  return {
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    linkedinUrl: input.linkedinUrl || null,
    source: input.source,
    sourceDetails: input.sourceDetails || null,
    summary: input.summary || null,
    rating: input.rating ? Number(input.rating) : null,
  };
}
async function checkTags(tx: Prisma.TransactionClient, ids: string[]) {
  if (
    new Set(ids).size !== ids.length ||
    (await tx.tag.count({ where: { id: { in: ids } } })) !== ids.length
  )
    throw new DomainError(400, "Choose tags from the list.");
}
async function createApplication(
  tx: Prisma.TransactionClient,
  candidateId: string,
  jobId: string,
  user: CurrentUser,
) {
  const candidate = await tx.candidate.findUnique({
    where: { id: candidateId },
  });
  if (!candidate) throw new DomainError(404, "Candidate not found.");
  if (candidate.archivedAt)
    throw new DomainError(
      400,
      "Restore the candidate before adding an application.",
    );
  const job = await tx.job.findUnique({
    where: { id: jobId },
    include: {
      stages: {
        where: { kind: "APPLIED", archivedAt: null },
        orderBy: { position: "asc" },
      },
    },
  });
  if (!job || job.archivedAt || job.status !== "OPEN")
    throw new DomainError(400, "Choose an open, active job.");
  const stage = job.stages[0];
  if (!stage) throw new DomainError(400, "This job needs an Applied stage.");
  if (
    await tx.application.findUnique({
      where: { candidateId_jobId: { candidateId, jobId } },
    })
  )
    throw new DomainError(
      409,
      "This candidate already has an application for that job.",
    );
  const now = new Date();
  const last = await tx.application.aggregate({
    where: { jobId, stageId: stage.id },
    _max: { position: true },
  });
  const application = await tx.application.create({
    data: {
      candidateId,
      jobId,
      stageId: stage.id,
      source: candidate.source,
      sourceDetails: candidate.sourceDetails,
      position: (last._max.position ?? -1) + 1,
      appliedAt: now,
      stageEnteredAt: now,
      createdById: user.id,
      stageHistory: {
        create: {
          applicationVersion: 0,
          toStageId: stage.id,
          toStageName: stage.name,
          toStageKind: stage.kind,
          actorId: user.id,
          changedAt: now,
        },
      },
    },
  });
  await tx.activity.create({
    data: {
      actorId: user.id,
      candidateId,
      jobId,
      applicationId: application.id,
      entityType: "APPLICATION",
      entityId: application.id,
      action: "APPLICATION_CREATED",
      description: `Applied to ${job.title}`,
    },
  });
  return { id: application.id };
}
export async function createCandidate(raw: unknown, user: CurrentUser) {
  assertRole(user, ["ADMIN", "RECRUITER"]);
  const input = candidateCreateSchema.parse(raw);
  return db.$transaction(async (tx) => {
    await checkTags(tx, input.tagIds);
    if (await tx.candidate.findUnique({ where: { email: input.email } }))
      throw new DomainError(
        409,
        "A candidate with this email already exists. Find their profile to add an application.",
      );
    const candidate = await tx.candidate.create({
      data: {
        ...fields(input),
        createdById: user.id,
        tags: { create: input.tagIds.map((tagId) => ({ tagId })) },
      },
    });
    await tx.activity.create({
      data: {
        actorId: user.id,
        candidateId: candidate.id,
        entityType: "CANDIDATE",
        entityId: candidate.id,
        action: "CANDIDATE_CREATED",
        description: "Candidate added manually",
      },
    });
    if (input.jobId)
      await createApplication(tx, candidate.id, input.jobId, user);
    return { id: candidate.id };
  });
}
export async function editCandidate(
  id: string,
  raw: unknown,
  user: CurrentUser,
) {
  assertRole(user, ["ADMIN", "RECRUITER"]);
  const input = candidateEditSchema.parse(raw);
  return db.$transaction(async (tx) => {
    const candidate = await tx.candidate.findUnique({ where: { id } });
    if (!candidate) throw new DomainError(404, "Candidate not found.");
    if (candidate.archivedAt)
      throw new DomainError(400, "Restore this candidate before editing.");
    checkRevision(candidate.updatedAt, input.expectedUpdatedAt);
    await checkTags(tx, input.tagIds);
    const updated = await tx.candidate.updateMany({
      where: { id, updatedAt: candidate.updatedAt },
      data: { ...fields(input), updatedAt: nextRevision(candidate.updatedAt) },
    });
    if (!updated.count)
      throw new DomainError(
        409,
        "This candidate changed. Refresh before saving.",
      );
    await tx.candidateTag.deleteMany({ where: { candidateId: id } });
    for (const tagId of input.tagIds)
      await tx.candidateTag.create({ data: { candidateId: id, tagId } });
    await tx.activity.create({
      data: {
        actorId: user.id,
        candidateId: id,
        entityType: "CANDIDATE",
        entityId: id,
        action: "CANDIDATE_UPDATED",
        description: "Candidate details updated",
      },
    });
    return { id };
  });
}
export async function addApplication(
  id: string,
  raw: unknown,
  user: CurrentUser,
) {
  assertRole(user, ["ADMIN", "RECRUITER"]);
  const input = applicationSchema.parse(raw);
  return db.$transaction((tx) => createApplication(tx, id, input.jobId, user));
}
export async function candidateLifecycle(
  id: string,
  raw: unknown,
  user: CurrentUser,
) {
  assertRole(user, ["ADMIN", "RECRUITER"]);
  const input = candidateLifecycleSchema.parse(raw);
  return db.$transaction(async (tx) => {
    const candidate = await tx.candidate.findUnique({ where: { id } });
    if (!candidate) throw new DomainError(404, "Candidate not found.");
    checkRevision(candidate.updatedAt, input.expectedUpdatedAt);
    const updated = await tx.candidate.updateMany({
      where: { id, updatedAt: candidate.updatedAt },
      data: {
        archivedAt: input.action === "archive" ? new Date() : null,
        updatedAt: nextRevision(candidate.updatedAt),
      },
    });
    if (!updated.count)
      throw new DomainError(
        409,
        "This candidate changed. Refresh before trying again.",
      );
    await tx.activity.create({
      data: {
        actorId: user.id,
        candidateId: id,
        entityType: "CANDIDATE",
        entityId: id,
        action:
          input.action === "archive"
            ? "CANDIDATE_ARCHIVED"
            : "CANDIDATE_RESTORED",
        description:
          input.action === "archive"
            ? "Candidate archived"
            : "Candidate restored",
      },
    });
    return { id };
  });
}
export async function bulkTag(raw: unknown, user: CurrentUser) {
  assertRole(user, ["ADMIN", "RECRUITER"]);
  const input = bulkTagSchema.parse(raw);
  const ids = [...new Set(input.ids)];
  return db.$transaction(async (tx) => {
    if (
      (await tx.candidate.count({
        where: { id: { in: ids }, archivedAt: null },
      })) !== ids.length
    )
      throw new DomainError(
        404,
        "One or more candidates are unavailable. Refresh the list.",
      );
    await checkTags(tx, [input.tagId]);
    const tag = await tx.tag.findUniqueOrThrow({ where: { id: input.tagId } });
    for (const id of ids) {
      // Bulk tag writes share the profile revision so older edit forms cannot remove them silently.
      const candidate = await tx.candidate.findUniqueOrThrow({ where: { id } });
      await tx.candidateTag.upsert({
        where: { candidateId_tagId: { candidateId: id, tagId: input.tagId } },
        update: {},
        create: { candidateId: id, tagId: input.tagId },
      });
      await tx.candidate.update({
        where: { id },
        data: { updatedAt: nextRevision(candidate.updatedAt) },
      });
      await tx.activity.create({
        data: {
          actorId: user.id,
          candidateId: id,
          entityType: "CANDIDATE",
          entityId: id,
          action: "CANDIDATE_TAGGED",
          description: `Added tag ${tag.name}`,
        },
      });
    }
    return { count: ids.length };
  });
}
