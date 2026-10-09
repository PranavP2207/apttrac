import "server-only";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { jobScope } from "@/lib/auth/permissions";

export async function listJobs(term = "") {
  const user = await requireUser();
  const query = term.trim().slice(0, 100);
  return db.job.findMany({
    where: {
      ...jobScope(user),
      archivedAt: null,
      ...(query
        ? {
            OR: [
              { title: { contains: query } },
              { department: { contains: query } },
              { location: { contains: query } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      title: true,
      department: true,
      location: true,
      type: true,
      status: true,
      createdAt: true,
      _count: {
        select: {
          applications: { where: { candidate: { archivedAt: null } } },
        },
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    take: 50,
  });
}
