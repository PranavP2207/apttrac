import Link from "next/link";
import { BriefcaseBusiness, MapPin, Plus } from "lucide-react";
import { requirePageUser } from "@/lib/auth/session";
import { listJobs } from "@/features/jobs/queries";
import { JobFilters } from "@/features/jobs/components/job-filters";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { ListSort } from "@/components/shared/list-sort";
import { Pagination } from "@/components/shared/pagination";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, humanize } from "@/lib/utils";
import { param, type ListParams } from "@/lib/list-params";
export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<ListParams>;
}) {
  const user = await requirePageUser(),
    params = await searchParams,
    result = await listJobs(params);
  const editable = user.role !== "HIRING_MANAGER";
  return (
    <>
      <PageHeader
        title="Jobs"
        description="Find the right people for your next chapter."
      >
        {editable && (
          <Button asChild>
            <Link href="/jobs/new">
              <Plus />
              Create job
            </Link>
          </Button>
        )}
      </PageHeader>
      <JobFilters key={JSON.stringify(params)} params={params} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {result.total} {result.total === 1 ? "role" : "roles"} match your view
        </p>
        <ListSort
          label="Sort jobs"
          value={param(params, "sort") || "newest"}
          options={[
            { value: "newest", label: "Newest first" },
            { value: "title-asc", label: "Title A–Z" },
          ]}
        />
      </div>
      <Card className="overflow-hidden">
        {result.items.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Jobs in your workspace</caption>
              <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  {["Role", "Status", "Candidates", "Type"].map((h) => (
                    <th scope="col" key={h} className="px-6 py-4 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {result.items.map((j) => (
                  <tr
                    id={j.id}
                    key={j.id}
                    className={cn(
                      "hover:bg-muted/40",
                      param(params, "highlight") === j.id && "bg-accent/60",
                    )}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-start gap-3">
                        <div className="hidden shrink-0 rounded-lg border bg-background p-2.5 text-primary sm:block">
                          <BriefcaseBusiness className="size-4" />
                        </div>
                        <div className="min-w-48">
                          <Link
                            href={`/jobs/${j.id}`}
                            className="font-semibold hover:text-primary hover:underline"
                          >
                            {j.title}
                          </Link>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {j.department}
                          </p>
                          <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="size-3" />
                            {j.location}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-5">
                      <StatusBadge status={j.status} />
                      {j.archivedAt && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Archived
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-5 font-medium tabular-nums">
                      {j._count.applications}
                    </td>
                    <td className="whitespace-nowrap px-6 py-5">
                      <Badge variant="outline">{humanize(j.type)}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No matching jobs"
            description="Adjust the filters or create an opportunity for your next hire."
            icon={BriefcaseBusiness}
          >
            {editable && (
              <Button asChild>
                <Link href="/jobs/new">Create job</Link>
              </Button>
            )}
          </EmptyState>
        )}
      </Card>
      <Pagination path="/jobs" params={params} {...result} />
    </>
  );
}
