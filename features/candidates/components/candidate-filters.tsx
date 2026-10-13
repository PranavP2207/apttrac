import Link from "next/link";
import { param, type ListParams } from "@/lib/list-params";
import { humanize } from "@/lib/utils";
import { candidateSources } from "../validation";
import { stageKinds } from "../queries";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/shared/form-field";
export function CandidateFilters({
  params,
  jobs,
  tags,
}: {
  params: ListParams;
  jobs: { id: string; title: string }[];
  tags: { id: string; name: string }[];
}) {
  return (
    <form
      action="/candidates"
      className="mb-6 space-y-4 rounded-lg border bg-card p-4"
    >
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-40 flex-1">
          <FormField id="q" label="Search candidates">
            <Input
              id="q"
              name="q"
              defaultValue={param(params, "q")}
              placeholder="Name or email…"
            />
          </FormField>
        </div>
        <Button type="submit">Apply filters</Button>
        <Button variant="ghost" asChild>
          <Link href="/candidates">Reset</Link>
        </Button>
      </div>
      <details
        open={
          !![
            "jobId",
            "stage",
            "source",
            "tagId",
            "rating",
            "dateFrom",
            "dateTo",
            "archived",
          ].some((key) => param(params, key))
        }
      >
        <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
          More filters
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField id="jobId" label="Job">
            <Select
              id="jobId"
              name="jobId"
              defaultValue={param(params, "jobId")}
            >
              <option value="">All jobs</option>
              {jobs.map((j) => (
                <option value={j.id} key={j.id}>
                  {j.title}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField id="stage" label="Stage">
            <Select
              id="stage"
              name="stage"
              defaultValue={param(params, "stage")}
            >
              <option value="">All stages</option>
              {stageKinds.map((v) => (
                <option value={v} key={v}>
                  {humanize(v)}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField id="source" label="Source">
            <Select
              id="source"
              name="source"
              defaultValue={param(params, "source")}
            >
              <option value="">All sources</option>
              {candidateSources.map((v) => (
                <option value={v} key={v}>
                  {humanize(v)}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField id="tagId" label="Tag">
            <Select
              id="tagId"
              name="tagId"
              defaultValue={param(params, "tagId")}
            >
              <option value="">All tags</option>
              {tags.map((t) => (
                <option value={t.id} key={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField id="rating" label="Rating">
            <Select
              id="rating"
              name="rating"
              defaultValue={param(params, "rating")}
            >
              <option value="">Any rating</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} stars
                </option>
              ))}
            </Select>
          </FormField>
          <FormField id="dateFrom" label="Added from (UTC)">
            <Input
              id="dateFrom"
              name="dateFrom"
              type="date"
              defaultValue={param(params, "dateFrom")}
            />
          </FormField>
          <FormField id="dateTo" label="Added through (UTC)">
            <Input
              id="dateTo"
              name="dateTo"
              type="date"
              defaultValue={param(params, "dateTo")}
            />
          </FormField>
          <FormField id="archived" label="Show">
            <Select
              id="archived"
              name="archived"
              defaultValue={param(params, "archived") || "active"}
            >
              <option value="active">Active candidates</option>
              <option value="archived">Archived candidates</option>
            </Select>
          </FormField>
        </div>
      </details>
      {param(params, "sort") && (
        <input type="hidden" name="sort" value={param(params, "sort")} />
      )}
    </form>
  );
}
