import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser, type CurrentUser } from "@/lib/auth/session";
import {
  candidateScope,
  applicationScope,
  jobScope,
  activityScope,
} from "@/lib/auth/permissions";
import { param, pageNumber, type ListParams } from "@/lib/list-params";
import { candidateSources } from "./validation";

export const stageKinds = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "ASSESSMENT",
  "OFFER",
  "HIRED",
  "REJECTED",
  "CUSTOM",
] as const;
function dateBound(value: string, end = false) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value)
    return undefined;
  if (end) date.setUTCDate(date.getUTCDate() + 1);
  return date;
}
export function candidateWhere(
  params: ListParams,
  user: CurrentUser,
): Prisma.CandidateWhereInput {
  const q = param(params, "q"),
    jobId = param(params, "jobId"),
    stage = param(params, "stage"),
    source = param(params, "source");
  const validStage = stageKinds.includes(stage as (typeof stageKinds)[number]);
  const start = dateBound(param(params, "dateFrom")),
    end = dateBound(param(params, "dateTo"), true);
  return {
    ...candidateScope(user),
    archivedAt: param(params, "archived") === "archived" ? { not: null } : null,
    ...(param(params, "highlight") ? { id: param(params, "highlight") } : {}),
    ...(q
      ? { OR: [{ name: { contains: q } }, { email: { contains: q } }] }
      : {}),
    // Job and stage must belong to the same application, with manager scope applied inside it.
    ...(jobId || validStage
      ? {
          applications: {
            some: {
              ...applicationScope(user),
              ...(jobId ? { jobId } : {}),
              ...(validStage
                ? { stage: { kind: stage as (typeof stageKinds)[number] } }
                : {}),
            },
          },
        }
      : {}),
    ...(candidateSources.includes(source as (typeof candidateSources)[number])
      ? { source: source as (typeof candidateSources)[number] }
      : {}),
    ...(param(params, "tagId")
      ? { tags: { some: { tagId: param(params, "tagId") } } }
      : {}),
    ...(/^[1-5]$/.test(param(params, "rating"))
      ? { rating: Number(param(params, "rating")) }
      : {}),
    ...(start || end
      ? {
          createdAt: {
            ...(start ? { gte: start } : {}),
            ...(end ? { lt: end } : {}),
          },
        }
      : {}),
  };
}
export function candidateSelect(user: CurrentUser) {
  return {
    id: true,
    name: true,
    email: true,
    source: true,
    rating: true,
    createdAt: true,
    tags: { select: { tag: { select: { name: true, color: true } } } },
    applications: {
      where: applicationScope(user),
      select: {
        id: true,
        job: { select: { id: true, title: true, archivedAt: true } },
        stage: { select: { name: true, kind: true } },
      },
      orderBy: { appliedAt: "desc" as const },
    },
  } satisfies Prisma.CandidateSelect;
}
export type CandidateRow = Prisma.CandidateGetPayload<{
  select: ReturnType<typeof candidateSelect>;
}>;
export async function listCandidates(params: ListParams = {}) {
  const user = await requireUser(),
    where = candidateWhere(params, user);
  return db.$transaction(async (tx) => {
    const total = await tx.candidate.count({ where });
    const pages = Math.max(1, Math.ceil(total / 10)),
      page = Math.min(pageNumber(params), pages);
    const sort = param(params, "sort");
    const orderBy: Prisma.CandidateOrderByWithRelationInput[] =
      sort === "name-asc"
        ? [{ name: "asc" }, { id: "asc" }]
        : sort === "rating-desc"
          ? [{ rating: "desc" }, { id: "asc" }]
          : [{ createdAt: "desc" }, { id: "asc" }];
    const items = await tx.candidate.findMany({
      where,
      select: candidateSelect(user),
      orderBy,
      skip: (page - 1) * 10,
      take: 10,
    });
    return { items, total, pages, page };
  });
}
export async function candidateOptions() {
  const user = await requireUser();
  const [jobs, tags] = await Promise.all([
    db.job.findMany({
      where: jobScope(user),
      select: { id: true, title: true, status: true, archivedAt: true },
      orderBy: { title: "asc" },
    }),
    db.tag.findMany({
      select: { id: true, name: true, color: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return { jobs, tags };
}
export async function getCandidate(id: string) {
  const user = await requireUser();
  // Candidate visibility does not authorize every application, note, email or scorecard on that person.
  const context =
    user.role === "HIRING_MANAGER"
      ? { application: applicationScope(user) }
      : {};
  return db.candidate.findFirst({
    where: { id, ...candidateScope(user) },
    include: {
      tags: { include: { tag: true } },
      resume: { select: { originalName: true, parseStatus: true } },
      applications: {
        where: applicationScope(user),
        orderBy: { appliedAt: "desc" },
        include: {
          job: { select: { id: true, title: true, archivedAt: true } },
          stage: true,
          stageHistory: {
            orderBy: { changedAt: "desc" },
            include: { actor: { select: { name: true } } },
          },
          interviews: {
            orderBy: { startsAt: "desc" },
            include: {
              interviewer: { select: { name: true } },
              scorecards: { include: { author: { select: { name: true } } } },
            },
          },
        },
      },
      activities: {
        where: activityScope(user),
        orderBy: { createdAt: "desc" },
        include: { actor: { select: { name: true } } },
      },
      notes: {
        where: context,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          body: true,
          createdAt: true,
          author: { select: { name: true } },
          application: { select: { job: { select: { title: true } } } },
        },
      },
      emailLogs: {
        where: context,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          subject: true,
          body: true,
          status: true,
          createdAt: true,
          sentBy: { select: { name: true } },
          application: { select: { job: { select: { title: true } } } },
        },
      },
    },
  });
}
