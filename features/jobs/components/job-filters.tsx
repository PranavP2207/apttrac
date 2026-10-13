import Link from "next/link";
import { param, type ListParams } from "@/lib/list-params";
import { humanize } from "@/lib/utils";
import { jobStatuses, jobTypes } from "../validation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/shared/form-field";
export function JobFilters({ params }: { params: ListParams }) {
  return (
    <form
      action="/jobs"
      className="mb-6 grid items-end gap-4 rounded-lg border bg-card p-4 sm:grid-cols-2 xl:grid-cols-5"
    >
      <FormField id="q" label="Search jobs">
        <Input
          id="q"
          name="q"
          defaultValue={param(params, "q")}
          placeholder="Title, department, location…"
        />
      </FormField>
      <FormField id="status" label="Status">
        <Select
          id="status"
          name="status"
          defaultValue={param(params, "status")}
        >
          <option value="">All statuses</option>
          {jobStatuses.map((v) => (
            <option key={v} value={v}>
              {humanize(v)}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField id="type" label="Employment type">
        <Select id="type" name="type" defaultValue={param(params, "type")}>
          <option value="">All types</option>
          {jobTypes.map((v) => (
            <option key={v} value={v}>
              {humanize(v)}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField id="archived" label="Show">
        <Select
          id="archived"
          name="archived"
          defaultValue={param(params, "archived") || "active"}
        >
          <option value="active">Active jobs</option>
          <option value="archived">Archived jobs</option>
        </Select>
      </FormField>
      <div className="flex gap-2">
        <Button type="submit">Apply filters</Button>
        <Button variant="ghost" asChild>
          <Link href="/jobs">Reset</Link>
        </Button>
      </div>
      {param(params, "sort") && (
        <input type="hidden" name="sort" value={param(params, "sort")} />
      )}
    </form>
  );
}
