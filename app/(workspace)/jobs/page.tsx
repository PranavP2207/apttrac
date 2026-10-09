import { BriefcaseBusiness, MapPin } from "lucide-react";
import { requirePageUser } from "@/lib/auth/session";
import { listJobs } from "@/features/jobs/queries";
import { PageHeader } from "@/components/shared/page-header";
import { ListSearch } from "@/components/shared/list-search";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, humanize } from "@/lib/utils";
export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; highlight?: string }>;
}) {
  await requirePageUser();
  const params = await searchParams;
  const jobs = await listJobs(params.q);
  return (
    <>
      <PageHeader
        title="Jobs"
        description="The opportunities your team is building around."
      >
        <ListSearch value={params.q} label="Search jobs" />
      </PageHeader>
      <div className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          {jobs.length} {jobs.length === 1 ? "role" : "roles"}
        </span>
        <span>·</span>
        <span>{jobs.filter((job) => job.status === "OPEN").length} open</span>
      </div>
      <Card className="overflow-hidden">
        {jobs.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Jobs in your workspace</caption>
              <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  {["Role", "Status", "Candidates", "Type"].map((heading) => (
                    <th
                      scope="col"
                      key={heading}
                      className="px-6 py-4 font-medium"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {jobs.map((job) => (
                  <tr
                    id={job.id}
                    key={job.id}
                    className={cn(
                      "transition-colors hover:bg-muted/40",
                      params.highlight === job.id && "bg-accent/60",
                    )}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-start gap-3">
                        <div className="hidden shrink-0 rounded-lg border bg-background p-2.5 text-primary sm:block">
                          <BriefcaseBusiness className="size-4" />
                        </div>
                        <div className="min-w-48">
                          <p className="font-semibold">{job.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {job.department}
                          </p>
                          <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="size-3" />
                            {job.location}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-5">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-6 py-5 font-medium tabular-nums">
                      {job._count.applications}
                    </td>
                    <td className="whitespace-nowrap px-6 py-5">
                      <Badge variant="outline">{humanize(job.type)}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title={params.q ? "No matching jobs" : "No roles assigned yet"}
            description={
              params.q
                ? "Try a different title, location or department."
                : "Your roles will appear here when your administrator assigns them."
            }
            icon={BriefcaseBusiness}
          />
        )}
      </Card>
    </>
  );
}
