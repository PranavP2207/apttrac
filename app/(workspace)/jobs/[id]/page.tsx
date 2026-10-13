import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus, MapPin, UsersRound } from "lucide-react";
import { requirePageUser } from "@/lib/auth/session";
import { getJob } from "@/features/jobs/queries";
import { PageHeader } from "@/components/shared/page-header";
import { RecordActions } from "@/components/shared/record-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { humanize } from "@/lib/utils";
export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePageUser(),
    { id } = await params,
    job = await getJob(id);
  if (!job) notFound();
  const editable = user.role !== "HIRING_MANAGER";
  const amount = (n: number) =>
    `${job.salaryCurrency} ${n.toLocaleString("en-US")}`;
  return (
    <>
      <Link
        href="/jobs"
        className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        All jobs
      </Link>
      <PageHeader
        title={job.title}
        description={`${job.department} · ${humanize(job.type)}`}
      >
        {editable && (
          <RecordActions
            kind="job"
            id={id}
            revision={job.updatedAt.toISOString()}
            archived={!!job.archivedAt}
            closed={job.status === "CLOSED"}
          />
        )}
      </PageHeader>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge status={job.status} />
        {job.archivedAt && <Badge variant="secondary">Archived</Badge>}
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-4" />
          {job.location}
        </span>
        {(job.salaryMin !== null || job.salaryMax !== null) && (
          <span className="text-sm text-muted-foreground">
            {job.salaryMin !== null ? amount(job.salaryMin) : "Up to"}
            {job.salaryMin !== null && job.salaryMax !== null ? " – " : " "}
            {job.salaryMax !== null ? amount(job.salaryMax) : "+"} /{" "}
            {job.salaryPeriod.toLowerCase()}
          </span>
        )}
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About the role</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap break-words text-sm leading-7">
                {job.description}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>What we’re looking for</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap break-words text-sm leading-7">
                {job.requirements}
              </p>
              {Array.isArray(job.matchKeywords) &&
                job.matchKeywords.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {job.matchKeywords
                      .filter((k) => typeof k === "string")
                      .map((k) => (
                        <Badge variant="outline" key={String(k)}>
                          {String(k)}
                        </Badge>
                      ))}
                  </div>
                )}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hiring team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {job.members.map((m) => (
                <p key={m.userId} className="text-sm">
                  {m.user.name}
                  {!m.user.isActive ? " · Inactive" : ""}
                </p>
              ))}
              {!job.members.length && (
                <p className="text-sm text-muted-foreground">
                  No hiring managers assigned.
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pipeline stages</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {job.stages.map((s, i) => (
                  <li className="flex items-center gap-3 text-sm" key={s.id}>
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs text-primary">
                      {i + 1}
                    </span>
                    {s.name}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
      <Card className="mt-6">
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle>
            Applicants{" "}
            <span className="ml-1 text-muted-foreground">
              {job.applications.length}
            </span>
          </CardTitle>
          {editable && job.status === "OPEN" && !job.archivedAt && (
            <Button size="sm" asChild>
              <Link href={`/candidates/new?jobId=${id}`}>
                <Plus />
                Add candidate
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {job.applications.length ? (
            <ul className="divide-y">
              {job.applications.map((a) => (
                <li
                  className="flex flex-wrap items-center justify-between gap-3 py-4"
                  key={a.id}
                >
                  <div>
                    <Link
                      href={`/candidates/${a.candidate.id}`}
                      className="text-sm font-semibold hover:text-primary"
                    >
                      {a.candidate.name}
                    </Link>
                    <p className="mt-1 break-all text-xs text-muted-foreground">
                      {a.candidate.email}
                    </p>
                  </div>
                  <Badge variant="secondary">{a.stage.name}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Your next hire starts here"
              description="Add a candidate to this open role to start an application."
              icon={UsersRound}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
