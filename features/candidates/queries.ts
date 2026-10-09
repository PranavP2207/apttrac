import "server-only";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import {
  applicationScope,
  candidateScope,
  jobScope,
} from "@/lib/auth/permissions";

export async function listCandidates(term = "") {
  const user = await requireUser();
  const query = term.trim().slice(0, 100);
  return db.candidate.findMany({
    where: {
      ...candidateScope(user),
      archivedAt: null,
      ...(query
        ? {
            OR: [{ name: { contains: query } }, { email: { contains: query } }],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      source: true,
      rating: true,
      createdAt: true,
      tags: { select: { tag: { select: { name: true, color: true } } } },
      applications: {
        where: {
          ...applicationScope(user),
          job: { ...jobScope(user), archivedAt: null },
        },
        select: {
          job: { select: { title: true } },
          stage: { select: { name: true, kind: true } },
        },
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    take: 50,
  });
}
