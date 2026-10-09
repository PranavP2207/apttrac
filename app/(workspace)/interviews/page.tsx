import { CalendarDays, MapPin, Video } from "lucide-react";
import { db } from "@/lib/db";
import { requirePageUser } from "@/lib/auth/session";
import { applicationScope } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/dates";
export default async function InterviewsPage() {
  const user = await requirePageUser();
  const company = await db.company.findUniqueOrThrow({
    where: { id: "singleton" },
  });
  const rows = await db.interview.findMany({
    where: { application: applicationScope(user) },
    include: {
      interviewer: { select: { name: true } },
      application: {
        select: {
          candidate: { select: { name: true } },
          job: { select: { title: true } },
        },
      },
    },
    orderBy: { startsAt: "asc" },
    take: 50,
  });
  const interviews = [
    ...rows.filter((row) => row.status === "SCHEDULED"),
    ...rows.filter((row) => row.status !== "SCHEDULED").reverse(),
  ];
  return (
    <>
      <PageHeader
        title="Interviews"
        description="A little preparation. A better conversation."
      />
      <div className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarDays className="size-4" />
        <span>
          {rows.filter((row) => row.status === "SCHEDULED").length} scheduled ·
          Times shown in {company.timezone}
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {interviews.map((interview) => (
          <Card key={interview.id} className="p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-primary">
                {formatDate(
                  interview.startsAt,
                  company.timezone,
                  "EEE, MMM d · h:mm a",
                )}
              </p>
              <StatusBadge status={interview.status} />
            </div>
            <h2 className="text-base font-semibold">
              {interview.application.candidate.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {interview.application.job.title}
            </p>
            <div className="mt-5 space-y-2 border-t pt-4 text-xs text-muted-foreground">
              <p>
                {interview.title} · With {interview.interviewer.name}
              </p>
              <p className="flex items-center gap-1.5">
                {interview.mode === "ONLINE" ? (
                  <Video className="size-3.5" />
                ) : (
                  <MapPin className="size-3.5" />
                )}
                {interview.mode === "ONLINE"
                  ? "Online interview"
                  : interview.location}
              </p>
            </div>
          </Card>
        ))}
      </div>
      {!interviews.length && (
        <Card>
          <EmptyState
            title="No interviews scheduled"
            description="Your team’s interviews will appear here."
            icon={CalendarDays}
          />
        </Card>
      )}
    </>
  );
}
