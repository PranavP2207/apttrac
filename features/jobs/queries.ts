import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { jobScope, assertRole } from "@/lib/auth/permissions";
import { param, pageNumber, type ListParams } from "@/lib/list-params";
import { jobStatuses, jobTypes } from "./validation";

export async function listJobs(params: ListParams = {}) {
  const user = await requireUser();
  const q = param(params, "q"),
    status = param(params, "status"),
    type = param(params, "type");
  const where: Prisma.JobWhereInput = {
    ...jobScope(user),
    archivedAt: param(params, "archived") === "archived" ? { not: null } : null,
    ...(param(params, "highlight") ? { id: param(params, "highlight") } : {}),
    ...(jobStatuses.includes(status as (typeof jobStatuses)[number])
      ? { status: status as (typeof jobStatuses)[number] }
      : {}),
    ...(jobTypes.includes(type as (typeof jobTypes)[number])
      ? { type: type as (typeof jobTypes)[number] }
      : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { department: { contains: q } },
            { location: { contains: q } },
          ],
        }
      : {}),
  };
  return db.$transaction(async (tx) => {
    const total = await tx.job.count({ where });
    const pages = Math.max(1, Math.ceil(total / 10)),
      page = Math.min(pageNumber(params), pages);
    const items = await tx.job.findMany({
      where,
      select: {
        id: true,
        title: true,
        department: true,
        location: true,
        type: true,
        status: true,
        archivedAt: true,
        createdAt: true,
        _count: {
          select: {
            applications: { where: { candidate: { archivedAt: null } } },
          },
        },
      },
      orderBy:
        param(params, "sort") === "title-asc"
          ? [{ title: "asc" }, { id: "asc" }]
          : [{ createdAt: "desc" }, { id: "asc" }],
      skip: (page - 1) * 10,
      take: 10,
    });
    return { items, total, pages, page };
  });
}
export async function getJob(id: string) {
  const user = await requireUser();
  return db.job.findFirst({
    where: { id, ...jobScope(user) },
    include: {
      members: {
        select: {
          userId: true,
          user: { select: { name: true, isActive: true } },
        },
      },
      stages: { where: { archivedAt: null }, orderBy: { position: "asc" } },
      applications: {
        where: { candidate: { archivedAt: null } },
        orderBy: { appliedAt: "desc" },
        select: {
          id: true,
          candidate: { select: { id: true, name: true, email: true } },
          stage: { select: { name: true } },
        },
      },
    },
  });
}
export async function jobFormOptions() {
  const user = await requireUser();
  assertRole(user, ["ADMIN", "RECRUITER"]);
  const [managers, company] = await Promise.all([
    db.user.findMany({
      where: { role: "HIRING_MANAGER", isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.company.findUnique({
      where: { id: "singleton" },
      select: { currency: true },
    }),
  ]);
  return { managers, currency: company?.currency || "USD" };
}
