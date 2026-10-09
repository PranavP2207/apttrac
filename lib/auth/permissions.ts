import "server-only";
import type { Prisma, Role } from "@prisma/client";
import { AccessError, type CurrentUser } from "./session";

export function assertRole(user: CurrentUser, roles: Role[]) {
  if (!roles.includes(user.role))
    throw new AccessError(403, "You do not have permission to do that");
}
export function jobScope(user: CurrentUser): Prisma.JobWhereInput {
  return user.role === "HIRING_MANAGER"
    ? { members: { some: { userId: user.id } } }
    : {};
}
export function applicationScope(
  user: CurrentUser,
): Prisma.ApplicationWhereInput {
  return { job: jobScope(user) };
}
export function candidateScope(user: CurrentUser): Prisma.CandidateWhereInput {
  return user.role === "HIRING_MANAGER"
    ? { applications: { some: applicationScope(user) } }
    : {};
}
export function activityScope(user: CurrentUser): Prisma.ActivityWhereInput {
  if (user.role === "ADMIN") return {};
  if (user.role === "RECRUITER")
    return { entityType: { notIn: ["USER", "COMPANY"] } };
  return {
    OR: [{ job: jobScope(user) }, { application: applicationScope(user) }],
  };
}
