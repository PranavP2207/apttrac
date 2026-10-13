import Link from "next/link";
import { Plus, UsersRound } from "lucide-react";
import { requirePageUser } from "@/lib/auth/session";
import {
  listCandidates,
  candidateOptions,
} from "@/features/candidates/queries";
import { CandidateFilters } from "@/features/candidates/components/candidate-filters";
import { CandidateTable } from "@/features/candidates/components/candidate-table";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ListSort } from "@/components/shared/list-sort";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { param, listUrl, type ListParams } from "@/lib/list-params";
export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<ListParams>;
}) {
  const user = await requirePageUser(),
    params = await searchParams;
  const [result, options] = await Promise.all([
    listCandidates(params),
    candidateOptions(),
  ]);
  const editable = user.role !== "HIRING_MANAGER";
  return (
    <>
      <PageHeader
        title="Candidates"
        description="Good people. Meaningful conversations. New possibilities."
      >
        {editable && (
          <Button asChild>
            <Link href="/candidates/new">
              <Plus />
              Add candidate
            </Link>
          </Button>
        )}
      </PageHeader>
      <CandidateFilters
        key={`filters-${JSON.stringify(params)}`}
        params={params}
        {...options}
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {result.total} {result.total === 1 ? "person" : "people"} match your
          view
        </p>
        <ListSort
          label="Sort candidates"
          value={param(params, "sort") || "newest"}
          options={[
            { value: "newest", label: "Newest first" },
            { value: "name-asc", label: "Name A–Z" },
            { value: "rating-desc", label: "Highest rated" },
          ]}
        />
      </div>
      {result.items.length ? (
        <CandidateTable
          key={`table-${JSON.stringify(params)}`}
          candidates={result.items}
          tags={options.tags}
          editable={editable && param(params, "archived") !== "archived"}
          highlight={param(params, "highlight")}
          exportUrl={listUrl("/api/candidates/export", params, { page: "" })}
        />
      ) : (
        <Card>
          <EmptyState
            title="No matching candidates"
            description="Try broader filters, or add someone new to your talent pool."
            icon={UsersRound}
          >
            {editable && (
              <Button asChild>
                <Link href="/candidates/new">Add candidate</Link>
              </Button>
            )}
          </EmptyState>
        </Card>
      )}
      <Pagination path="/candidates" params={params} {...result} />
    </>
  );
}
