import { Star, UsersRound } from "lucide-react";
import { requirePageUser } from "@/lib/auth/session";
import { listCandidates } from "@/features/candidates/queries";
import { PageHeader } from "@/components/shared/page-header";
import { ListSearch } from "@/components/shared/list-search";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, humanize, initials } from "@/lib/utils";
export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; highlight?: string }>;
}) {
  await requirePageUser();
  const params = await searchParams;
  const candidates = await listCandidates(params.q);
  return (
    <>
      <PageHeader
        title="Candidates"
        description="Good people. Meaningful conversations. New possibilities."
      >
        <ListSearch value={params.q} label="Search candidates" />
      </PageHeader>
      <p className="mb-5 text-sm text-muted-foreground">
        {candidates.length} {candidates.length === 1 ? "person" : "people"} in
        your workspace
      </p>
      <Card className="overflow-hidden">
        {candidates.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">
                Candidates visible to your role
              </caption>
              <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  {[
                    "Candidate",
                    "Applications",
                    "Source",
                    "Rating",
                    "Tags",
                  ].map((heading) => (
                    <th
                      scope="col"
                      className="px-5 py-4 font-medium"
                      key={heading}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {candidates.map((candidate) => (
                  <tr
                    id={candidate.id}
                    key={candidate.id}
                    className={cn(
                      "hover:bg-muted/40",
                      params.highlight === candidate.id && "bg-accent/60",
                    )}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarFallback className="text-xs">
                            {initials(candidate.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-40">
                          <p className="font-semibold">{candidate.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {candidate.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="min-w-52 px-5 py-4">
                      <div className="space-y-2">
                        {candidate.applications.map((application, index) => (
                          <div key={index}>
                            <p className="text-xs font-medium">
                              {application.job.title}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {application.stage.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-xs text-muted-foreground">
                      {humanize(candidate.source)}
                    </td>
                    <td className="px-5 py-4">
                      {candidate.rating ? (
                        <span className="flex items-center gap-1.5 text-sm">
                          <Star
                            className="size-3.5 fill-amber-400 text-amber-400"
                            aria-hidden="true"
                          />
                          <span
                            aria-label={`${candidate.rating} out of 5 stars`}
                          >
                            {candidate.rating}
                            <span className="text-xs text-muted-foreground">
                              /5
                            </span>
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Unrated
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex min-w-28 flex-wrap gap-1.5">
                        {candidate.tags.map(({ tag }) => (
                          <Badge key={tag.name} variant="secondary">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title={params.q ? "No matching candidates" : "No candidates yet"}
            description={
              params.q
                ? "Try another name or email address."
                : "Candidates for your assigned roles will appear here."
            }
            icon={UsersRound}
          />
        )}
      </Card>
    </>
  );
}
