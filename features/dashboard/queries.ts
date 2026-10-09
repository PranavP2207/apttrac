import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import {
  activityScope,
  applicationScope,
  candidateScope,
  jobScope,
} from "@/lib/auth/permissions";

export const getWorkspaceSnapshot = cache(async () => {
  const user = await requireUser();
  const currentTime = new Date();
  const jobsWhere = { ...jobScope(user), archivedAt: null };
  const [
    company,
    jobs,
    candidateCount,
    openJobCount,
    scheduledInterviewCount,
    offerCount,
    interviews,
    activities,
    notifications,
  ] = await Promise.all([
    db.company.findUniqueOrThrow({ where: { id: "singleton" } }),
    db.job.findMany({
      where: jobsWhere,
      select: {
        id: true,
        title: true,
        department: true,
        location: true,
        status: true,
        type: true,
        createdAt: true,
        _count: { select: { applications: true } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 8,
    }),
    db.candidate.count({
      where: { ...candidateScope(user), archivedAt: null },
    }),
    db.job.count({ where: { ...jobsWhere, status: "OPEN" } }),
    db.interview.count({
      where: {
        status: "SCHEDULED",
        startsAt: { gte: currentTime },
        application: {
          ...applicationScope(user),
          candidate: { archivedAt: null },
          job: jobsWhere,
        },
      },
    }),
    db.application.count({
      where: {
        ...applicationScope(user),
        stage: { kind: "OFFER" },
        candidate: { archivedAt: null },
        job: jobsWhere,
      },
    }),
    db.interview.findMany({
      where: {
        status: "SCHEDULED",
        startsAt: { gte: currentTime },
        application: {
          ...applicationScope(user),
          candidate: { archivedAt: null },
          job: jobsWhere,
        },
      },
      select: {
        id: true,
        title: true,
        startsAt: true,
        endsAt: true,
        mode: true,
        status: true,
        interviewer: { select: { name: true } },
        application: {
          select: {
            candidate: { select: { name: true } },
            job: { select: { title: true } },
          },
        },
      },
      orderBy: [{ startsAt: "asc" }, { id: "asc" }],
      take: 4,
    }),
    db.activity.findMany({
      where: activityScope(user),
      select: {
        id: true,
        description: true,
        action: true,
        createdAt: true,
        actor: { select: { name: true } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 6,
    }),
    db.notification.findMany({
      where: {
        userId: user.id,
        deliverAt: { lte: currentTime },
        OR: [{ interviewId: null }, { interview: { status: "SCHEDULED" } }],
      },
      select: {
        id: true,
        title: true,
        message: true,
        href: true,
        readAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);
  return {
    user,
    company,
    jobs,
    counts: {
      candidates: candidateCount,
      openJobs: openJobCount,
      scheduledInterviews: scheduledInterviewCount,
      offers: offerCount,
    },
    interviews,
    activities,
    notifications,
  };
});
