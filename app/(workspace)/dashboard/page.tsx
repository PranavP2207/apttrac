import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Gift,
  UsersRound,
} from "lucide-react";
import { getWorkspaceSnapshot } from "@/features/dashboard/queries";
import { requirePageUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate } from "@/lib/dates";
import { initials } from "@/lib/utils";

export default async function DashboardPage() {
  await requirePageUser();
  const snapshot = await getWorkspaceSnapshot();
  const { user, company, counts, jobs, interviews, activities } = snapshot;
  const hour = Number(
    new Intl.DateTimeFormat("en", {
      hour: "numeric",
      hour12: false,
      timeZone: company.timezone,
    }).format(new Date()),
  );
  const greeting = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const metrics = [
    {
      label: "Open jobs",
      value: counts.openJobs,
      icon: BriefcaseBusiness,
      hint: "Ready for your next great hire",
      href: "/jobs",
    },
    {
      label: "Total candidates",
      value: counts.candidates,
      icon: UsersRound,
      hint: "People in your talent network",
      href: "/candidates",
    },
    {
      label: "Scheduled interviews",
      value: counts.scheduledInterviews,
      icon: CalendarDays,
      hint: "Upcoming conversations",
      href: "/interviews",
    },
    {
      label: "Offers pending",
      value: counts.offers,
      icon: Gift,
      hint: "One step closer to welcome",
      href: "/candidates",
    },
  ];
  return (
    <>
      <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
        <CalendarDays className="size-3.5" />
        {formatDate(new Date(), company.timezone, "EEEE, MMMM d")}
      </div>
      <PageHeader
        title={`Good ${greeting}, ${user.name.split(" ")[0]}`}
        description={
          user.role === "HIRING_MANAGER"
            ? "A clear view of the roles and candidates assigned to you."
            : "Here’s what’s happening with your hiring."
        }
      >
        <Button asChild variant="outline">
          <Link href="/candidates">
            <UsersRound />
            View candidates
          </Link>
        </Button>
        <Button asChild>
          <Link href="/jobs">
            <BriefcaseBusiness />
            View jobs
            <ArrowRight />
          </Link>
        </Button>
      </PageHeader>
      <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Link
            key={metric.label}
            href={metric.href}
            className="group rounded-lg"
          >
            <Card className="h-full p-5 transition-shadow hover:shadow-md">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {metric.label}
                </span>
                <div className="rounded-lg bg-accent p-2 text-primary">
                  <metric.icon className="size-4" />
                </div>
              </div>
              <p className="text-3xl font-semibold tracking-tight tabular-nums">
                {metric.value}
              </p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  {metric.hint}
                </span>
                <ChevronRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Your roles</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Keep your hiring moving.
                </p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/jobs">
                  View all
                  <ArrowRight />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="px-0 pb-2">
              {jobs.length ? (
                jobs.slice(0, 5).map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs?highlight=${job.id}`}
                    className="flex items-center gap-4 border-t px-6 py-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="hidden size-10 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground sm:flex">
                      <BriefcaseBusiness className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {job.title}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {job.department} · {job.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={job.status} />
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {job._count.applications} candidates
                      </p>
                    </div>
                    <ChevronRight className="hidden size-4 shrink-0 text-muted-foreground sm:block" />
                  </Link>
                ))
              ) : (
                <EmptyState
                  title="A fresh start"
                  description="Your assigned roles will appear here. Ask your administrator to assign your first role."
                  icon={BriefcaseBusiness}
                />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Recent activity</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/activity">
                  View all
                  <ArrowRight />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-5">
              {activities.length ? (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                      <Check className="size-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm leading-6">
                        {activity.description}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDate(
                          activity.createdAt,
                          company.timezone,
                          "MMM d · h:mm a",
                        )}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No activity yet"
                  description="Your team’s hiring updates will appear here."
                />
              )}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Coming up next</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Make time for a good conversation.
              </p>
            </div>
            <div className="rounded-lg bg-accent p-2 text-primary">
              <CalendarDays className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {interviews.length ? (
              interviews.map((interview) => (
                <div key={interview.id} className="rounded-xl border p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-primary">
                      {formatDate(
                        interview.startsAt,
                        company.timezone,
                        "EEE, MMM d",
                      )}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock3 className="size-3" />
                      {formatDate(
                        interview.startsAt,
                        company.timezone,
                        "h:mm a",
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback className="text-xs">
                        {initials(interview.application.candidate.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {interview.application.candidate.name}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {interview.application.job.title}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                    <span>{interview.title}</span>
                    <span>·</span>
                    <span>
                      {interview.mode === "ONLINE" ? "Online" : "Onsite"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="Room in your calendar"
                description="Scheduled interviews will appear here."
                icon={CalendarDays}
              />
            )}
            <Button asChild variant="outline" className="w-full">
              <Link href="/interviews">
                View interviews
                <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
