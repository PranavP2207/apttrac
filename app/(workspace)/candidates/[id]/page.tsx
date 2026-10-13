import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  ExternalLink,
  Star,
  FileText,
} from "lucide-react";
import { requirePageUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getCandidate, candidateOptions } from "@/features/candidates/queries";
import { CandidateTimeline } from "@/features/candidates/components/candidate-timeline";
import { ApplicationDialog } from "@/features/candidates/components/application-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { RecordActions } from "@/components/shared/record-actions";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { humanize, initials } from "@/lib/utils";
import { formatDate } from "@/lib/dates";
export default async function CandidatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePageUser(),
    { id } = await params;
  const [candidate, options, company] = await Promise.all([
    getCandidate(id),
    candidateOptions(),
    db.company.findUnique({
      where: { id: "singleton" },
      select: { timezone: true },
    }),
  ]);
  if (!candidate) notFound();
  const timezone = company?.timezone || "UTC",
    editable = user.role !== "HIRING_MANAGER";
  const jobs = options.jobs.filter(
    (j) =>
      j.status === "OPEN" &&
      !j.archivedAt &&
      !candidate.applications.some((a) => a.jobId === j.id),
  );
  const scorecards = candidate.applications.flatMap((a) =>
    a.interviews.flatMap((i) => i.scorecards),
  );
  const average = scorecards.length
    ? (
        scorecards.reduce(
          (sum, s) =>
            sum +
            s.technicalRating +
            s.communicationRating +
            s.cultureFitRating,
          0,
        ) /
        (scorecards.length * 3)
      ).toFixed(1)
    : null;
  return (
    <>
      <Link
        href="/candidates"
        className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        All candidates
      </Link>
      <PageHeader
        title={candidate.name}
        description="Every conversation, connected."
      >
        {editable && (
          <RecordActions
            kind="candidate"
            id={id}
            revision={candidate.updatedAt.toISOString()}
            archived={!!candidate.archivedAt}
          />
        )}
      </PageHeader>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-5 flex items-center gap-4">
                <Avatar className="size-14">
                  <AvatarFallback>{initials(candidate.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">
                    {humanize(candidate.source)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Added {formatDate(candidate.createdAt, timezone)}
                  </p>
                </div>
              </div>
              {candidate.archivedAt && (
                <Badge variant="secondary" className="mb-4">
                  Archived candidate
                </Badge>
              )}
              <div className="space-y-3 text-sm">
                <a
                  href={`mailto:${candidate.email}`}
                  className="flex items-start gap-2 hover:text-primary"
                >
                  <Mail className="mt-0.5 size-4 shrink-0" />
                  <span className="break-all">{candidate.email}</span>
                </a>
                {candidate.phone && (
                  <p className="flex gap-2">
                    <Phone className="size-4 shrink-0" />
                    {candidate.phone}
                  </p>
                )}
                {candidate.linkedinUrl && (
                  <a
                    href={candidate.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="size-4" />
                    LinkedIn profile
                  </a>
                )}
              </div>
              {candidate.sourceDetails && (
                <p className="mt-4 break-words text-xs text-muted-foreground">
                  {candidate.sourceDetails}
                </p>
              )}
              <div className="mt-6 border-t pt-5">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Recruiter rating
                </p>
                {candidate.rating ? (
                  <span
                    className="flex items-center gap-2 text-sm font-semibold"
                    aria-label={`${candidate.rating} out of 5 stars`}
                  >
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    {candidate.rating} / 5
                  </span>
                ) : (
                  <p className="text-sm text-muted-foreground">Unrated</p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {candidate.tags.map(({ tag }) => (
                    <Badge key={tag.id} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>At a glance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">
                {candidate.summary ||
                  "Add a summary to help the team get to know this person."}
              </p>
              <div className="mt-5 border-t pt-4">
                <p className="text-sm font-medium">Interview feedback</p>
                <p className="mt-2 text-2xl font-semibold">
                  {average ? `${average} / 5` : "Awaiting feedback"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {average
                    ? `Average across ${scorecards.length} visible scorecard${scorecards.length === 1 ? "" : "s"}, with equal weight for all three criteria.`
                    : "Submitted scorecards will appear here."}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Resume</CardTitle>
            </CardHeader>
            <CardContent>
              <FileText className="mb-3 size-5 text-muted-foreground" />
              <p className="break-words text-sm text-muted-foreground">
                {candidate.resume
                  ? candidate.resume.originalName
                  : "No resume attached."}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Resume uploads and matching arrive in the next phase.
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
              <CardTitle>Applications</CardTitle>
              {editable && !candidate.archivedAt && (
                <ApplicationDialog candidateId={id} jobs={jobs} />
              )}
            </CardHeader>
            <CardContent>
              {candidate.applications.length ? (
                <ul className="divide-y">
                  {candidate.applications.map((a) => (
                    <li
                      key={a.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0"
                    >
                      <div>
                        <Link
                          href={`/jobs/${a.jobId}`}
                          className="text-sm font-semibold hover:text-primary"
                        >
                          {a.job.title}
                        </Link>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Applied {formatDate(a.appliedAt, timezone)}
                          {a.job.archivedAt ? " · Archived job" : ""}
                        </p>
                      </div>
                      <Badge variant="secondary">{a.stage.name}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-3 text-sm text-muted-foreground">
                  No applications yet. Add this candidate to an open job when
                  the right opportunity comes along.
                </p>
              )}
            </CardContent>
          </Card>
          <CandidateTimeline candidate={candidate} timezone={timezone} />
        </div>
      </div>
    </>
  );
}
